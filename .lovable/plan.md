

# Implementation Plan: Enhanced Chess Trainer Features

## Overview
This plan covers five major features for the openings4free trainer: visual arrow hints, expanded 40-line theory database, drilling mode, previous line navigation, and board customization options.

---

## Feature 1: Arrow Hints on Board

When the user clicks "Show Hint", display a visual arrow on the chessboard showing the correct move from source to target square.

### Technical Approach
- Use the `customArrows` prop from react-chessboard which accepts `Array<[Square, Square, color?]>`
- Create a helper function to convert SAN notation (e.g., "Nf3") to source/target squares using chess.js
- When `showHint` is true, compute the arrow and pass it to the Chessboard component
- Arrow color will use the accent color for visibility

### Files to Modify
- `src/components/ChessTrainer.tsx`
  - Add `getArrowFromMove()` function to parse SAN to squares
  - Add `customArrows` prop to Chessboard component
  - Compute arrow when `showHint` state is true

---

## Feature 2: Expand to 40 Lines Per Opening

Increase theory depth with 40 diverse, high-depth lines for each of the 12 openings.

### Technical Approach
- Restructure `src/lib/courseLines.ts` with 40 lines per opening
- Include mainlines, gambits, anti-systems, and sidelines
- Each line will have 15-25 moves of depth
- Organize lines by category (mainline, sharp, solid, anti-theory)

### Files to Modify
- `src/lib/courseLines.ts` - Complete rewrite with 480 total lines (40 x 12 openings)
- `src/lib/courses.ts` - Update line counts to 40 for all courses

---

## Feature 3: Drilling Mode

A dedicated mode to practice only lines the user has already learned within a selected opening.

### Technical Approach
- Track learned lines per course in localStorage
- Mark a line as "learned" when completed with high accuracy (e.g., 80%+ or completed without hints)
- Create a new `/drill` route with mode selector (Learn vs Drill)
- In drill mode, only show previously learned lines
- Add drill button to Train page and CourseDetail page

### Files to Create/Modify
- `src/hooks/useLearnedLines.ts` - Custom hook for localStorage persistence
- `src/pages/Train.tsx` - Add mode toggle (Learn/Drill)
- `src/components/ChessTrainer.tsx` - Track line completion and report to parent
- `src/pages/CourseDetail.tsx` - Add "Drill" button alongside "Start Course"

### Data Structure
```typescript
interface LearnedLineData {
  courseId: string;
  lineIndex: number;
  completedAt: string;
  accuracy: number;
}
```

---

## Feature 4: Previous Line Navigation

Add a button to go back to the previous line during training.

### Technical Approach
- Add "Previous" button alongside Reset/Next buttons
- Track line history to enable proper back navigation
- Disable button when on first line or no history

### Files to Modify
- `src/components/ChessTrainer.tsx`
  - Add `previousLine()` function
  - Add Previous button with ArrowLeft icon
  - Handle edge case when at index 0

---

## Feature 5: Board Customization Options

Allow users to customize the chessboard appearance (colors, piece sets, coordinates).

### Technical Approach
- Create a settings modal/dropdown accessible from the trainer page
- Store preferences in localStorage
- Options include:
  - Board theme (6-8 presets: default, wood, blue, green, purple, etc.)
  - Show/hide coordinates
  - Piece set (if supported by react-chessboard)
  
### Preset Themes
```typescript
const boardThemes = {
  default: { light: 'hsl(35, 35%, 75%)', dark: 'hsl(152, 25%, 32%)' },
  wood: { light: '#f0d9b5', dark: '#b58863' },
  blue: { light: '#dee3e6', dark: '#8ca2ad' },
  green: { light: '#ffffdd', dark: '#86a666' },
  purple: { light: '#e8e0f0', dark: '#8877b7' },
  gray: { light: '#c0c0c0', dark: '#707070' },
};
```

### Files to Create/Modify
- `src/hooks/useBoardSettings.ts` - Custom hook for board preferences
- `src/components/BoardSettingsModal.tsx` - Settings UI component
- `src/components/ChessTrainer.tsx` - Apply settings to Chessboard props
- `src/pages/Train.tsx` - Add settings button (gear icon)

---

## Implementation Order

1. **Arrow Hints** - Most immediately impactful, builds on existing hint system
2. **Previous Line Button** - Quick addition to existing navigation
3. **Board Customization** - Creates settings infrastructure
4. **Drilling Mode** - Requires learned line tracking
5. **40 Lines Per Opening** - Largest content update, done last

---

## Technical Details

### Arrow Calculation Helper
```typescript
const getArrowFromMove = (game: Chess, sanMove: string): [string, string] | null => {
  const tempGame = new Chess(game.fen());
  try {
    const move = tempGame.move(sanMove);
    if (move) {
      return [move.from, move.to];
    }
  } catch (e) {
    return null;
  }
  return null;
};
```

### Learned Lines Storage Key
```text
openings4free_learned_lines
```

### Board Settings Storage Key
```text
openings4free_board_settings
```

---

## UI/UX Considerations

- Arrow color: Accent yellow (`hsl(38, 95%, 55%)`) for high visibility
- Previous button placed to the left of Reset button
- Settings accessible via gear icon in trainer header
- Drill mode indicated by a badge/label change ("Drilling" vs "Learning")
- Visual indicator on CourseDetail showing learned line count

---

## Summary of Changes

| File | Action | Purpose |
|------|--------|---------|
| `src/components/ChessTrainer.tsx` | Modify | Arrows, previous button, settings integration |
| `src/lib/courseLines.ts` | Rewrite | 40 lines per opening |
| `src/lib/courses.ts` | Modify | Update line counts |
| `src/hooks/useLearnedLines.ts` | Create | Track completed lines |
| `src/hooks/useBoardSettings.ts` | Create | Board preferences |
| `src/components/BoardSettingsModal.tsx` | Create | Settings UI |
| `src/pages/Train.tsx` | Modify | Mode toggle, settings button |
| `src/pages/CourseDetail.tsx` | Modify | Add drill button |

