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
  cp?: number;   // centipawns from white's perspective
  mate?: number; // mate in N from white's perspective
}

const EvalBar = ({ fen, orientation }: EvalBarProps) => {
  const [evalResult, setEvalResult] = useState<EvalResult>({ cp: 0 });
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, EvalResult>>(new Map());

  useEffect(() => {
    // Cancel previous request
    abortRef.current?.abort();

    const cached = cacheRef.current.get(fen);
    if (cached) {
      setEvalResult(cached);
      return;
    }

    // Use material eval as immediate fallback
    const materialEval = evaluateMaterial(fen);
    setEvalResult({ cp: materialEval * 100 });

    const controller = new AbortController();
    abortRef.current = controller;

    // Debounce to avoid Lichess rate limiting (429)
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
          setEvalResult(result);
        }
      } catch {
        // Keep material fallback
      }
    }, 800);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fen]);

  // Convert eval to percentage (white's perspective)
  let whitePercent: number;
  let evalText: string;

  if (evalResult.mate !== undefined) {
    const m = evalResult.mate;
    whitePercent = m > 0 ? 97 : 3;
    evalText = m > 0 ? `M${m}` : `M${Math.abs(m)}`;
  } else {
    const cp = evalResult.cp ?? 0;
    // Sigmoid-like mapping: each 100cp ≈ 10% shift, clamped
    whitePercent = Math.min(97, Math.max(3, 50 + (cp / 100) * 10));
    const pawns = cp / 100;
    evalText = pawns > 0 ? `+${pawns.toFixed(1)}` : pawns === 0 ? '0.0' : pawns.toFixed(1);
  }

  // White always at bottom when orientation=white, at top when orientation=black
  // displayPercent = how much of the bar is white (from bottom)
  const displayPercent = orientation === 'white' ? whitePercent : 100 - whitePercent;

  // Position eval text on the winning side
  const isWhiteWinning = evalResult.mate !== undefined ? evalResult.mate > 0 : (evalResult.cp ?? 0) >= 0;
  const textOnWhiteSide = orientation === 'white' ? isWhiteWinning : !isWhiteWinning;

  return (
    <div className="flex flex-col w-8 rounded-lg overflow-hidden border border-border relative" style={{ height: '100%', minHeight: '300px' }}>
      {/* Dark side (top when white orientation) */}
      <div
        className="bg-zinc-800 transition-all duration-500 ease-out"
        style={{ height: `${100 - displayPercent}%` }}
      />
      {/* Light side (bottom when white orientation) */}
      <div
        className="bg-zinc-100 transition-all duration-500 ease-out flex-1"
      />
      {/* Eval text - positioned at bottom (white side) or top (black side) */}
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
