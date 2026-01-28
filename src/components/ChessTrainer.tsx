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

interface PieceDropArgs {
  piece: { isSparePiece: boolean; position: string; pieceType: string };
  sourceSquare: string;
  targetSquare: string | null;
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
  const [customSquareStyles, setCustomSquareStyles] = useState<Record<string, React.CSSProperties>>({});

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

  const handlePieceDrop = ({ piece, sourceSquare, targetSquare }: PieceDropArgs): boolean => {
    if (!isPlayerTurn || !targetSquare) return false;

    const expectedMove = currentLine.moves[currentMoveIndex];
    const newGame = new Chess(game.fen());

    try {
      // Try to make the move
      const moveResult = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece.pieceType?.toLowerCase() === 'p' ? 'q' : undefined,
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

  const resetLine = () => {
    setGame(new Chess());
    setCurrentMoveIndex(0);
    setFeedback(null);
    setShowHint(false);
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
            options={{
              position: game.fen(),
              onPieceDrop: handlePieceDrop,
              boardOrientation: playerColor,
              boardStyle: {
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              },
              darkSquareStyle: {
                backgroundColor: 'hsl(152, 25%, 32%)',
              },
              lightSquareStyle: {
                backgroundColor: 'hsl(35, 35%, 75%)',
              },
              squareStyles: customSquareStyles,
            }}
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
            <div className="text-sm">
              {showHint ? (
                <span className="text-accent font-mono">{currentLine.moves[currentMoveIndex]}</span>
              ) : (
                <button
                  onClick={revealHint}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <Lightbulb className="h-4 w-4" />
                  Show hint
                </button>
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
