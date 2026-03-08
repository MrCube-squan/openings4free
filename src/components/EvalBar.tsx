import { useStockfish } from '@/hooks/useStockfish';

interface EvalBarProps {
  fen: string;
  orientation: 'white' | 'black';
}

const MAX_EVAL = 5.0;

const EvalBar = ({ fen, orientation }: EvalBarProps) => {
  const { cp, mate, depth } = useStockfish(fen);

  // Convert eval to bar percentage and text
  let whitePercent: number;
  let evalText: string;

  if (mate !== null) {
    whitePercent = mate > 0 ? 97 : 3;
    evalText = `M${Math.abs(mate)}`;
  } else {
    const pawns = cp / 100;
    const clampedPawns = Math.max(-MAX_EVAL, Math.min(MAX_EVAL, pawns));
    whitePercent = Math.min(97, Math.max(3, 50 + (clampedPawns / MAX_EVAL) * 47));
    evalText = pawns >= 0 ? `+${clampedPawns.toFixed(1)}` : clampedPawns.toFixed(1);
  }

  const displayPercent = orientation === 'white' ? whitePercent : 100 - whitePercent;
  const isWhiteWinning = mate !== null ? mate > 0 : cp >= 0;
  const textOnWhiteSide = orientation === 'white' ? isWhiteWinning : !isWhiteWinning;

  return (
    <div className="flex flex-col w-8 rounded-lg overflow-hidden border border-border relative" style={{ height: '100%', minHeight: '300px' }}>
      <div
        className="bg-zinc-800 transition-all duration-300 ease-out"
        style={{ height: `${100 - displayPercent}%` }}
      />
      <div
        className="bg-zinc-100 transition-all duration-300 ease-out flex-1"
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
