import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';

interface EvalBarProps {
  fen: string;
  orientation: 'white' | 'black';
}

const PIECE_VALUES: Record<string, number> = {
  p: 1, n: 3, b: 3.25, r: 5, q: 9, k: 0,
};

const evaluateMaterial = (fen: string): number => {
  try {
    const game = new Chess(fen);
    const board = game.board();
    let score = 0;
    for (const row of board) {
      for (const sq of row) {
        if (sq) {
          const val = PIECE_VALUES[sq.type] || 0;
          score += sq.color === 'w' ? val : -val;
        }
      }
    }
    return score;
  } catch {
    return 0;
  }
};

interface EvalResult {
  cp?: number;
  mate?: number;
}

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const EvalBar = ({ fen, orientation }: EvalBarProps) => {
  const [displayCp, setDisplayCp] = useState(20);
  const [mateValue, setMateValue] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, EvalResult>>(new Map());
  const fluctuationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const baseRef = useRef(20); // tracks the "true" cp to fluctuate around

  const stopFluctuation = () => {
    if (fluctuationRef.current) {
      clearInterval(fluctuationRef.current);
      fluctuationRef.current = null;
    }
  };

  const startFluctuation = (baseCp: number, amplitude: number = 6) => {
    stopFluctuation();
    baseRef.current = baseCp;
    fluctuationRef.current = setInterval(() => {
      const jitter = (Math.random() - 0.5) * amplitude * 2;
      setDisplayCp(Math.round(baseRef.current + jitter));
    }, 1800);
  };

  useEffect(() => {
    abortRef.current?.abort();
    stopFluctuation();
    setMateValue(null);

    const cached = cacheRef.current.get(fen);
    if (cached) {
      if (cached.mate !== undefined) {
        setMateValue(cached.mate);
        setDisplayCp(cached.mate > 0 ? 9999 : -9999);
      } else {
        const cp = cached.cp ?? 0;
        setDisplayCp(cp);
        startFluctuation(cp, 5);
      }
      return () => stopFluctuation();
    }

    // Immediate material fallback
    const isStartPos = fen === START_FEN;
    const materialCp = isStartPos ? 20 : Math.round(evaluateMaterial(fen) * 100);
    setDisplayCp(materialCp);
    startFluctuation(materialCp, 8);

    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=1`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.pvs && data.pvs[0]) {
          const pv = data.pvs[0];
          const result: EvalResult = pv.mate !== undefined
            ? { mate: pv.mate }
            : { cp: pv.cp ?? 0 };
          cacheRef.current.set(fen, result);

          if (result.mate !== undefined) {
            stopFluctuation();
            setMateValue(result.mate);
            setDisplayCp(result.mate > 0 ? 9999 : -9999);
          } else {
            const cp = result.cp ?? 0;
            setDisplayCp(cp);
            startFluctuation(cp, 5);
          }
        }
      } catch {
        // Keep material fallback
      }
    }, 800);

    return () => {
      clearTimeout(timer);
      controller.abort();
      stopFluctuation();
    };
  }, [fen]);

  // Convert eval to percentage (white's perspective)
  let whitePercent: number;
  let evalText: string;

  if (mateValue !== null) {
    whitePercent = mateValue > 0 ? 97 : 3;
    evalText = `M${Math.abs(mateValue)}`;
  } else {
    // Sigmoid-like mapping: each 100cp ≈ 10% shift, clamped
    whitePercent = Math.min(97, Math.max(3, 50 + (displayCp / 100) * 10));
    const pawns = displayCp / 100;
    evalText = pawns >= 0 ? `+${pawns.toFixed(1)}` : pawns.toFixed(1);
  }

  const displayPercent = orientation === 'white' ? whitePercent : 100 - whitePercent;

  const isWhiteWinning = mateValue !== null ? mateValue > 0 : displayCp >= 0;
  const textOnWhiteSide = orientation === 'white' ? isWhiteWinning : !isWhiteWinning;

  return (
    <div className="flex flex-col w-8 rounded-lg overflow-hidden border border-border relative" style={{ height: '100%', minHeight: '300px' }}>
      <div
        className="bg-zinc-800 transition-all duration-500 ease-out"
        style={{ height: `${100 - displayPercent}%` }}
      />
      <div
        className="bg-zinc-100 transition-all duration-500 ease-out flex-1"
      />
      <div
        className={`absolute left-0 right-0 flex justify-center ${
          textOnWhiteSide ? 'bottom-1' : 'top-1'
        }`}
      >
        <span
          className={`text-[10px] font-bold leading-none ${
            textOnWhiteSide ? 'text-zinc-800' : 'text-zinc-100'
          }`}
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
          }}
        >
          {evalText}
        </span>
      </div>
    </div>
  );
};

export default EvalBar;
