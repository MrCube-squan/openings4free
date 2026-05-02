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

  // Board orientation: white = white pieces at bottom, black = black pieces at bottom.
  // Each segment is colored to match its side (white piece side = light, black piece side = dark).
  const whiteOnBottom = orientation === 'white';
  const isWhiteWinning = isMate ? mate > 0 : cp >= 0;
  const textOnWhiteSide = whiteOnBottom ? isWhiteWinning : !isWhiteWinning;

  // Heights: white portion vs black portion
  const blackHeight = 100 - whitePercent;
  const topHeight = whiteOnBottom ? blackHeight : whitePercent;
  const bottomHeight = 100 - topHeight;

  // Top is always the opposite color of bottom
  const topColor = whiteOnBottom ? '#1a1a1a' : '#f5f5f5';
  const bottomColor = whiteOnBottom ? '#f5f5f5' : '#1a1a1a';

  const transitionClass = isMate
    ? ''
    : 'transition-all duration-700 ease-out';

  return (
    <div className="relative flex w-11 shrink-0 select-none" style={{ height: '100%', minHeight: '300px' }}>
      <div className="flex w-full flex-col overflow-hidden rounded-md border border-border">
        <div
          className={transitionClass}
          style={{ height: `${topHeight}%`, backgroundColor: topColor }}
        />
        <div
          className={transitionClass}
          style={{ height: `${bottomHeight}%`, backgroundColor: bottomColor }}
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
