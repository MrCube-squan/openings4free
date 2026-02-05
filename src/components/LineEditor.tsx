import { useState, useEffect, useRef } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Undo2, RotateCcw, Save, X, Plus } from 'lucide-react';
import { useBoardSettings } from '@/hooks/useBoardSettings';

interface LineEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, moves: string[], category: string) => void;
  initialName?: string;
  initialMoves?: string[];
  initialCategory?: string;
  courseColor: 'white' | 'black';
  startingMoves?: string[]; // Moves to set up the starting position
}

const CATEGORIES = [
  'Mainline',
  'Sharp',
  'Solid',
  'Gambit',
  'Anti-Theory',
  'Sideline',
  'Custom',
];

const LineEditor = ({
  open,
  onClose,
  onSave,
  initialName = '',
  initialMoves = [],
  initialCategory = 'Custom',
  courseColor,
  startingMoves = [],
}: LineEditorProps) => {
  const [game, setGame] = useState(new Chess());
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState(initialCategory);
  const [moves, setMoves] = useState<string[]>(initialMoves);
  const [moveInput, setMoveInput] = useState('');
  const [pgnInput, setPgnInput] = useState('');
  const [pgnError, setPgnError] = useState<string | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [customSquareStyles, setCustomSquareStyles] = useState<Record<string, Record<string, string | number>>>({});
  const { settings, currentTheme } = useBoardSettings();
  const moveInputRef = useRef<HTMLInputElement>(null);
  const wasOpenRef = useRef(false);
  const shouldSyncPgnFromPositionRef = useRef(true);

  // Reset when dialog opens (only on closed → open transition)
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      const newGame = new Chess();

      // Apply starting moves (opening position)
      startingMoves.forEach((move) => {
        try {
          newGame.move(move);
        } catch (e) {
          console.error('Invalid starting move:', move);
        }
      });

      // Apply line moves if editing
      initialMoves.forEach((move) => {
        try {
          newGame.move(move);
        } catch (e) {
          console.error('Invalid move:', move);
        }
      });

      shouldSyncPgnFromPositionRef.current = true;
      setGame(newGame);
      setName(initialName);
      setCategory(initialCategory);
      setMoves(initialMoves);
      setSelectedSquare(null);
      setCustomSquareStyles({});
      setPgnError(null);
    }

    wasOpenRef.current = open;
    // We intentionally snapshot initial props only when the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Get legal moves for highlighting
  const getLegalMoveStyles = (fromSquare: string): Record<string, Record<string, string | number>> => {
    const legalMoves = game.moves({ square: fromSquare as Square, verbose: true });
    const styles: Record<string, Record<string, string | number>> = {
      [fromSquare]: { backgroundColor: 'hsl(152, 76%, 45%, 0.5)' },
    };
    
    legalMoves.forEach(move => {
      const isCapture = move.captured;
      styles[move.to] = {
        background: isCapture 
          ? 'radial-gradient(circle, transparent 60%, hsl(38, 95%, 55%, 0.6) 60%)'
          : 'radial-gradient(circle, hsl(38, 95%, 55%, 0.5) 25%, transparent 25%)',
        borderRadius: '50%',
      };
    });
    
    return styles;
  };

  const applyMove = (moveResult: ReturnType<typeof game.move>) => {
    if (moveResult) {
      // Get full history including the new move
      const history = game.history();
      // Create fresh game and replay all moves to preserve history
      const newGame = new Chess();
      history.forEach((m) => newGame.move(m));

      shouldSyncPgnFromPositionRef.current = true;
      setGame(newGame);
      const newMoves = newGame.history().slice(startingMoves.length);
      setMoves(newMoves);
      setSelectedSquare(null);
      setCustomSquareStyles({});
    }
  };

  const handleMove = (sourceSquare: string, targetSquare: string, piece: string) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1]?.toLowerCase() === 'p' ? 'q' : undefined,
      });

      if (move) {
        applyMove(move);
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  };

  const handleSquareClick = (square: string) => {
    // If no square selected, select this one if it has a piece
    if (!selectedSquare) {
      const piece = game.get(square as Square);
      if (piece) {
        setSelectedSquare(square);
        setCustomSquareStyles(getLegalMoveStyles(square));
      }
      return;
    }

    // If clicking the same square, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setCustomSquareStyles({});
      return;
    }

    // Try to make the move
    try {
      const move = game.move({
        from: selectedSquare,
        to: square,
        promotion: 'q', // Always promote to queen
      });

      if (move) {
        applyMove(move);
        return;
      }
    } catch (e) {
      // Invalid move, check if clicking another piece
    }

    // Check if clicking another piece to switch selection
    const piece = game.get(square as Square);
    if (piece) {
      setSelectedSquare(square);
      setCustomSquareStyles(getLegalMoveStyles(square));
    } else {
      setSelectedSquare(null);
      setCustomSquareStyles({});
    }
  };

  const handleMoveInput = () => {
    if (!moveInput.trim()) return;
    
    try {
      const move = game.move(moveInput.trim());
      if (move) {
        applyMove(move);
        setMoveInput('');
      }
    } catch (e) {
      // Invalid move - could show feedback
    }
  };

  const handleMoveInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMoveInput();
    }
  };

  const undoMove = () => {
    if (game.history().length > startingMoves.length) {
      const history = game.history();
      // Replay all moves except the last one
      const newGame = new Chess();
      for (let i = 0; i < history.length - 1; i++) {
        newGame.move(history[i]);
      }
      shouldSyncPgnFromPositionRef.current = true;
      setGame(newGame);
      const newMoves = newGame.history().slice(startingMoves.length);
      setMoves(newMoves);
      setSelectedSquare(null);
      setCustomSquareStyles({});
    }
  };

  const resetLine = () => {
    const newGame = new Chess();
    startingMoves.forEach((move) => {
      try {
        newGame.move(move);
      } catch (e) {
        console.error('Invalid starting move:', move);
      }
    });
    shouldSyncPgnFromPositionRef.current = true;
    setGame(newGame);
    setMoves([]);
    setSelectedSquare(null);
    setCustomSquareStyles({});
    setPgnError(null);
  };

  const sanitizePgnText = (raw: string) => {
    return raw
      // Users sometimes accidentally copy the label text along with the moves
      .replace(/^\s*PGN\s+Moves\s*\([^)]*\)\s*/i, '')
      .replace(/^\s*PGN[:\s]+/i, '')
      .replace(/\u200B/g, '')
      .trim();
  };

  const tryParseFullPgnFromStart = (
    raw: string,
  ): { game: Chess; moves: string[] } | null => {
    try {
      const g = new Chess();
      const anyG = g as any;
      const load = anyG.loadPgn ?? anyG.load_pgn;

      if (typeof load !== 'function') return null;

      const result = load.call(g, raw, { sloppy: true });
      if (result === false) return null;

      const moves = g.history();
      if (!moves.length) return null;

      return { game: g, moves };
    } catch {
      return null;
    }
  };

  const isPrefix = (prefix: string[], full: string[]) => {
    if (prefix.length > full.length) return false;
    for (let i = 0; i < prefix.length; i++) {
      if (prefix[i] !== full[i]) return false;
    }
    return true;
  };

  const tokenizePgn = (raw: string) => {
    const cleaned = raw
      .replace(/\[.*?\]/g, '') // PGN headers
      .replace(/\{[^}]*\}/g, '') // comments
      .replace(/\([^)]*\)/g, '') // variations
      .replace(/\$\d+/g, '') // NAGs
      .replace(/1-0|0-1|1\/2-1\/2|\*/g, '') // results
      .replace(/\d+\.\.\./g, '') // 1... style
      .replace(/\d+\./g, '') // 1. style
      .replace(/[?!]+/g, '') // annotations
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned) return [];

    // Extra guard: ignore stray "PGN" tokens if they slip through
    return cleaned
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && t.toLowerCase() !== 'pgn');
  };

  const parsePgn = (raw: string) => {
    const sanitized = sanitizePgnText(raw);

    // Empty input means: back to the course opening position
    if (!sanitized) {
      const baseGame = new Chess();
      startingMoves.forEach((move) => {
        try {
          baseGame.move(move);
        } catch (e) {
          console.error('Invalid starting move:', move);
        }
      });

      return {
        game: baseGame,
        movesAfterOpening: [] as string[],
        error: null as string | null,
      };
    }

    // If the user pasted a full PGN (starting from move 1), parse it from the initial position
    // and strip the course's starting moves if they match.
    const fullParse = tryParseFullPgnFromStart(sanitized);
    if (fullParse && isPrefix(startingMoves, fullParse.moves)) {
      const remainder = fullParse.moves.slice(startingMoves.length);

      const newGame = new Chess();
      startingMoves.forEach((move) => {
        try {
          newGame.move(move);
        } catch (e) {
          console.error('Invalid starting move:', move);
        }
      });

      const applied: string[] = [];
      for (let i = 0; i < remainder.length; i++) {
        const token = remainder[i];
        try {
          const result = newGame.move(token);
          if (result) {
            applied.push(result.san);
          } else {
            return {
              game: newGame,
              movesAfterOpening: applied,
              error: `Invalid move "${token}" at position ${i + 1}. ${applied.length} of ${remainder.length} moves applied.`,
            };
          }
        } catch {
          return {
            game: newGame,
            movesAfterOpening: applied,
            error: `Invalid move "${token}" at position ${i + 1}. ${applied.length} of ${remainder.length} moves applied.`,
          };
        }
      }

      return { game: newGame, movesAfterOpening: applied, error: null };
    }

    // Otherwise treat the input as a continuation from the course opening position.
    const moveTokens = tokenizePgn(sanitized);

    const newGame = new Chess();
    startingMoves.forEach((move) => {
      try {
        newGame.move(move);
      } catch (e) {
        console.error('Invalid starting move:', move);
      }
    });

    const validMoves: string[] = [];
    let errorAtMove: string | null = null;
    let errorIndex = -1;

    for (let i = 0; i < moveTokens.length; i++) {
      const moveToken = moveTokens[i];
      try {
        const result = newGame.move(moveToken);
        if (result) {
          validMoves.push(result.san);
        } else {
          errorAtMove = moveToken;
          errorIndex = i + 1;
          break;
        }
      } catch {
        errorAtMove = moveToken;
        errorIndex = i + 1;
        break;
      }
    }

    const error = errorAtMove
      ? `Invalid move "${errorAtMove}" at position ${errorIndex}. ${validMoves.length} of ${moveTokens.length} moves applied.`
      : null;

    return { game: newGame, movesAfterOpening: validMoves, error };
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const parsed = parsePgn(pgnInput);

    if (parsed.error) {
      setPgnError(parsed.error);
      return;
    }

    if (parsed.movesAfterOpening.length === 0) {
      setPgnError('Please enter at least one move to save this line.');
      return;
    }

    // Save exactly what the user typed (PGN is the source of truth)
    onSave(name.trim(), parsed.movesAfterOpening, category);
    onClose();
  };

  const formatMoveList = () => {
    const fullHistory = game.history();
    const allMoves = fullHistory.slice(startingMoves.length);

    // Format with move numbers
    let formatted = '';
    const isBlackToMoveFirst = startingMoves.length % 2 === 1;

    allMoves.forEach((move, idx) => {
      const absoluteIdx = startingMoves.length + idx;
      const moveNum = Math.floor(absoluteIdx / 2) + 1;
      const isWhite = absoluteIdx % 2 === 0;

      if (isWhite) {
        formatted += `${moveNum}. ${move} `;
      } else {
        if (idx === 0 && isBlackToMoveFirst) {
          formatted += `${moveNum}... ${move} `;
        } else {
          formatted += `${move} `;
        }
      }
    });

    return formatted.trim();
  };

  // Keep PGN in sync with board-driven changes, but NEVER overwrite user-typed PGN.
  useEffect(() => {
    if (!shouldSyncPgnFromPositionRef.current) return;
    setPgnInput(formatMoveList());
  }, [moves, game]);

  // Parse PGN input and apply moves
  const parsePgnAndApply = (pgn: string) => {
    const parsed = parsePgn(pgn);

    setPgnError(parsed.error);

    // Don’t normalize/overwrite what the user typed after parsing.
    shouldSyncPgnFromPositionRef.current = false;
    setGame(parsed.game);
    setMoves(parsed.movesAfterOpening);
    setSelectedSquare(null);
    setCustomSquareStyles({});
  };

  const handlePgnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPgn = e.target.value;
    setPgnInput(newPgn);
  };

  const handlePgnBlur = () => {
    parsePgnAndApply(pgnInput);
  };

  const handlePgnPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const target = e.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const currentValue = target.value;

    // Calculate the new value after paste
    const newValue =
      currentValue.substring(0, start) +
      pastedText +
      currentValue.substring(end);

    e.preventDefault();
    setPgnInput(newValue);
    // Immediately parse and apply THE FULL NEW VALUE, not just the pasted text
    parsePgnAndApply(newValue);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {initialMoves.length > 0 ? 'Edit Line' : 'Create New Line'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Board */}
          <div>
            <div className="aspect-square rounded-lg overflow-hidden border border-border">
              <Chessboard
                position={game.fen()}
                onPieceDrop={handleMove}
                onSquareClick={handleSquareClick}
                boardOrientation={courseColor}
                customLightSquareStyle={{ backgroundColor: currentTheme.light }}
                customDarkSquareStyle={{ backgroundColor: currentTheme.dark }}
                customSquareStyles={customSquareStyles}
                showBoardNotation={settings.showCoordinates}
              />
            </div>

            {/* Move input */}
            <div className="flex gap-2 mt-4">
              <Input
                ref={moveInputRef}
                value={moveInput}
                onChange={(e) => setMoveInput(e.target.value)}
                onKeyDown={handleMoveInputKeyDown}
                placeholder="Type move (e.g., e4, Nf3)"
                className="flex-1"
              />
              <Button variant="secondary" size="icon" onClick={handleMoveInput}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undoMove}
                disabled={game.history().length <= startingMoves.length}
              >
                <Undo2 className="h-4 w-4 mr-1" />
                Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetLine}
                disabled={moves.length === 0}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="line-name">Line Name</Label>
              <Input
                id="line-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Main Line with Qe2"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pgn-input">
                PGN Moves ({moves.length} moves after opening)
              </Label>
              <Textarea
                id="pgn-input"
                value={pgnInput}
                onChange={handlePgnChange}
                onBlur={handlePgnBlur}
                onPaste={handlePgnPaste}
                placeholder="Type or paste PGN here, e.g.: e4 e5 Nf3 Nc6 Bb5"
                className={`mt-2 font-mono text-sm min-h-[120px] ${pgnError ? 'border-destructive' : ''}`}
              />
              {pgnError ? (
                <p className="text-xs text-destructive mt-1">{pgnError}</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Edit freely: select all, delete, paste, or type. Board updates on blur.
                </p>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
              <p className="font-medium">Tips:</p>
              <p>• The PGN field is the source of truth</p>
              <p>• Board clicks also add moves to the PGN</p>
              <p>• Move numbers are optional (e.g., "1. e4" or just "e4")</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || moves.length === 0}
          >
            <Save className="h-4 w-4 mr-1" />
            Save Line
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LineEditor;
