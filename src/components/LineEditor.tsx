import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Undo2, RotateCcw, Save, X } from 'lucide-react';
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
  const { settings, currentTheme } = useBoardSettings();

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

  const handleMove = (sourceSquare: string, targetSquare: string, piece: string) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1]?.toLowerCase() === 'p' ? 'q' : undefined,
      });

      if (move) {
        setGame(new Chess(game.fen()));
        // Only track moves after the starting position
        const historyLength = game.history().length;
        if (historyLength > startingMoves.length) {
          const newMoves = game.history().slice(startingMoves.length);
          setMoves(newMoves);
        }
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  };

  const undoMove = () => {
    if (game.history().length > startingMoves.length) {
      game.undo();
      setGame(new Chess(game.fen()));
      const newMoves = game.history().slice(startingMoves.length);
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
    const startMoveNum = Math.floor(startingMoves.length / 2) + 1;
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
    
    return formatted.trim() || 'No moves yet';
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
                boardOrientation={courseColor}
                customLightSquareStyle={{ backgroundColor: currentTheme.light }}
                customDarkSquareStyle={{ backgroundColor: currentTheme.dark }}
                showBoardNotation={settings.showCoordinates}
              />
            </div>

            <div className="flex gap-2 mt-4">
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
              <Label>Moves ({moves.length} moves after opening)</Label>
              <div className="mt-2 p-3 rounded-lg bg-muted text-sm font-mono min-h-[80px] max-h-[160px] overflow-y-auto">
                {formatMoveList()}
              </div>
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
