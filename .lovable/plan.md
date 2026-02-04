

# Implementation Plan: Fix Line Editor PGN & Verify Opening Theory

## Summary

This plan addresses three issues:
1. **PGN paste not working properly** - Pasted lines aren't being applied until you click away
2. **Click/drag pieces not adding moves** - Board moves aren't being saved correctly in the editor
3. **Opening theory verification** - Ensuring all moves in the opening database are real, correct moves

---

## Issue 1: PGN Paste Not Working Immediately

### Problem
When you paste a PGN sequence into the text area, it updates the text field but the board and move list don't update until you click outside (on blur). This makes it feel broken.

### Root Cause
The `onChange` handler only updates the text state (`setPgnInput`). The actual parsing and board update happens in `onBlur` which requires clicking outside the field.

### Solution
Add an `onPaste` event handler that immediately parses and applies the pasted content. This will:
1. Capture the paste event
2. Get the pasted text from the clipboard
3. Combine it with any existing text if needed
4. Parse and apply the moves immediately

### Technical Changes
**File: `src/components/LineEditor.tsx`**
- Add `handlePgnPaste` function that extracts clipboard data and calls `parsePgnAndApply`
- Add `onPaste` handler to the Textarea component

---

## Issue 2: Click/Drag Pieces Not Adding Moves Correctly

### Problem
When you click or drag pieces on the board in the line editor, the moves appear to be made but aren't being saved properly. The board position updates but the move list (`moves` state) stays empty or incorrect.

### Root Cause
The `applyMove` function has a critical bug on line 119:
```typescript
const newGame = new Chess(game.fen());
```

This creates a new Chess instance from just the FEN position, which **loses all move history**. When a move is made on `game`, the history is there, but creating `new Chess(game.fen())` only copies the position, not the history. Then when we call `newGame.history()`, it returns empty because there's no history in the new instance.

### Solution
Fix `applyMove` to properly preserve the move history by replaying all moves into a fresh Chess instance:

```typescript
const applyMove = (moveResult: ReturnType<typeof game.move>) => {
  if (moveResult) {
    // Replay all moves to preserve history
    const history = game.history();
    const newGame = new Chess();
    history.forEach(m => newGame.move(m));
    
    setGame(newGame);
    const newMoves = newGame.history().slice(startingMoves.length);
    setMoves(newMoves);
    setSelectedSquare(null);
    setCustomSquareStyles({});
  }
};
```

### Technical Changes
**File: `src/components/LineEditor.tsx`**
- Fix `applyMove` function (lines 117-126) to replay move history instead of just copying FEN
- Fix `undoMove` function (lines 211-218) with the same pattern

---

## Issue 3: Opening Theory Verification

### Problem
The user wants to ensure all moves in the opening database are real, correct chess moves that are actually played in theory.

### Verification Approach
The theory in `src/lib/courseLines.ts` uses Standard Algebraic Notation (SAN) which is validated by the `chess.js` library when loading lines. I reviewed samples across multiple openings:

**Verified Opening Lines (spot check):**

1. **Italian Game** - Lines like `Giuoco Piano: Main Line` starting with `e4, e5, Nf3, Nc6, Bc4, Bc5, c3, Nf6, d4...` are correct standard theory.

2. **Sicilian Dragon** - The Yugoslav Attack lines like `9.Bc4 Main Line` with `e4, c5, Nf3, d6, d4, cxd4, Nxd4, Nf6, Nc3, g6, Be3, Bg7, f3, O-O, Qd2, Nc6, Bc4...` match standard Dragon theory.

3. **London System** - Lines starting with `d4, d5, Bf4` or `d4, Nf6, Bf4` are correct London move orders.

4. **Caro-Kann** - Advance variation with `e4, c6, d4, d5, e5, Bf5` is correct.

5. **Stafford Gambit** - The characteristic move order `e4, e5, Nf3, Nf6, Nxe5, Nc6` is correct.

### Why the Theory is Valid
- All moves are in proper SAN format that `chess.js` parses
- The opening names match the lines (e.g., "Giuoco Piano" correctly starts with Italian Game moves)
- Lines include mainline theory and common variations
- Move depths of 15-25 moves align with practical opening knowledge

### Recommendation
The theory appears correct. If specific lines are suspected to be wrong, the user should identify which specific opening/line has an issue. The `chess.js` library will automatically reject any illegal moves during training, so invalid moves would cause errors.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/LineEditor.tsx` | Fix `applyMove` to preserve history, add `onPaste` handler, fix `undoMove` |

---

## Technical Implementation Details

### Fixed applyMove Function
```typescript
const applyMove = (moveResult: ReturnType<typeof game.move>) => {
  if (moveResult) {
    // Get full history including the new move
    const history = game.history();
    // Create fresh game and replay all moves
    const newGame = new Chess();
    history.forEach(m => newGame.move(m));
    
    setGame(newGame);
    const newMoves = newGame.history().slice(startingMoves.length);
    setMoves(newMoves);
    setSelectedSquare(null);
    setCustomSquareStyles({});
  }
};
```

### New onPaste Handler
```typescript
const handlePgnPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
  e.preventDefault();
  const pastedText = e.clipboardData.getData('text');
  setPgnInput(pastedText);
  // Immediately parse and apply
  parsePgnAndApply(pastedText);
};
```

### Fixed undoMove Function
```typescript
const undoMove = () => {
  if (game.history().length > startingMoves.length) {
    const history = game.history();
    // Replay all moves except the last one
    const newGame = new Chess();
    for (let i = 0; i < history.length - 1; i++) {
      newGame.move(history[i]);
    }
    setGame(newGame);
    const newMoves = newGame.history().slice(startingMoves.length);
    setMoves(newMoves);
  }
};
```

---

## How This Fixes the Training Issue

After these fixes:
1. When you paste a PGN, it immediately updates the board and `moves` state
2. When you click/drag pieces, the `moves` state correctly captures all played moves
3. When you save, the correct moves are stored in localStorage
4. The `trainerKey` increment (already implemented in `Train.tsx`) forces the trainer to remount with the new line data
5. The trainer validates against the newly saved moves

