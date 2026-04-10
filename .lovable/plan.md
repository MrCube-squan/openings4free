

## Add Eval Bar to Chess Trainer

### What it does
A vertical bar appears beside the chessboard showing real-time position evaluation powered by Stockfish running entirely in the browser via a Web Worker. Already implemented — just needs integration.

### How Stockfish runs
- `useStockfish.ts` fetches `stockfish.js` from CDN, creates a blob URL, and runs it as a **Web Worker**
- Analyzes to depth 18 in background thread — no UI freezing
- Single shared worker across components (reference counted, auto-cleaned)
- Eval scores normalized to White's perspective

### Changes

**`src/components/ChessTrainer.tsx`**
- Import `EvalBar`
- Render it inside the board flex container, to the left of the chessboard
- Pass `game.fen()` and `playerColor` as props

That's it — one file, ~5 lines of code. The `EvalBar` and `useStockfish` are already complete.

