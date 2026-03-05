import { useMemo } from 'react';
import { Chess } from 'chess.js';

interface EvalBarProps {
  fen: string;
  orientation: 'white' | 'black';
}

// Material values
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

const EvalBar = ({ fen, orientation }: EvalBarProps) => {
  const evaluation = useMemo(() => evaluateMaterial(fen), [fen]);

  // Convert eval to percentage (clamped between 5% and 95%)
  // Each pawn ≈ ~6% shift from 50%
  const whitePercent = Math.min(95, Math.max(5, 50 + evaluation * 6));
  const displayPercent = orientation === 'white' ? whitePercent : 100 - whitePercent;

  const evalText = evaluation > 0 ? `+${evaluation}` : evaluation === 0 ? '0' : `${evaluation}`;

  return (
    <div className="hidden lg:flex flex-col w-6 rounded-lg overflow-hidden border border-border relative" style={{ height: '100%' }}>
      {/* Black side (top when white orientation) */}
      <div
        className="bg-zinc-800 transition-all duration-500 ease-out"
        style={{ height: `${100 - displayPercent}%` }}
      />
      {/* White side (bottom when white orientation) */}
      <div
        className="bg-zinc-100 transition-all duration-500 ease-out flex-1"
      />
      {/* Eval text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`text-[9px] font-bold ${
            evaluation >= 0 ? 'text-zinc-800' : 'text-zinc-100'
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
