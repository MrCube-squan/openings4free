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

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Module-level cache persists across component remounts
const evalCache = new Map<string, { cp?: number; mate?: number }>();

const EvalBar = ({ fen, orientation }: EvalBarProps) => {
  const [cp, setCp] = useState(20);
  const [mate, setMate] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();

    const cached = evalCache.get(fen);
    if (cached) {
      setMate(cached.mate ?? null);
      setCp(cached.cp ?? 0);
      return;
    }

    // Immediate material fallback
    setMate(null);
    const isStartPos = fen === START_FEN;
    const materialCp = isStartPos ? 20 : Math.round(evaluateMaterial(fen) * 100);
    setCp(materialCp);

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
          const result = pv.mate !== undefined
            ? { mate: pv.mate as number }
            : { cp: (pv.cp ?? 0) as number };
          evalCache.set(fen, result);
          setMate(result.mate ?? null);
          setCp(result.cp ?? 0);
        }
      } catch {
        // Keep material fallback
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fen]);

  // Convert eval to bar percentage and text
  let whitePercent: number;
  let evalText: string;

  if (mate !== null) {
    whitePercent = mate > 0 ? 97 : 3;
    evalText = `M${Math.abs(mate)}`;
  } else {
    whitePercent = Math.min(97, Math.max(3, 50 + (cp / 100) * 10));
    const pawns = cp / 100;
    evalText = pawns >= 0 ? `+${pawns.toFixed(1)}` : pawns.toFixed(1);
  }

  const displayPercent = orientation === 'white' ? whitePercent : 100 - whitePercent;
  const isWhiteWinning = mate !== null ? mate > 0 : cp >= 0;
  const textOnWhiteSide = orientation === 'white' ? isWhiteWinning : !isWhiteWinning;

  return (
    <div className="flex flex-col w-8 rounded-lg overflow-hidden border border-border relative" style={{ height: '100%', minHeight: '300px' }}>
      <div
        className="bg-zinc-800 transition-all duration-700 ease-out"
        style={{ height: `${100 - displayPercent}%` }}
      />
      <div
        className="bg-zinc-100 transition-all duration-700 ease-out flex-1"
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
