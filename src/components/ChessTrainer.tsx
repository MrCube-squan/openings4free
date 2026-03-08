import { useState, useCallback, useEffect, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, RotateCcw, ArrowRight, ArrowLeft, Lightbulb, Settings, Undo2, MessageSquare, Mail, LogIn } from 'lucide-react';
import { useBoardSettings } from '@/hooks/useBoardSettings';
import BoardSettingsModal from '@/components/BoardSettingsModal';
import EvalBar from '@/components/EvalBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useLineNotes } from '@/hooks/useLineNotes';
import { Link } from 'react-router-dom';
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

const isKnightMove = (from: Square, to: Square): boolean => {
  const dx = Math.abs(from.charCodeAt(0) - to.charCodeAt(0));
  const dy = Math.abs(parseInt(from[1]) - parseInt(to[1]));
  return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
};

const squareToCoords = (sq: Square, orientation: 'white' | 'black'): { x: number; y: number } => {
  const file = sq.charCodeAt(0) - 97; // a=0 ... h=7
  const rank = parseInt(sq[1]) - 1;   // 1=0 ... 8=7
  if (orientation === 'white') {
    return { x: file * 100 + 50, y: (7 - rank) * 100 + 50 };
  }
  return { x: (7 - file) * 100 + 50, y: rank * 100 + 50 };
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
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [hadMistake, setHadMistake] = useState(false);
  // linePass: 1 = guided (moves shown), 2 = test (moves hidden)
  const [linePass, setLinePass] = useState<1 | 2>(1);
  const [pass1Perfect, setPass1Perfect] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [customSquareStyles, setCustomSquareStyles] = useState<Record<string, Record<string, string | number>>>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingPremove, setPendingPremove] = useState<{ from: string; to: string; piece: string } | null>(null);
  const [arrowColor, setArrowColor] = useState('rgb(255,170,0)');

  // Listen for modifier keys to change arrow color
  useEffect(() => {
    const getColor = (e: KeyboardEvent | MouseEvent) => {
      if (e.ctrlKey || e.metaKey) return 'rgb(0,100,255)';
      if (e.altKey) return 'rgb(220,50,50)';
      if (e.shiftKey) return 'rgb(0,160,60)';
      return 'rgb(255,170,0)';
    };
    const onKey = (e: KeyboardEvent) => setArrowColor(getColor(e));
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, []);

  const { settings, updateSettings, currentTheme } = useBoardSettings();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { notes, saveNote } = useLineNotes(courseId, currentLineIndex);
  const [noteInput, setNoteInput] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const currentLine = lines[currentLineIndex];
  const isPlayerTurn = (game.turn() === 'w') === (playerColor === 'white');

  const hintData = useMemo(() => {
    if (!showHint || !isPlayerTurn || currentMoveIndex >= currentLine.moves.length) return { arrows: [], knightArrow: null };
    const expectedMove = currentLine.moves[currentMoveIndex];
    const arrow = getArrowFromMove(game, expectedMove);
    if (!arrow) return { arrows: [], knightArrow: null };
    if (isKnightMove(arrow[0], arrow[1])) {
      return { arrows: [], knightArrow: { from: arrow[0], to: arrow[1] } };
    }
    return { arrows: [[arrow[0], arrow[1], 'hsl(38, 95%, 55%)']] as Array<[Square, Square, string]>, knightArrow: null };
  }, [showHint, isPlayerTurn, currentMoveIndex, currentLine.moves, game]);

  // L-shaped knight arrows for hints only
  const allKnightArrows = useMemo(() => {
    if (hintData.knightArrow) {
      return [{ ...hintData.knightArrow, color: 'hsl(38, 95%, 55%)' }];
    }
    return [];
  }, [hintData.knightArrow]);

  const checkLineComplete = useCallback((moveIdx: number) => {
    if (moveIdx >= currentLine.moves.length) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      
      setTimeout(() => {
        setLinesCompleted(prev => prev + 1);
        
        if (hadMistake) {
          // Had a mistake — restart this pass
          resetLine();
        } else if (linePass === 1) {
          // Pass 1 perfect — move to pass 2 (test without shown moves)
          setPass1Perfect(true);
          setLinePass(2);
          resetLine();
        } else {
          // Pass 2 perfect (and pass1 was perfect) — mark as learned
          if (pass1Perfect && onLineComplete) {
            onLineComplete(currentLineIndex, 100);
          }
          setLinePass(1);
          setPass1Perfect(false);
          nextLine();
        }
      }, 1000);
    }
  }, [currentLine.moves.length, onLineComplete, currentLineIndex, hadMistake, linePass, pass1Perfect]);

  const makeOpponentMove = useCallback(() => {
    if (!isPlayerTurn && currentMoveIndex < currentLine.moves.length) {
      const move = currentLine.moves[currentMoveIndex];
      const delay = pendingPremove ? 250 : 400;
      setTimeout(() => {
        const newGame = new Chess(game.fen());
        try {
          newGame.move(move);
          setGame(newGame);
          const newMoveIndex = currentMoveIndex + 1;
          setCurrentMoveIndex(newMoveIndex);
          checkLineComplete(newMoveIndex);
        } catch (e) {
          console.error('Invalid move:', move);
        }
      }, delay);
    }
  }, [game, currentLine, currentMoveIndex, isPlayerTurn, pendingPremove, checkLineComplete]);

  useEffect(() => { makeOpponentMove(); }, [makeOpponentMove]);

  useEffect(() => {
    if (isPlayerTurn && pendingPremove) {
      const { from, to, piece } = pendingPremove;
      setPendingPremove(null);
      // Use rAF for immediate, smooth execution on touch devices
      requestAnimationFrame(() => { handlePieceDrop(from, to, piece); });
    }
  }, [isPlayerTurn, pendingPremove]);

  const handlePieceDrop = (sourceSquare: string, targetSquare: string, piece: string): boolean => {
    if (!isPlayerTurn) {
      setPendingPremove({ from: sourceSquare, to: targetSquare, piece });
      setCustomSquareStyles({
        [sourceSquare]: { backgroundColor: 'hsl(0, 72%, 55%, 0.4)' },
        [targetSquare]: { backgroundColor: 'hsl(0, 72%, 55%, 0.4)' },
      });
      // Return true to prevent snap-back animation — piece stays at target
      return true;
    }

    const expectedMove = currentLine.moves[currentMoveIndex];
    const newGame = new Chess(game.fen());

    try {
      const moveResult = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1]?.toLowerCase() === 'p' ? 'q' : undefined,
      });

      if (!moveResult) return false;

      const moveSan = moveResult.san;
      setTotalMoves(prev => prev + 1);

      const normalizeSan = (s: string) => s.replace(/x/g, '');
      if (moveSan === expectedMove || moveResult.lan === expectedMove || normalizeSan(moveSan) === normalizeSan(expectedMove)) {
        setGame(newGame);
        setCurrentMoveIndex(prev => prev + 1);
        setFeedback('correct');
        setShowHint(false);
        setCustomSquareStyles({
          [sourceSquare]: { backgroundColor: 'hsl(152, 76%, 45%, 0.4)' },
          [targetSquare]: { backgroundColor: 'hsl(152, 76%, 45%, 0.4)' },
        });
        setTimeout(() => { setFeedback(null); setCustomSquareStyles({}); }, 500);
        checkLineComplete(currentMoveIndex + 1);
        return true;
      } else {
        setHadMistake(true);
        setTotalMistakes(prev => prev + 1);
        setFeedback('incorrect');
        setCustomSquareStyles({
          [sourceSquare]: { backgroundColor: 'hsl(0, 72%, 55%, 0.4)' },
          [targetSquare]: { backgroundColor: 'hsl(0, 72%, 55%, 0.4)' },
        });
        setTimeout(() => { setFeedback(null); setCustomSquareStyles({}); }, 1000);
        return false;
      }
    } catch (e) {
      return false;
    }
  };

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

  const handleSquareClick = (square: string) => {
    // Allow premove selection during opponent's turn
    if (!isPlayerTurn) {
      const piece = game.get(square as Square);
      const playerPieceColor = playerColor === 'white' ? 'w' : 'b';

      if (!selectedSquare) {
        // Select a piece for premove
        if (piece && piece.color === playerPieceColor) {
          setSelectedSquare(square);
          setCustomSquareStyles({
            [square]: { backgroundColor: 'hsl(0, 72%, 55%, 0.4)' },
          });
        }
        return;
      }

      // If clicking another own piece, re-select it (allows changing premove piece)
      if (piece && piece.color === playerPieceColor) {
        if (selectedSquare === square) {
          // Deselect
          setSelectedSquare(null);
          setCustomSquareStyles({});
        } else {
          setSelectedSquare(square);
          setCustomSquareStyles({
            [square]: { backgroundColor: 'hsl(0, 72%, 55%, 0.4)' },
          });
        }
        return;
      }

      // Set premove via tap — allow any target square
      const selectedPiece = game.get(selectedSquare as Square);
      if (selectedPiece) {
        const pieceString = `${selectedPiece.color}${selectedPiece.type.toUpperCase()}`;
        setPendingPremove({ from: selectedSquare, to: square, piece: pieceString });
        setCustomSquareStyles({
          [selectedSquare]: { backgroundColor: 'hsl(0, 72%, 55%, 0.4)' },
          [square]: { backgroundColor: 'hsl(0, 72%, 55%, 0.4)' },
        });
      }
      setSelectedSquare(null);
      return;
    }

    // Normal turn: standard click-to-move
    if (!selectedSquare) {
      const piece = game.get(square as Square);
      if (piece && piece.color === (playerColor === 'white' ? 'w' : 'b')) {
        setSelectedSquare(square);
        setCustomSquareStyles(getLegalMoveStyles(square));
      }
      return;
    }
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setCustomSquareStyles({});
      return;
    }
    const piece = game.get(selectedSquare as Square);
    if (piece) {
      const pieceString = `${piece.color}${piece.type.toUpperCase()}`;
      const success = handlePieceDrop(selectedSquare, square, pieceString);
      if (!success) {
        const targetPiece = game.get(square as Square);
        if (targetPiece && targetPiece.color === (playerColor === 'white' ? 'w' : 'b')) {
          setSelectedSquare(square);
          setCustomSquareStyles(getLegalMoveStyles(square));
          return;
        }
      }
    }
    setSelectedSquare(null);
  };

  const goBackMove = () => {
    if (currentMoveIndex > 0) {
      // White: go back 2 half-moves (1 full move) to return to White's turn
      // Black: go back 3 half-moves to return to Black's previous turn
      // But at minimum, go back at least 1 move
      const stepsBack = playerColor === 'white' ? 2 : 3;
      const targetIndex = Math.max(0, currentMoveIndex - stepsBack);
      
      const newGame = new Chess();
      for (let i = 0; i < targetIndex; i++) {
        try { newGame.move(currentLine.moves[i]); } catch (e) { break; }
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
    setHadMistake(false);
  };

  const previousLine = () => {
    if (lineHistory.length > 1) {
      const newHistory = [...lineHistory];
      newHistory.pop();
      const prevIndex = newHistory[newHistory.length - 1];
      setLineHistory(newHistory);
      setCurrentLineIndex(prevIndex);
      setGame(new Chess());
      setCurrentMoveIndex(0);
      setFeedback(null);
      setShowHint(false);
      setSelectedSquare(null);
      setCustomSquareStyles({});
      setLinePass(1);
      setPass1Perfect(false);
      setHadMistake(false);
      setUserKnightArrows([]);
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
    setHadMistake(false);
    setLinePass(1);
    setPass1Perfect(false);
    setUserKnightArrows([]);
  };

  const revealHint = () => {
    setShowHint(true);
    setUserKnightArrows([]);
    setHadMistake(true);
    setTotalMistakes(prev => prev + 1);
  };

  const accuracy = totalMoves > 0 ? Math.round(((totalMoves - totalMistakes) / totalMoves) * 100) : 0;

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
              customArrows={hintData.arrows}
              customArrowColor={arrowColor}
              
              customBoardStyle={{
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
              customDarkSquareStyle={{ backgroundColor: currentTheme.dark }}
              customLightSquareStyle={{ backgroundColor: currentTheme.light }}
              customSquareStyles={customSquareStyles}
            />
            {/* L-shaped knight arrows overlay (hint + user-drawn) */}
            {allKnightArrows.length > 0 && (
              <svg
                viewBox="0 0 800 800"
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 10, borderRadius: '12px' }}
              >
                {allKnightArrows.map((ka, idx) => {
                  const from = squareToCoords(ka.from, playerColor);
                  const to = squareToCoords(ka.to, playerColor);
                  const adx = Math.abs(to.x - from.x);
                  const ady = Math.abs(to.y - from.y);
                  const mid = ady > adx
                    ? { x: from.x, y: to.y }
                    : { x: to.x, y: from.y };
                  const lastDx = to.x - mid.x;
                  const lastDy = to.y - mid.y;
                  const lastLen = Math.sqrt(lastDx * lastDx + lastDy * lastDy);
                  const ndx = lastDx / lastLen;
                  const ndy = lastDy / lastLen;
                  const headSize = 32;
                  const lineEnd = { x: to.x - ndx * headSize, y: to.y - ndy * headSize };
                  const baseX = to.x - ndx * headSize;
                  const baseY = to.y - ndy * headSize;
                  const perpX = -ndy;
                  const perpY = ndx;
                  const halfW = 22;
                  const arrowHead = `${to.x},${to.y} ${baseX + perpX * halfW},${baseY + perpY * halfW} ${baseX - perpX * halfW},${baseY - perpY * halfW}`;
                  return (
                    <g key={idx}>
                      <polyline
                        points={`${from.x},${from.y} ${mid.x},${mid.y} ${lineEnd.x},${lineEnd.y}`}
                        fill="none"
                        stroke={ka.color}
                        strokeWidth="22"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.8"
                      />
                      <polygon points={arrowHead} fill={ka.color} opacity="0.8" />
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

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
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-muted-foreground">{t('trainer.currentLine')}</div>
            <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              linePass === 1 
                ? 'bg-accent/15 text-accent' 
                : 'bg-primary/15 text-primary'
            }`}>
              {linePass === 1 ? `${t('trainer.pass')} 1 — ${t('train.learning')}` : `${t('trainer.pass')} 2 — ${t('trainer.test')}`}
            </div>
          </div>
          <div className="text-lg font-bold text-foreground mb-3">{currentLine.name}</div>
          
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

          <div className="pt-2 border-t border-border">
            {currentMoveIndex >= currentLine.moves.length ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-primary font-medium">{t('general.lineComplete')}</span>
              </div>
            ) : !isPlayerTurn ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                <span className="text-muted-foreground text-sm">{t('trainer.opponentTurn')}</span>
              </div>
            ) : (linePass === 1 || showHint) ? (
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
                {t('trainer.showMove')}
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="text-2xl font-bold text-primary">{linesCompleted}</div>
            <div className="text-xs text-muted-foreground">{t('general.lines')}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="text-2xl font-bold text-accent">{accuracy}%</div>
            <div className="text-xs text-muted-foreground">{t('trainer.accuracy')}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{totalMistakes}</div>
            <div className="text-xs text-muted-foreground">{t('trainer.mistakes')}</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={previousLine} disabled={lineHistory.length <= 1} size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goBackMove} disabled={currentMoveIndex === 0} size="icon" className="shrink-0">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="secondary" onClick={resetLine} className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('trainer.reset')}
          </Button>
          <Button variant="default" onClick={nextLine} className="flex-1">
            {t('trainer.next')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Personal Notes Section */}
        <div className="rounded-xl border border-border bg-card p-4">
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  {t('trainer.addNote')}
                </div>
                <span className="text-xs text-muted-foreground">
                  {t('general.moves')} {currentMoveIndex + 1}
                </span>
              </div>
              {notes.get(currentMoveIndex) && !showNoteInput && (
                <div
                  className="text-sm text-foreground bg-muted/50 rounded-lg p-3 cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => { setNoteInput(notes.get(currentMoveIndex) || ''); setShowNoteInput(true); }}
                >
                  {notes.get(currentMoveIndex)}
                </div>
              )}
              {showNoteInput ? (
                <div className="space-y-2">
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder={t('trainer.notePlaceholder')}
                    className="w-full text-sm bg-muted/30 border border-border rounded-lg p-3 resize-none focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        saveNote(currentMoveIndex, noteInput);
                        setShowNoteInput(false);
                        setNoteInput('');
                      }}
                      className="flex-1"
                    >
                      {t('trainer.savedNote')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setShowNoteInput(false); setNoteInput(''); }}
                    >
                      {t('trainer.cancel')}
                    </Button>
                  </div>
                </div>
              ) : !notes.get(currentMoveIndex) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNoteInput(true)}
                  className="w-full text-muted-foreground"
                >
                  {t('trainer.notePlaceholder')}
                </Button>
              )}
            </div>
          ) : (
            <Link to="/auth?mode=signup" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors group">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <LogIn className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {t('trainer.signInNotes')}
              </span>
            </Link>
          )}
        </div>

        {/* Error Report */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground px-1">
          <Mail className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            {t('trainer.errorReport')}{' '}
            <a href="mailto:mr.cubek6j@gmail.com" className="text-primary hover:underline">
              mr.cubek6j@gmail.com
            </a>
          </span>
        </div>
      </div>

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
