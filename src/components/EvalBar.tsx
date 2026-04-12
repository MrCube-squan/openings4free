import { useStockfish } from '@/hooks/useStockfish';

interface EvalBarProps {
  fen: string;
  orientation: 'white' | 'black';
}

const EvalBar = ({ fen, orientation }: EvalBarProps) => {
  const { cp, mate } = useStockfish(fen);

  let whitePercent: number;
  let evalText: string;

  if (mate !== null) {
    whitePercent = mate > 0 ? 97 : 3;
    evalText = `M${Math.abs(mate)}`;
  } else {
    const clamped = Math.max(-1000, Math.min(1000, cp));
    whitePercent = ((clamped + 1000) / 2000) * 100;
    whitePercent = Math.min(97, Math.max(3, whitePercent));

    const pawns = cp / 100;
    evalText = pawns >= 0 ? `+${pawns.toFixed(1)}` : pawns.toFixed(1);
  }

  const displayPercent = orientation === 'white' ? whitePercent : 100 - whitePercent;
  const isWhiteWinning = mate !== null ? mate > 0 : cp >= 0;
  const textOnWhiteSide = orientation === 'white' ? isWhiteWinning : !isWhiteWinning;

  return (
    <div className="relative flex w-11 shrink-0 select-none" style={{ height: '100%', minHeight: '300px' }}>
      <div className="flex w-full flex-col overflow-hidden rounded-md border border-border">
        <div
          className="bg-background transition-all duration-700 ease-out"
          style={{ height: `${100 - displayPercent}%` }}
        />
        <div
          className="flex-1 bg-foreground transition-all duration-700 ease-out"
          style={{ height: `${displayPercent}%` }}
        />
      </div>

      <div
        className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 ${
          textOnWhiteSide ? 'bottom-1' : 'top-1'
        }`}
      >
        <span className="inline-flex min-w-[2.75rem] items-center justify-center rounded-sm border border-border bg-card/95 px-1 py-0.5 font-mono text-xs font-bold leading-none text-foreground shadow-sm backdrop-blur-sm">
          {evalText}
        </span>
      </div>
    </div>
  );
};

export default EvalBar;
