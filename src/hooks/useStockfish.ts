import { useState, useEffect, useRef, useCallback } from 'react';

interface StockfishEval {
  cp: number;
  mate: number | null;
  depth: number;
}

const STOCKFISH_CDN = 'https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js';

let sharedWorker: Worker | null = null;
let workerRefCount = 0;
let isReady = false;
let readyCallbacks: Array<() => void> = [];
let workerInitPromise: Promise<Worker> | null = null;

// All active subscribers; worker fans out to each one
const subscribers = new Set<(eval_: StockfishEval) => void>();

const initWorker = (): Promise<Worker> => {
  if (workerInitPromise) return workerInitPromise;

  workerInitPromise = fetch(STOCKFISH_CDN)
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const worker = new Worker(url);

      worker.onmessage = (e: MessageEvent) => {
        const line = typeof e.data === 'string' ? e.data : '';

        if (line === 'readyok') {
          isReady = true;
          readyCallbacks.forEach(cb => cb());
          readyCallbacks = [];
          return;
        }

        if (line.startsWith('info') && line.includes(' score ')) {
          const depthMatch = line.match(/\bdepth (\d+)/);
          const cpMatch = line.match(/\bscore cp (-?\d+)/);
          const mateMatch = line.match(/\bscore mate (-?\d+)/);

          if (!depthMatch) return;
          const depth = parseInt(depthMatch[1], 10);
          if (depth < 6) return;

          let cpVal = 0;
          let mateVal: number | null = null;

          if (mateMatch) {
            mateVal = parseInt(mateMatch[1], 10);
          } else if (cpMatch) {
            cpVal = parseInt(cpMatch[1], 10);
          } else {
            return;
          }

          const evalResult = { cp: cpVal, mate: mateVal, depth };
          subscribers.forEach(cb => cb(evalResult));
        }
      };

      worker.postMessage('uci');
      worker.postMessage('isready');

      sharedWorker = worker;
      return worker;
    });

  return workerInitPromise;
};

const getWorker = async (): Promise<Worker> => {
  workerRefCount++;
  return initWorker();
};

const releaseWorker = () => {
  workerRefCount--;
  if (workerRefCount <= 0 && sharedWorker) {
    sharedWorker.postMessage('quit');
    sharedWorker.terminate();
    sharedWorker = null;
    workerRefCount = 0;
    isReady = false;
    workerInitPromise = null;
  }
};

export const useStockfish = (fen: string) => {
  const [evaluation, setEvaluation] = useState<StockfishEval>({ cp: 30, mate: null, depth: 0 });
  const workerRef = useRef<Worker | null>(null);
  const fenRef = useRef(fen);
  const [workerReady, setWorkerReady] = useState(false);

  // Subscribe this instance to worker messages
  useEffect(() => {
    const handler = (raw: StockfishEval) => {
      const currentFen = fenRef.current;
      const sideToMove = currentFen.split(' ')[1];

      const normalized: StockfishEval = {
        depth: raw.depth,
        mate: raw.mate !== null
          ? (sideToMove === 'b' ? -raw.mate : raw.mate)
          : null,
        cp: sideToMove === 'b' ? -raw.cp : raw.cp,
      };

      setEvaluation(prev => {
        if (normalized.depth >= prev.depth || normalized.mate !== null) {
          return normalized;
        }
        return prev;
      });
    };

    subscribers.add(handler);
    return () => { subscribers.delete(handler); };
  }, []);

  // Init worker
  useEffect(() => {
    let cancelled = false;
    getWorker().then(w => {
      if (!cancelled) {
        workerRef.current = w;
        setWorkerReady(true);
      }
    });
    return () => {
      cancelled = true;
      releaseWorker();
    };
  }, []);

  const analyze = useCallback((fenToAnalyze: string) => {
    const worker = workerRef.current;
    if (!worker) return;

    fenRef.current = fenToAnalyze;

    const run = () => {
      worker.postMessage('stop');
      worker.postMessage(`position fen ${fenToAnalyze}`);
      worker.postMessage('go depth 18');
    };

    if (isReady) {
      run();
    } else {
      readyCallbacks.push(run);
    }
  }, []);

  useEffect(() => {
    setEvaluation(prev => ({ ...prev, depth: 0 }));
    analyze(fen);
    return () => { workerRef.current?.postMessage('stop'); };
  }, [fen, analyze, workerReady]);

  return evaluation;
};
