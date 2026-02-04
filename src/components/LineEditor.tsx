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
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [customSquareStyles, setCustomSquareStyles] = useState<Record<string, Record<string, string | number>>>({});
  const { settings, currentTheme } = useBoardSettings();
  const moveInputRef = useRef<HTMLInputElement>(null);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      const newGame = new Chess();
      
      // Apply starting moves (opening position)
      startingMoves.forEach(move => {
        try {
          newGame.move(move);
        } catch (e) {
          console.error('Invalid starting move:', move);
        }
      });

      // Apply line moves if editing
      initialMoves.forEach(move => {
        try {
          newGame.move(move);
        } catch (e) {
          console.error('Invalid move:', move);
        }
      });

      setGame(newGame);
      setName(initialName);
      setCategory(initialCategory);
      setMoves(initialMoves);
    }
  }, [open, initialName, initialMoves, initialCategory, startingMoves]);

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
      history.forEach(m => newGame.move(m));
      
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
      setGame(newGame);
      const newMoves = newGame.history().slice(startingMoves.length);
      setMoves(newMoves);
    }
  };

  const resetLine = () => {
    const newGame = new Chess();
    startingMoves.forEach(move => {
      try {
        newGame.move(move);
      } catch (e) {
        console.error('Invalid starting move:', move);
      }
    });
    setGame(newGame);
    setMoves([]);
  };

  const handleSave = () => {
    if (name.trim() && moves.length > 0) {
      onSave(name.trim(), moves, category);
      onClose();
    }
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

  // Update PGN input when moves change
  useEffect(() => {
    setPgnInput(formatMoveList());
  }, [moves, game]);

  // Parse PGN input and apply moves
  const parsePgnAndApply = (pgn: string) => {
    // Remove move numbers and clean up the PGN
    const cleanedPgn = pgn
      .replace(/\d+\.\.\./g, '') // Remove "1..." style notation
      .replace(/\d+\./g, '')     // Remove "1." style notation
      .replace(/\s+/g, ' ')      // Normalize whitespace
      .trim();
    
    const moveTokens = cleanedPgn.split(' ').filter(m => m.length > 0);
    
    // Start from the opening position
    const newGame = new Chess();
    startingMoves.forEach(move => {
      try {
        newGame.move(move);
      } catch (e) {
        console.error('Invalid starting move:', move);
      }
    });
    
    // Apply each move from the PGN
    const validMoves: string[] = [];
    for (const moveToken of moveTokens) {
      try {
        const result = newGame.move(moveToken);
        if (result) {
          validMoves.push(result.san);
        }
      } catch (e) {
        // Stop at first invalid move
        break;
      }
    }
    
    setGame(newGame);
    setMoves(validMoves);
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
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    setPgnInput(pastedText);
    // Immediately parse and apply
    parsePgnAndApply(pastedText);
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
              <Label htmlFor="pgn-input">Moves ({moves.length} moves after opening)</Label>
              <Textarea
                id="pgn-input"
                value={pgnInput}
                onChange={handlePgnChange}
                onBlur={handlePgnBlur}
                onPaste={handlePgnPaste}
                placeholder="e.g., 1. e4 e5 2. Nf3 Nc6"
                className="mt-2 font-mono text-sm min-h-[80px] max-h-[160px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Edit moves directly or use the board. Changes apply when you click outside.
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>• Click or drag pieces to add moves</p>
              <p>• The line starts from the opening position</p>
              <p>• Add moves for both sides</p>
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
