import { useState, useEffect, useRef, useCallback } from 'react';

interface StockfishEval {
  cp: number;
  mate: number | null;
}

const STOCKFISH_CDN = 'https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js';
const TARGET_DEPTH = 18;

let sharedWorker: Worker | null = null;
let workerRefCount = 0;
let isReady = false;
let readyCallbacks: Array<() => void> = [];
let workerInitPromise: Promise<Worker> | null = null;

// Each subscriber receives the final eval for a completed analysis
const subscribers = new Set<(eval_: StockfishEval & { requestId: number }) => void>();

let currentGlobalRequestId = 0;
let pendingEval: (StockfishEval & { requestId: number }) | null = null;

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

          // Store the best result so far for the current request
          pendingEval = { cp: cpVal, mate: mateVal, requestId: currentGlobalRequestId };

          // If we've reached target depth or found mate, emit immediately
          if (depth >= TARGET_DEPTH || mateVal !== null) {
            subscribers.forEach(cb => cb(pendingEval!));
            pendingEval = null;
          }
        }

        // When engine finishes (bestmove), emit whatever we have
        if (line.startsWith('bestmove') && pendingEval) {
          subscribers.forEach(cb => cb(pendingEval!));
          pendingEval = null;
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
  const [evaluation, setEvaluation] = useState<StockfishEval>({ cp: 30, mate: null });
  const workerRef = useRef<Worker | null>(null);
  const fenRef = useRef(fen);
  const requestIdRef = useRef(0);
  const [workerReady, setWorkerReady] = useState(false);

  // Subscribe this instance
  useEffect(() => {
    const handler = (raw: StockfishEval & { requestId: number }) => {
      // Discard stale results
      if (raw.requestId !== requestIdRef.current) return;

      const currentFen = fenRef.current;
      const sideToMove = currentFen.split(' ')[1];

      // Stockfish reports score from side-to-move's perspective; normalize to White's perspective.
      const normalized: StockfishEval = {
        mate: raw.mate !== null
          ? (sideToMove === 'b' ? -raw.mate : raw.mate)
          : null,
        cp: sideToMove === 'b' ? -raw.cp : raw.cp,
      };

      setEvaluation(normalized);
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
    const id = ++currentGlobalRequestId;
    requestIdRef.current = id;

    const run = () => {
      worker.postMessage('stop');
      worker.postMessage(`position fen ${fenToAnalyze}`);
      worker.postMessage(`go depth ${TARGET_DEPTH}`);
    };

    if (isReady) {
      run();
    } else {
      readyCallbacks.push(run);
    }
  }, []);

  // Trigger analysis on fen change — try Lichess cloud eval first, fall back to Stockfish
  useEffect(() => {
    let cancelled = false;
    fenRef.current = fen;

    const tryLichess = async () => {
      try {
        const res = await fetch(
          `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}`
        );
        if (cancelled) return false;
        if (!res.ok) return false;
        const data = await res.json();
        const pv = data?.pvs?.[0];
        if (!pv) return false;

        const sideToMove = fen.split(' ')[1];
        const rawCp = typeof pv.cp === 'number' ? pv.cp : 0;
        const rawMate = typeof pv.mate === 'number' ? pv.mate : null;

        const normalized: StockfishEval = {
          cp: sideToMove === 'b' ? -rawCp : rawCp,
          mate: rawMate !== null ? (sideToMove === 'b' ? -rawMate : rawMate) : null,
        };

        if (!cancelled) {
          // Bump request id so any in-flight Stockfish results are discarded
          requestIdRef.current = ++currentGlobalRequestId;
          workerRef.current?.postMessage('stop');
          setEvaluation(normalized);
        }
        return true;
      } catch {
        return false;
      }
    };

    tryLichess().then((hit) => {
      if (cancelled) return;
      if (!hit) analyze(fen);
    });

    return () => {
      cancelled = true;
      workerRef.current?.postMessage('stop');
    };
  }, [fen, analyze, workerReady]);

  return evaluation;
};
