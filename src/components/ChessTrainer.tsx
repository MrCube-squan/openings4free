import { useState, useCallback, useEffect, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, RotateCcw, ArrowRight, ArrowLeft, Lightbulb, Settings, Undo2 } from 'lucide-react';
import { useBoardSettings } from '@/hooks/useBoardSettings';
import BoardSettingsModal from '@/components/BoardSettingsModal';
import EvalBar from '@/components/EvalBar';
import confetti from 'canvas-confetti';

interface Line {
  moves: string[];
  name: string;
}

interface ChessTrainerProps {
  lines: Line[];
  playerColor: 'white' | 'black';
  courseName?: string;
  courseId?: string;
  onLineComplete?: (lineIndex: number, accuracy: number) => void;
  startLineIndex?: number;
  
}

// Helper function to get arrow from SAN move
const getArrowFromMove = (game: Chess, sanMove: string): [Square, Square] | null => {
  const tempGame = new Chess(game.fen());
  try {
    const move = tempGame.move(sanMove);
    if (move) {
      return [move.from as Square, move.to as Square];
    }
  } catch (e) {
    return null;
  }
  return null;
};

const ChessTrainer = ({ lines, playerColor, courseName, courseId, onLineComplete, startLineIndex }: ChessTrainerProps) => {
  const [game, setGame] = useState(new Chess());
  const initialLineIndex = startLineIndex !== undefined && startLineIndex >= 0 && startLineIndex < lines.length ? startLineIndex : 0;
  const [currentLineIndex, setCurrentLineIndex] = useState(initialLineIndex);
  const [lineHistory, setLineHistory] = useState<number[]>([initialLineIndex]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [linesCompleted, setLinesCompleted] = useState(0);
  const [correctMoves, setCorrectMoves] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [lineCorrectMoves, setLineCorrectMoves] = useState(0);
  const [lineTotalMoves, setLineTotalMoves] = useState(0);
  const [hadMistake, setHadMistake] = useState(false);
  const [repeatPending, setRepeatPending] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [customSquareStyles, setCustomSquareStyles] = useState<
    Record<string, Record<string, string | number>>
  >({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingPremove, setPendingPremove] = useState<{ from: string; to: string; piece: string } | null>(null);

  const { settings, updateSettings, currentTheme } = useBoardSettings();

  const currentLine = lines[currentLineIndex];
  const isPlayerTurn = (game.turn() === 'w') === (playerColor === 'white');

  // Compute arrow for hint
  const hintArrow = useMemo(() => {
    if (!showHint || !isPlayerTurn || currentMoveIndex >= currentLine.moves.length) {
      return [];
    }
    const expectedMove = currentLine.moves[currentMoveIndex];
    const arrow = getArrowFromMove(game, expectedMove);
    if (arrow) {
      return [[arrow[0], arrow[1], 'hsl(38, 95%, 55%)']] as Array<[Square, Square, string]>;
    }
    return [];
  }, [showHint, isPlayerTurn, currentMoveIndex, currentLine.moves, game]);

  // Check for line completion (works for both player and opponent ending)
  const checkLineComplete = useCallback((moveIdx: number) => {
    if (moveIdx >= currentLine.moves.length) {
      const lineAccuracy = lineTotalMoves > 0 
        ? Math.round((lineCorrectMoves / lineTotalMoves) * 100) 
        : 100;
      
      // Fire confetti celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      setTimeout(() => {
        setLinesCompleted(prev => prev + 1);
        if (onLineComplete) {
          onLineComplete(currentLineIndex, lineAccuracy);
        }
        // If the user made a mistake, repeat the line instead of advancing
        if (hadMistake) {
          setRepeatPending(true);
          resetLine();
        } else {
          nextLine();
        }
      }, 1000);
    }
  }, [currentLine.moves.length, lineTotalMoves, lineCorrectMoves, onLineComplete, currentLineIndex, hadMistake]);

  // Make opponent moves automatically, then execute any queued premove
  const makeOpponentMove = useCallback(() => {
    if (!isPlayerTurn && currentMoveIndex < currentLine.moves.length) {
      const move = currentLine.moves[currentMoveIndex];
      setTimeout(() => {
        const newGame = new Chess(game.fen());
        try {
          newGame.move(move);
          setGame(newGame);
          const newMoveIndex = currentMoveIndex + 1;
          setCurrentMoveIndex(newMoveIndex);
          
          // Check if line is complete after opponent's move
          checkLineComplete(newMoveIndex);
          
          // Execute pending premove after opponent plays
          if (pendingPremove) {
            setTimeout(() => {
              setPendingPremove(null);
            }, 50);
          }
        } catch (e) {
          console.error('Invalid move:', move);
        }
      }, 500);
    }
  }, [game, currentLine, currentMoveIndex, isPlayerTurn, pendingPremove, checkLineComplete]);

  useEffect(() => {
    makeOpponentMove();
  }, [makeOpponentMove]);

  // Execute pending premove when it becomes player's turn
  useEffect(() => {
    if (isPlayerTurn && pendingPremove) {
      const { from, to, piece } = pendingPremove;
      setPendingPremove(null);
      setTimeout(() => {
        handlePieceDrop(from, to, piece);
      }, 100);
    }
  }, [isPlayerTurn, pendingPremove]);

  const handlePieceDrop = (sourceSquare: string, targetSquare: string, piece: string): boolean => {
    // Queue premove if not player's turn
    if (!isPlayerTurn) {
      setPendingPremove({ from: sourceSquare, to: targetSquare, piece });
      setCustomSquareStyles({
        [sourceSquare]: { backgroundColor: 'hsl(210, 80%, 55%, 0.3)' },
        [targetSquare]: { backgroundColor: 'hsl(210, 80%, 55%, 0.3)' },
      });
      return false;
    }

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
      setLineTotalMoves(prev => prev + 1);

      // Check if it matches the expected move (normalize captures: Bxb2 == Bb2)
      const normalizeSan = (s: string) => s.replace(/x/g, '');
      if (moveSan === expectedMove || moveResult.lan === expectedMove || normalizeSan(moveSan) === normalizeSan(expectedMove)) {
        setGame(newGame);
        setCurrentMoveIndex(prev => prev + 1);
        setFeedback('correct');
        setCorrectMoves(prev => prev + 1);
        setLineCorrectMoves(prev => prev + 1);
        setShowHint(false);
        setCustomSquareStyles({
          [sourceSquare]: { backgroundColor: 'hsl(152, 76%, 45%, 0.4)' },
          [targetSquare]: { backgroundColor: 'hsl(152, 76%, 45%, 0.4)' },
        });

        setTimeout(() => {
          setFeedback(null);
          setCustomSquareStyles({});
        }, 500);

        // Check if line is complete after player's move
        checkLineComplete(currentMoveIndex + 1);

        return true;
      } else {
        // Wrong move
        setHadMistake(true);
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

  // Get legal moves for a piece and return highlight styles
  const getLegalMoveStyles = (fromSquare: string): Record<string, Record<string, string | number>> => {
    const moves = game.moves({ square: fromSquare as Square, verbose: true });
    const styles: Record<string, Record<string, string | number>> = {
      [fromSquare]: { backgroundColor: 'hsl(152, 76%, 45%, 0.5)' },
    };
    
    moves.forEach(move => {
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

  // Handle click-to-move
  const handleSquareClick = (square: string) => {
    if (!isPlayerTurn) return;

    // If no square selected, select this one if it has a piece of the player's color
    if (!selectedSquare) {
      const piece = game.get(square as Square);
      if (piece && piece.color === (playerColor === 'white' ? 'w' : 'b')) {
        setSelectedSquare(square);
        // Show all legal moves for this piece
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
    const piece = game.get(selectedSquare as Square);
    if (piece) {
      const pieceString = `${piece.color}${piece.type.toUpperCase()}`;
      const success = handlePieceDrop(selectedSquare, square, pieceString);
      if (!success) {
        // Check if clicking another own piece to switch selection
        const targetPiece = game.get(square as Square);
        if (targetPiece && targetPiece.color === (playerColor === 'white' ? 'w' : 'b')) {
          setSelectedSquare(square);
          // Show all legal moves for this piece
          setCustomSquareStyles(getLegalMoveStyles(square));
          return;
        }
      }
    }
    setSelectedSquare(null);
  };

  const goBackMove = () => {
    if (currentMoveIndex > 0) {
      // Rebuild game from scratch up to currentMoveIndex - 1
      const newGame = new Chess();
      const targetIndex = Math.max(0, currentMoveIndex - 1);
      
      for (let i = 0; i < targetIndex; i++) {
        try {
          newGame.move(currentLine.moves[i]);
        } catch (e) {
          break;
        }
      }
      
      setGame(newGame);
      setCurrentMoveIndex(targetIndex);
      setFeedback(null);
      setShowHint(false);
      setSelectedSquare(null);
      setCustomSquareStyles({});
    }
  };

  const resetLine = () => {
    setGame(new Chess());
    setCurrentMoveIndex(0);
    setFeedback(null);
    setShowHint(false);
    setSelectedSquare(null);
    setCustomSquareStyles({});
    setLineCorrectMoves(0);
    setLineTotalMoves(0);
    setHadMistake(false);
    setRepeatPending(false);
  };

  const previousLine = () => {
    if (lineHistory.length > 1) {
      const newHistory = [...lineHistory];
      newHistory.pop(); // Remove current
      const prevIndex = newHistory[newHistory.length - 1];
      setLineHistory(newHistory);
      setCurrentLineIndex(prevIndex);
      setGame(new Chess());
      setCurrentMoveIndex(0);
      setFeedback(null);
      setShowHint(false);
      setSelectedSquare(null);
      setCustomSquareStyles({});
      setLineCorrectMoves(0);
      setLineTotalMoves(0);
    }
  };

  const nextLine = () => {
    const nextIndex = currentLineIndex < lines.length - 1 ? currentLineIndex + 1 : 0;
    setCurrentLineIndex(nextIndex);
    setLineHistory(prev => [...prev, nextIndex]);
    setGame(new Chess());
    setCurrentMoveIndex(0);
    setFeedback(null);
    setShowHint(false);
    setSelectedSquare(null);
    setCustomSquareStyles({});
    setLineCorrectMoves(0);
    setLineTotalMoves(0);
    setHadMistake(false);
    setRepeatPending(false);
  };

  const revealHint = () => {
    setShowHint(true);
    setHadMistake(true);
  };

  const accuracy = totalMoves > 0 ? Math.round((correctMoves / totalMoves) * 100) : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
      {/* Eval bar + Chessboard */}
      <div className="flex gap-2 items-stretch w-full max-w-[540px] mx-auto lg:mx-0">
        <EvalBar fen={game.fen()} orientation={playerColor} />
        <div className="relative flex-1">
        <div className="chess-board relative">
          <Chessboard
            position={game.fen()}
            onPieceDrop={handlePieceDrop}
            onSquareClick={handleSquareClick}
            boardOrientation={playerColor}
            arePremovesAllowed={true}
            showBoardNotation={settings.showCoordinates}
            customArrows={hintArrow}
            customBoardStyle={{
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
            customDarkSquareStyle={{
              backgroundColor: currentTheme.dark,
            }}
            customLightSquareStyle={{
              backgroundColor: currentTheme.light,
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
      </div>

      {/* Controls and info */}
      <div className="flex-1 w-full lg:max-w-sm space-y-6">
        {/* Settings button */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

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

          {/* Hint - always visible */}
          <div className="pt-2 border-t border-border">
            {currentMoveIndex >= currentLine.moves.length ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-primary font-medium">Line complete!</span>
              </div>
            ) : !isPlayerTurn ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                <span className="text-muted-foreground text-sm">Opponent's turn...</span>
              </div>
            ) : showHint ? (
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
                Show Move
              </Button>
            )}
          </div>
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
          <Button 
            variant="outline" 
            onClick={previousLine} 
            disabled={lineHistory.length <= 1}
            size="icon"
            className="shrink-0"
            title="Previous Line"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={goBackMove} 
            disabled={currentMoveIndex === 0}
            size="icon"
            className="shrink-0"
            title="Go Back a Move"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
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

      {/* Settings Modal */}
      <BoardSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />
    </div>
  );
};

export default ChessTrainer;
