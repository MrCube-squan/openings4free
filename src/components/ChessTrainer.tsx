import { useState, useCallback, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, RotateCcw, ArrowRight, Lightbulb } from 'lucide-react';

interface Line {
  moves: string[];
  name: string;
}

interface ChessTrainerProps {
  lines: Line[];
  playerColor: 'white' | 'black';
  courseName?: string;
}

const ChessTrainer = ({ lines, playerColor, courseName }: ChessTrainerProps) => {
  const [game, setGame] = useState(new Chess());
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [linesCompleted, setLinesCompleted] = useState(0);
  const [correctMoves, setCorrectMoves] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [customSquareStyles, setCustomSquareStyles] = useState<
    Record<string, Record<string, string | number>>
  >({});

  const currentLine = lines[currentLineIndex];
  const isPlayerTurn = (game.turn() === 'w') === (playerColor === 'white');

  // Make opponent moves automatically
  const makeOpponentMove = useCallback(() => {
    if (!isPlayerTurn && currentMoveIndex < currentLine.moves.length) {
      const move = currentLine.moves[currentMoveIndex];
      setTimeout(() => {
        const newGame = new Chess(game.fen());
        try {
          newGame.move(move);
          setGame(newGame);
          setCurrentMoveIndex(prev => prev + 1);
        } catch (e) {
          console.error('Invalid move:', move);
        }
      }, 500);
    }
  }, [game, currentLine, currentMoveIndex, isPlayerTurn]);

  useEffect(() => {
    makeOpponentMove();
  }, [makeOpponentMove]);

  const handlePieceDrop = (sourceSquare: string, targetSquare: string, piece: string): boolean => {
    if (!isPlayerTurn) return false;

    const expectedMove = currentLine.moves[currentMoveIndex];
    const newGame = new Chess(game.fen());

    try {
      // Try to make the move
      const moveResult = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1]?.toLowerCase() === 'p' ? 'q' : undefined,
      });

      if (!moveResult) return false;

      const moveSan = moveResult.san;
      setTotalMoves(prev => prev + 1);

      // Check if it matches the expected move
      if (moveSan === expectedMove || moveResult.lan === expectedMove) {
        setGame(newGame);
        setCurrentMoveIndex(prev => prev + 1);
        setFeedback('correct');
        setCorrectMoves(prev => prev + 1);
        setShowHint(false);
        setCustomSquareStyles({
          [sourceSquare]: { backgroundColor: 'hsl(152, 76%, 45%, 0.4)' },
          [targetSquare]: { backgroundColor: 'hsl(152, 76%, 45%, 0.4)' },
        });

        setTimeout(() => {
          setFeedback(null);
          setCustomSquareStyles({});
        }, 500);

        // Check if line is complete
        if (currentMoveIndex + 1 >= currentLine.moves.length) {
          setTimeout(() => {
            setLinesCompleted(prev => prev + 1);
            nextLine();
          }, 1000);
        }

        return true;
      } else {
        // Wrong move
        setFeedback('incorrect');
        setCustomSquareStyles({
          [sourceSquare]: { backgroundColor: 'hsl(0, 72%, 55%, 0.4)' },
          [targetSquare]: { backgroundColor: 'hsl(0, 72%, 55%, 0.4)' },
        });

        setTimeout(() => {
          setFeedback(null);
          setCustomSquareStyles({});
        }, 1000);

        return false;
      }
    } catch (e) {
      return false;
    }
  };

  // Handle click-to-move
  const handleSquareClick = (square: string) => {
    if (!isPlayerTurn) return;

    // If no square selected, select this one if it has a piece of the player's color
    if (!selectedSquare) {
      const piece = game.get(square as any);
      if (piece && piece.color === (playerColor === 'white' ? 'w' : 'b')) {
        setSelectedSquare(square);
        setCustomSquareStyles({
          [square]: { backgroundColor: 'hsl(152, 76%, 45%, 0.5)' },
        });
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
    const piece = game.get(selectedSquare as any);
    if (piece) {
      const pieceString = `${piece.color}${piece.type.toUpperCase()}`;
      const success = handlePieceDrop(selectedSquare, square, pieceString);
      if (!success) {
        // Check if clicking another own piece to switch selection
        const targetPiece = game.get(square as any);
        if (targetPiece && targetPiece.color === (playerColor === 'white' ? 'w' : 'b')) {
          setSelectedSquare(square);
          setCustomSquareStyles({
            [square]: { backgroundColor: 'hsl(152, 76%, 45%, 0.5)' },
          });
          return;
        }
      }
    }
    setSelectedSquare(null);
  };

  const resetLine = () => {
    setGame(new Chess());
    setCurrentMoveIndex(0);
    setFeedback(null);
    setShowHint(false);
    setSelectedSquare(null);
    setCustomSquareStyles({});
  };

  const nextLine = () => {
    if (currentLineIndex < lines.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
    } else {
      setCurrentLineIndex(0);
    }
    setGame(new Chess());
    setCurrentMoveIndex(0);
    setFeedback(null);
    setShowHint(false);
    setSelectedSquare(null);
    setCustomSquareStyles({});
  };

  const revealHint = () => {
    setShowHint(true);
  };

  const accuracy = totalMoves > 0 ? Math.round((correctMoves / totalMoves) * 100) : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
      {/* Chessboard */}
      <div className="relative w-full max-w-[500px] mx-auto lg:mx-0">
        <div className="chess-board relative">
            <Chessboard
            position={game.fen()}
            onPieceDrop={handlePieceDrop}
            onSquareClick={handleSquareClick}
            boardOrientation={playerColor}
            customBoardStyle={{
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
            customDarkSquareStyle={{
              backgroundColor: 'hsl(152, 25%, 32%)',
            }}
            customLightSquareStyle={{
              backgroundColor: 'hsl(35, 35%, 75%)',
            }}
            customSquareStyles={customSquareStyles}
          />
        </div>

        {/* Feedback overlay */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
                feedback === 'correct' ? 'bg-primary/10' : 'bg-destructive/10'
              } rounded-xl`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`p-4 rounded-full ${
                  feedback === 'correct' ? 'bg-primary' : 'bg-destructive'
                }`}
              >
                {feedback === 'correct' ? (
                  <Check className="h-8 w-8 text-primary-foreground" />
                ) : (
                  <X className="h-8 w-8 text-destructive-foreground" />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls and info */}
      <div className="flex-1 w-full lg:max-w-sm space-y-6">
        {/* Current line info */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground mb-1">Current Line</div>
          <div className="text-lg font-bold text-foreground mb-3">
            {currentLine.name}
          </div>
          
          {/* Progress dots */}
          <div className="flex gap-1.5 flex-wrap mb-4">
            {currentLine.moves.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i < currentMoveIndex
                    ? 'bg-primary'
                    : i === currentMoveIndex
                    ? 'bg-primary/50 animate-pulse'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Hint */}
          {isPlayerTurn && currentMoveIndex < currentLine.moves.length && (
            <div className="pt-2 border-t border-border">
              {showHint ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  <span className="text-accent font-mono font-bold text-lg">
                    {currentLine.moves[currentMoveIndex]}
                  </span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={revealHint}
                  className="w-full border-accent/30 text-accent hover:bg-accent/10"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Show Hint
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="text-2xl font-bold text-primary">{linesCompleted}</div>
            <div className="text-xs text-muted-foreground">Lines</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="text-2xl font-bold text-accent">{accuracy}%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{correctMoves}</div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={resetLine} className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="default" onClick={nextLine} className="flex-1">
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChessTrainer;
