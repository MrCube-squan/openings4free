import { useState, useEffect, useRef, useCallback } from 'react';

interface StockfishEval {
  cp: number;       // centipawns, always from White's perspective
  mate: number | null;  // mate in N, positive = White mates, negative = Black mates
  depth: number;
}

const STOCKFISH_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/16.0.0/stockfish.js';

let sharedWorker: Worker | null = null;
let workerRefCount = 0;
let currentCallback: ((eval_: StockfishEval) => void) | null = null;
let isReady = false;
let readyCallbacks: Array<() => void> = [];

const getWorker = (): Worker => {
  if (!sharedWorker) {
    sharedWorker = new Worker(STOCKFISH_CDN);
    
    sharedWorker.onmessage = (e: MessageEvent) => {
      const line = typeof e.data === 'string' ? e.data : '';
      
      if (line === 'readyok') {
        isReady = true;
        readyCallbacks.forEach(cb => cb());
        readyCallbacks = [];
        return;
      }
      
      // Parse "info depth X ... score cp Y" or "info depth X ... score mate Y"
      if (line.startsWith('info') && line.includes(' score ')) {
        const depthMatch = line.match(/\bdepth (\d+)/);
        const cpMatch = line.match(/\bscore cp (-?\d+)/);
        const mateMatch = line.match(/\bscore mate (-?\d+)/);
        
        if (!depthMatch) return;
        const depth = parseInt(depthMatch[1], 10);
        
        // Only use depth >= 6 for stability
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

        // Stockfish reports score from the side to move's perspective.
        // We need to determine whose turn it is from the current FEN to normalize.
        // The callback handler will normalize based on the FEN's side to move.
        if (currentCallback) {
          currentCallback({ cp: cpVal, mate: mateVal, depth });
        }
      }
    };

    sharedWorker.postMessage('uci');
    sharedWorker.postMessage('isready');
  }
  workerRefCount++;
  return sharedWorker;
};

const releaseWorker = () => {
  workerRefCount--;
  if (workerRefCount <= 0 && sharedWorker) {
    sharedWorker.postMessage('quit');
    sharedWorker.terminate();
    sharedWorker = null;
    workerRefCount = 0;
    isReady = false;
    currentCallback = null;
  }
};

export const useStockfish = (fen: string) => {
  const [evaluation, setEvaluation] = useState<StockfishEval>({ cp: 20, mate: null, depth: 0 });
  const workerRef = useRef<Worker | null>(null);
  const fenRef = useRef(fen);

  useEffect(() => {
    workerRef.current = getWorker();
    return () => releaseWorker();
  }, []);

  const analyze = useCallback((fenToAnalyze: string) => {
    const worker = workerRef.current;
    if (!worker) return;

    fenRef.current = fenToAnalyze;

    // Determine side to move from FEN
    const sideToMove = fenToAnalyze.split(' ')[1]; // 'w' or 'b'

    currentCallback = (raw: StockfishEval) => {
      // Normalize: Stockfish reports from side-to-move perspective
      // We always want from White's perspective
      if (fenRef.current !== fenToAnalyze) return; // stale
      
      const normalized: StockfishEval = {
        depth: raw.depth,
        mate: raw.mate !== null 
          ? (sideToMove === 'b' ? -raw.mate : raw.mate)
          : null,
        cp: sideToMove === 'b' ? -raw.cp : raw.cp,
      };
      
      setEvaluation(prev => {
        // Only update if deeper or same depth
        if (normalized.depth >= prev.depth || normalized.mate !== null) {
          return normalized;
        }
        return prev;
      });
    };

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
    // Reset depth for new position so we accept lower-depth results
    setEvaluation(prev => ({ ...prev, depth: 0 }));
    analyze(fen);

    return () => {
      workerRef.current?.postMessage('stop');
    };
  }, [fen, analyze]);

  return evaluation;
};
