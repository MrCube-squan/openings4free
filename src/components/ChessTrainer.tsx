import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import EvalBar from '@/components/EvalBar';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, RotateCcw, ArrowRight, ArrowLeft, Lightbulb, Settings, Undo2, MessageSquare, Mail, LogIn, BookmarkCheck, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBoardSettings } from '@/hooks/useBoardSettings';
import BoardSettingsModal from '@/components/BoardSettingsModal';

import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useLineNotes } from '@/hooks/useLineNotes';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import FlameOverlay from '@/components/FlameOverlay';
import { useStreak } from '@/hooks/useStreak';

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
  onMarkAsLearned?: (lineIndex: number) => void;
  startLineIndex?: number;
  mode?: 'learn' | 'drill';
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

const HIDDEN_KNIGHT_ARROW_COLOR = 'rgba(0,0,0,0)';

const areArrowListsEqual = (
  a: Array<[Square, Square, string]>,
  b: Array<[Square, Square, string]>
): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1] || a[i][2] !== b[i][2]) return false;
  }
  return true;
};

const isSameKnightArrow = (
  a: { from: Square; to: Square; color: string } | null,
  b: { from: Square; to: Square; color: string } | null
): boolean => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.from === b.from && a.to === b.to && a.color === b.color;
};

const ChessTrainer = ({ lines, playerColor, courseName, courseId, onLineComplete, onMarkAsLearned, startLineIndex, mode = 'learn' }: ChessTrainerProps) => {
  const [game, setGame] = useState(new Chess());
  const [showFlame, setShowFlame] = useState(false);
  const { streak } = useStreak();
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
  // Tracks if the user used navigation arrows / autoplay to traverse the line
  // instead of actually playing it. Disqualifies the line from being marked learned.
  const [usedNavigation, setUsedNavigation] = useState(false);
  // linePass: 1 = guided (moves shown), 2 = test (moves hidden)
  const [linePass, setLinePass] = useState<1 | 2>(1);
  const [pass1Perfect, setPass1Perfect] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [customSquareStyles, setCustomSquareStyles] = useState<Record<string, Record<string, string | number>>>({});
  const [markLearntAnimating, setMarkLearntAnimating] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingPremove, setPendingPremove] = useState<{ from: string; to: string; piece: string } | null>(null);
  const [arrowColor, setArrowColor] = useState('rgb(255,170,0)');
  const [userKnightArrow, setUserKnightArrow] = useState<{ from: Square; to: Square; color: string } | null>(null);
  const [userNonKnightArrows, setUserNonKnightArrows] = useState<Array<[Square, Square, string]>>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const userKnightArrowRef = useRef<{ from: Square; to: Square; color: string } | null>(null);

  useEffect(() => {
    userKnightArrowRef.current = userKnightArrow;
  }, [userKnightArrow]);
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
  const { isAuthenticated, user } = useAuth();
  const { notes, saveNote } = useLineNotes(courseId, currentLineIndex);
  const [noteInput, setNoteInput] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const currentLine = lines[currentLineIndex];
  const isPlayerTurn = (game.turn() === 'w') === (playerColor === 'white');

  const shouldPlayFlameToday = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    const storageKey = `streak-flame:last-played:${user?.id ?? 'anon'}`;

    try {
      const lastPlayed = window.localStorage.getItem(storageKey);
      if (lastPlayed === today) return false;

      window.localStorage.setItem(storageKey, today);
      return true;
    } catch {
      return true;
    }
  }, [user?.id]);

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

  const allKnightArrows = useMemo(() => {
    const result: Array<{ from: Square; to: Square; color: string }> = [];
    if (hintData.knightArrow) {
      result.push({ ...hintData.knightArrow, color: 'hsl(38, 95%, 55%)' });
    }
    if (userKnightArrow) {
      result.push(userKnightArrow);
    }
    return result;
  }, [hintData.knightArrow, userKnightArrow]);

  // Combine hint non-knight arrows with user arrows.
  // Knight arrows are kept in chessboard state as transparent so they persist,
  // while the visible knight arrow is rendered by the SVG overlay.
  const combinedArrows = useMemo(() => {
    const hiddenKnight = userKnightArrow
      ? ([[userKnightArrow.from, userKnightArrow.to, HIDDEN_KNIGHT_ARROW_COLOR]] as Array<[Square, Square, string]>)
      : [];

    return [...hintData.arrows, ...userNonKnightArrows, ...hiddenKnight] as Array<[Square, Square, string]>;
  }, [hintData.arrows, userNonKnightArrows, userKnightArrow]);

  const handleArrowsChange = useCallback((arrows: Array<[Square, Square, string?]>) => {
    // react-chessboard fires onArrowsChange([]) during internal re-syncs and piece interactions.
    // Ignore empty calls so completed user arrows are managed only by explicit left-click clears.
    if (arrows.length === 0) return;

    // Process incoming arrows — separate knight vs non-knight
    for (const arr of arrows) {
      const [from, to, color] = arr;
      if (color === HIDDEN_KNIGHT_ARROW_COLOR) continue; // skip our own hidden placeholders

      if (isKnightMove(from, to)) {
        const resolvedColor = color || arrowColor;
        setUserKnightArrow((prev) => {
          // Toggle off if same arrow already exists
          if (prev && prev.from === from && prev.to === to) return null;
          return { from, to, color: resolvedColor };
        });
      } else {
        const resolvedColor = color || arrowColor;
        setUserNonKnightArrows((prev) => {
          // Toggle off if same from-to already exists
          const existingIdx = prev.findIndex(a => a[0] === from && a[1] === to);
          if (existingIdx !== -1) {
            return prev.filter((_, i) => i !== existingIdx);
          }
          return [...prev, [from, to, resolvedColor]];
        });
      }
    }
  }, [arrowColor]);

  // Clear user-drawn arrows when position changes
  const prevFenRef = useRef(game.fen());
  useEffect(() => {
    const currentFen = game.fen();
    if (prevFenRef.current !== currentFen) {
      prevFenRef.current = currentFen;
      setUserKnightArrow(null);
      setUserNonKnightArrows([]);
    }
  }, [game]);

  const isDrillMode = mode === 'drill';

  const checkLineComplete = useCallback((moveIdx: number) => {
    if (moveIdx >= currentLine.moves.length) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      
      // Show flame overlay only once per day (first line completion)
      if (shouldPlayFlameToday()) {
        setShowFlame(true);
        setTimeout(() => setShowFlame(false), 2000);
      }
      
      setTimeout(() => {
        setLinesCompleted(prev => prev + 1);
        
        if (isDrillMode) {
          // Drill mode: single pass, mistakes require repeat
          if (hadMistake || usedNavigation) {
            resetLine();
          } else {
            if (onLineComplete) {
              onLineComplete(currentLineIndex, 100);
            }
            nextLine();
          }
        } else {
          // Learn mode: two-pass system
          if (hadMistake || usedNavigation) {
            resetLine();
          } else if (linePass === 1) {
            setPass1Perfect(true);
            setLinePass(2);
            resetLine();
          } else {
            if (pass1Perfect && onLineComplete) {
              onLineComplete(currentLineIndex, 100);
            }
            setLinePass(1);
            setPass1Perfect(false);
            nextLine();
          }
        }
      }, 1000);
    }
  }, [currentLine.moves.length, onLineComplete, currentLineIndex, hadMistake, usedNavigation, linePass, pass1Perfect, shouldPlayFlameToday, isDrillMode]);

  const makeOpponentMove = useCallback(() => {
    if (isPlaying) return;
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
  }, [game, currentLine, currentMoveIndex, isPlayerTurn, pendingPremove, checkLineComplete, isPlaying]);

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
        promotion: 'q',
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
        // Mark as mistake requiring repeat in pass 2 (test mode) or drill mode
        if (linePass === 2 || isDrillMode) {
          setHadMistake(true);
        }
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
    setUserKnightArrow(null);
    setUserNonKnightArrows([]);

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

  // Throttle stepping so rapid clicks wait for the board animation to finish
  const STEP_ANIMATION_MS = 250;
  const stepLockRef = useRef(false);
  const lockStep = () => {
    stepLockRef.current = true;
    setTimeout(() => { stepLockRef.current = false; }, STEP_ANIMATION_MS);
  };

  // Step exactly one half-move forward through the line (playback control)
  const stepForward = useCallback(() => {
    if (stepLockRef.current) return;
    if (currentMoveIndex >= currentLine.moves.length) return;
    const newGame = new Chess(game.fen());
    try {
      newGame.move(currentLine.moves[currentMoveIndex]);
      lockStep();
      setGame(newGame);
      setCurrentMoveIndex((i) => i + 1);
      setSelectedSquare(null);
      setCustomSquareStyles({});
      setUsedNavigation(true);
    } catch (e) {
      // ignore
    }
  }, [game, currentLine.moves, currentMoveIndex]);

  // Step exactly one half-move backward (uses chess.js undo for a single mutation)
  const stepBackward = () => {
    if (stepLockRef.current) return;
    if (currentMoveIndex === 0) return;
    const newGame = new Chess(game.fen());
    try {
      newGame.undo();
      lockStep();
      setGame(newGame);
      setCurrentMoveIndex((i) => i - 1);
      setSelectedSquare(null);
      setCustomSquareStyles({});
      setIsPlaying(false);
      setUsedNavigation(true);
    } catch (e) {
      // ignore
    }
  };

  // Autoplay: step through moves while isPlaying
  useEffect(() => {
    if (!isPlaying) return;
    if (currentMoveIndex >= currentLine.moves.length) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      stepForward();
    }, STEP_ANIMATION_MS + 500);
    return () => clearTimeout(timer);
  }, [isPlaying, currentMoveIndex, currentLine.moves.length, stepForward]);

  // Stop autoplay when line changes
  useEffect(() => {
    setIsPlaying(false);
  }, [currentLineIndex]);


  const resetLine = () => {
    setGame(new Chess());
    setCurrentMoveIndex(0);
    setFeedback(null);
    setShowHint(false);
    setSelectedSquare(null);
    setCustomSquareStyles({});
    setHadMistake(false);
    setUserKnightArrow(null);
    setUserNonKnightArrows([]);
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
      setUserKnightArrow(null);
      setUserNonKnightArrows([]);
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
    setUserKnightArrow(null);
    setUserNonKnightArrows([]);
  };

  const revealHint = () => {
    setShowHint(true);
    setUserKnightArrow(null);
    setUserNonKnightArrows([]);
    if (linePass === 2 || isDrillMode) {
      setHadMistake(true);
    }
    setTotalMistakes(prev => prev + 1);
  };

  const accuracy = totalMoves > 0 ? Math.round(((totalMoves - totalMistakes) / totalMoves) * 100) : 0;

  return (
    <>
    <FlameOverlay show={showFlame} streak={streak} />
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
      {/* Chessboard */}
      <div className="flex gap-2 items-stretch w-full max-w-[520px] mx-auto lg:mx-0">
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
              customArrows={combinedArrows}
              customArrowColor={arrowColor}
              onArrowsChange={handleArrowsChange}
              animationDuration={250}
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
            {!isDrillMode && (
              <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                linePass === 1 
                  ? 'bg-accent/15 text-accent' 
                  : 'bg-primary/15 text-primary'
              }`}>
                {linePass === 1 ? `${t('trainer.pass')} 1 — ${t('train.learning')}` : `${t('trainer.pass')} 2 — ${t('trainer.test')}`}
              </div>
            )}
            {isDrillMode && (
              <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">
                {t('train.drilling')} 🎯
              </div>
            )}
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
            ) : ((linePass === 1 && !isDrillMode) || showHint) ? (
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

        {/* Line playback controls */}
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={stepBackward}
            disabled={currentMoveIndex === 0}
            title="Previous move"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={() => {
              if (currentMoveIndex >= currentLine.moves.length) {
                // Restart from beginning if line is finished
                setGame(new Chess());
                setCurrentMoveIndex(0);
                setFeedback(null);
                setShowHint(false);
                setSelectedSquare(null);
                setCustomSquareStyles({});
              }
              setIsPlaying((p) => !p);
            }}
            title={isPlaying ? 'Pause' : 'Play line'}
            className="rounded-full"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setIsPlaying(false); stepForward(); }}
            disabled={currentMoveIndex >= currentLine.moves.length}
            title="Next move"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" onClick={previousLine} disabled={lineHistory.length <= 1} size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goBackMove} disabled={currentMoveIndex === 0} size="icon" className="shrink-0">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="secondary" onClick={resetLine} className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Position
          </Button>
          <Button variant="default" onClick={nextLine} className="flex-1">
            {t('trainer.next')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Mark as Learnt button (learn mode only) */}
        {!isDrillMode && onMarkAsLearned && (
          <Button
            variant="outline"
            onClick={() => {
              setMarkLearntAnimating(true);
              onMarkAsLearned(currentLineIndex);
              setTimeout(() => setMarkLearntAnimating(false), 1200);
            }}
            className={`w-full transition-all duration-500 ${
              markLearntAnimating 
                ? 'bg-primary border-primary text-primary-foreground scale-105' 
                : 'border-primary/30 text-primary hover:bg-primary/10'
            }`}
          >
            <BookmarkCheck className={`h-4 w-4 mr-2 transition-transform duration-500 ${markLearntAnimating ? 'scale-125' : ''}`} />
            {markLearntAnimating ? '✓' : (t('trainer.markAsLearnt') || 'Mark as Learnt')}
          </Button>
        )}

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
    </>
  );
};

export default ChessTrainer;
