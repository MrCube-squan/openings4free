import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ChessTrainer from '@/components/ChessTrainer';
import { courses } from '@/lib/courses';
import { getTrainingLines } from '@/lib/courseLines';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Flame, Trophy, BookOpen, Dumbbell } from 'lucide-react';
import { useLearnedLines } from '@/hooks/useLearnedLines';
import { useState, useMemo } from 'react';

type TrainingMode = 'learn' | 'drill';

const Train = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course');
  const initialMode = searchParams.get('mode') as TrainingMode | null;
  const course = courseId ? courses.find((c) => c.id === courseId) : null;
  
  const [mode, setMode] = useState<TrainingMode>(initialMode || 'learn');
  const { markLineAsLearned, getLearnedLinesForCourse, getLearnedCount } = useLearnedLines();

  // Get training lines for the selected course
  const allLines = getTrainingLines(courseId || 'italian-game');
  const learnedLinesData = getLearnedLinesForCourse(courseId || 'italian-game');
  const learnedCount = getLearnedCount(courseId || 'italian-game');

  // Filter lines based on mode
  const trainingLines = useMemo(() => {
    if (mode === 'drill') {
      const learnedIndices = new Set(learnedLinesData.map(l => l.lineIndex));
      const drillLines = allLines.filter((_, index) => learnedIndices.has(index));
      // Return all lines if no lines learned yet (fallback)
      return drillLines.length > 0 ? drillLines : allLines;
    }
    return allLines;
  }, [mode, allLines, learnedLinesData]);

  const handleLineComplete = (lineIndex: number, accuracy: number) => {
    if (courseId) {
      // Map back to original index if in drill mode
      if (mode === 'drill') {
        const learnedIndices = learnedLinesData.map(l => l.lineIndex);
        const originalIndex = learnedIndices[lineIndex] ?? lineIndex;
        markLineAsLearned(courseId, originalIndex, accuracy);
      } else {
        markLineAsLearned(courseId, lineIndex, accuracy);
      }
    }
  };

  const canDrill = learnedCount > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {course ? (
                <>
                  <Link
                    to={`/course/${course.id}`}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to course
                  </Link>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">{course.name}</h1>
                    <Badge variant={mode === 'drill' ? 'default' : 'secondary'}>
                      {mode === 'drill' ? (
                        <>
                          <Dumbbell className="h-3 w-3 mr-1" />
                          Drilling
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-3 w-3 mr-1" />
                          Learning
                        </>
                      )}
                    </Badge>
                  </div>
                  {learnedCount > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {learnedCount} of {allLines.length} lines learned
                    </p>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Browse courses
                  </Link>
                  <h1 className="text-3xl font-bold">Training Demo</h1>
                  <p className="text-muted-foreground">Try the Italian Game opening</p>
                </>
              )}
            </motion.div>

            {/* Mode toggle & stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {/* Mode toggle */}
              {course && (
                <div className="flex rounded-lg border border-border bg-card p-1">
                  <Button
                    variant={mode === 'learn' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('learn')}
                    className="gap-1.5"
                  >
                    <BookOpen className="h-4 w-4" />
                    Learn
                  </Button>
                  <Button
                    variant={mode === 'drill' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('drill')}
                    disabled={!canDrill}
                    className="gap-1.5"
                    title={!canDrill ? 'Complete some lines first to unlock drilling' : undefined}
                  >
                    <Dumbbell className="h-4 w-4" />
                    Drill
                  </Button>
                </div>
              )}

              {/* Quick stats */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                  <Flame className="h-4 w-4 text-streak" />
                  <span className="font-bold">3</span>
                  <span className="text-sm text-muted-foreground">day streak</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-bold">12</span>
                  <span className="text-sm text-muted-foreground">due today</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                  <Trophy className="h-4 w-4 text-xp" />
                  <span className="font-bold">450</span>
                  <span className="text-sm text-muted-foreground">XP</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Drill mode empty state */}
          {mode === 'drill' && learnedCount === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 rounded-xl border border-border bg-card text-center"
            >
              <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-bold mb-2">No lines to drill yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete some lines with 80%+ accuracy in Learn mode to unlock drilling.
              </p>
              <Button onClick={() => setMode('learn')}>
                <BookOpen className="h-4 w-4 mr-2" />
                Start Learning
              </Button>
            </motion.div>
          )}

          {/* Trainer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ChessTrainer
              lines={trainingLines}
              playerColor={course?.color || 'white'}
              courseName={course?.name || 'Italian Game'}
              courseId={courseId || 'italian-game'}
              onLineComplete={handleLineComplete}
            />
          </motion.div>

          {/* Help text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-4 rounded-lg bg-card border border-border"
          >
            <h3 className="font-bold mb-2">How to train</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Make the correct move for your color ({course?.color === 'black' ? 'Black' : 'White'} in this course)</li>
              <li>• The opponent's moves are played automatically</li>
              <li>• Wrong moves show feedback and you can try again</li>
              <li>• Use the hint button if you're stuck (shows an arrow on the board!)</li>
              <li>• Complete lines with 80%+ accuracy to unlock Drill mode</li>
            </ul>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Train;
