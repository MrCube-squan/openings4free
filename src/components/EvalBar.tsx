import { useStockfish } from '@/hooks/useStockfish';

interface EvalBarProps {
  fen: string;
  orientation: 'white' | 'black';
}

const EvalBar = ({ fen, orientation }: EvalBarProps) => {
  const { cp, mate } = useStockfish(fen);

  // Stable bar fill: clamp to ±1000cp, map to 0–100%
  let whitePercent: number;
  let evalText: string;

  if (mate !== null) {
    whitePercent = mate > 0 ? 97 : 3;
    evalText = `M${Math.abs(mate)}`;
  } else {
    const clamped = Math.max(-1000, Math.min(1000, cp));
    whitePercent = (clamped + 1000) / 2000 * 100;
    // Clamp display range
    whitePercent = Math.min(97, Math.max(3, whitePercent));
    const pawns = cp / 100;
    evalText = pawns >= 0 ? `+${pawns.toFixed(1)}` : pawns.toFixed(1);
  }

  const displayPercent = orientation === 'white' ? whitePercent : 100 - whitePercent;
  const isWhiteWinning = mate !== null ? mate > 0 : cp >= 0;
  const textOnWhiteSide = orientation === 'white' ? isWhiteWinning : !isWhiteWinning;

  return (
    <div className="flex flex-col w-7 rounded-md overflow-hidden border border-border relative select-none" style={{ height: '100%', minHeight: '300px' }}>
      {/* Black side */}
      <div
        className="bg-zinc-800 transition-all duration-700 ease-out"
        style={{ height: `${100 - displayPercent}%` }}
      />
      {/* White side */}
      <div
        className="bg-zinc-100 transition-all duration-700 ease-out flex-1"
      />
      {/* Eval text */}
      <div
        className={`absolute left-0 right-0 flex justify-center z-10 ${
          textOnWhiteSide ? 'bottom-0.5' : 'top-0.5'
        }`}
      >
        <span
          className={`text-[11px] font-black leading-none px-0.5 ${
            textOnWhiteSide ? 'text-zinc-800' : 'text-zinc-100'
          }`}
        >
          {evalText}
        </span>
      </div>
    </div>
  );
};

export default EvalBar;
