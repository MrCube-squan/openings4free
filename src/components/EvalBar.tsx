import { useStockfish } from '@/hooks/useStockfish';

interface EvalBarProps {
  fen: string;
  orientation: 'white' | 'black';
}

const EvalBar = ({ fen, orientation }: EvalBarProps) => {
  const { cp, mate } = useStockfish(fen);

  const isMate = mate !== null;
  let whitePercent: number;
  let evalText: string;

  if (isMate) {
    whitePercent = mate > 0 ? 100 : 0;
    evalText = `M${Math.abs(mate)}`;
  } else {
    whitePercent = 50 + 50 * Math.tanh(cp / 300);
    const pawns = cp / 100;
    evalText = pawns >= 0 ? `+${pawns.toFixed(1)}` : pawns.toFixed(1);
  }

  // Board orientation: white = white at bottom, black = black at bottom
  // Bar segments are stacked top-to-bottom; bottom segment shows the side at bottom of board.
  const whiteOnBottom = orientation === 'white';
  const isWhiteWinning = isMate ? mate > 0 : cp >= 0;
  const textOnWhiteSide = whiteOnBottom ? isWhiteWinning : !isWhiteWinning;

  // Top segment height: opposite-color portion
  const topHeight = whiteOnBottom ? 100 - whitePercent : whitePercent;
  const bottomHeight = 100 - topHeight;

  const transitionClass = isMate
    ? ''
    : 'transition-all duration-700 ease-out';

  return (
    <div className="relative flex w-11 shrink-0 select-none" style={{ height: '100%', minHeight: '300px' }}>
      <div className="flex w-full flex-col overflow-hidden rounded-md border border-border">
        <div
          className={`bg-background ${transitionClass}`}
          style={{ height: `${topHeight}%` }}
        />
        <div
          className={`bg-foreground ${transitionClass}`}
          style={{ height: `${bottomHeight}%` }}
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
