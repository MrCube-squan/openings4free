import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ChessTrainer from '@/components/ChessTrainer';

import { courses } from '@/lib/courses';
import { getTrainingLines } from '@/lib/courseLines';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Dumbbell } from 'lucide-react';
import { useLearnedLines } from '@/hooks/useLearnedLines';
import { useCustomLines } from '@/hooks/useCustomLines';
import { useStreak } from '@/hooks/useStreak';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useMemo } from 'react';

type TrainingMode = 'learn' | 'drill';

const Train = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course');
  const initialMode = searchParams.get('mode') as TrainingMode | null;
  const startLineParam = searchParams.get('startLine');
  const course = courseId ? courses.find((c) => c.id === courseId) : null;
  const { t } = useLanguage();
  
  const [mode, setMode] = useState<TrainingMode>(initialMode || 'learn');
  const [trainerKey, setTrainerKey] = useState(0);
  const { markLineAsLearned, getLearnedLinesForCourse, getLearnedCount } = useLearnedLines();
  const { customLines } = useCustomLines(courseId || 'italian-game');
  const { recordActivity, refreshStreak } = useStreak();

  const builtInLines = getTrainingLines(courseId || 'italian-game');
  const allLines = useMemo(() => {
    const custom = customLines.map(cl => ({ name: cl.name, moves: cl.moves }));
    return [...builtInLines, ...custom];
  }, [builtInLines, customLines]);
  
  const learnedLinesData = getLearnedLinesForCourse(courseId || 'italian-game');
  const learnedCount = getLearnedCount(courseId || 'italian-game');
  
  const startLineIndex = startLineParam ? parseInt(startLineParam, 10) : undefined;

  const trainingLines = useMemo(() => {
    if (mode === 'drill') {
      const learnedIndices = new Set(learnedLinesData.map(l => l.lineIndex));
      const drillLines = allLines.filter((_, index) => learnedIndices.has(index));
      return drillLines.length > 0 ? drillLines : allLines;
    }
    return allLines;
  }, [mode, allLines, learnedLinesData]);

  const handleLineComplete = async (lineIndex: number, accuracy: number) => {
    await recordActivity();
    refreshStreak();
    
    if (courseId) {
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
                    {t('train.backToCourse')}
                  </Link>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">{course.name}</h1>
                    <Badge variant={mode === 'drill' ? 'destructive' : 'secondary'}>
                      {mode === 'drill' ? (
                        <>
                          <Dumbbell className="h-3 w-3 mr-1" />
                          {t('train.drilling')} 🎯
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-3 w-3 mr-1" />
                          {t('train.learning')}
                        </>
                      )}
                    </Badge>
                  </div>
                  {learnedCount > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {learnedCount} {t('general.of')} {allLines.length} {t('general.linesLearned')}
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
                    {t('train.browseCourses')}
                  </Link>
                  <h1 className="text-3xl font-bold">{t('train.trainingDemo')}</h1>
                  <p className="text-muted-foreground">{t('train.tryItalian')}</p>
                </>
              )}
            </motion.div>

            {/* Mode toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {course && (
                <div className="flex rounded-lg border border-border bg-card p-1">
                  <Button
                    variant={mode === 'learn' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('learn')}
                    className="gap-1.5"
                  >
                    <BookOpen className="h-4 w-4" />
                    {t('general.learn')}
                  </Button>
                  <Button
                    variant={mode === 'drill' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('drill')}
                    disabled={!canDrill}
                    className="gap-1.5"
                    title={!canDrill ? t('course.unlockDrill') : undefined}
                  >
                    <Dumbbell className="h-4 w-4" />
                    {t('general.drill')}
                  </Button>
                </div>
              )}
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
              <h3 className="text-lg font-bold mb-2">{t('train.noDrillYet')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('train.noDrillDesc')}
              </p>
              <Button onClick={() => setMode('learn')}>
                <BookOpen className="h-4 w-4 mr-2" />
                {t('train.startLearning')}
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
              key={trainerKey}
              lines={trainingLines}
              playerColor={course?.color || 'white'}
              courseName={course?.name || 'Italian Game'}
              courseId={courseId || 'italian-game'}
              onLineComplete={handleLineComplete}
              onMarkAsLearned={(lineIndex) => {
                if (courseId) {
                  markLineAsLearned(courseId, lineIndex, 100);
                }
              }}
              startLineIndex={startLineIndex}
              mode={mode}
            />
          </motion.div>

          {/* Help text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-4 rounded-lg bg-card border border-border"
          >
            <h3 className="font-bold mb-2">{t('train.howToTrain')}</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {t('train.makeMove')} ({course?.color === 'black' ? t('courses.black') : t('courses.white')})</li>
              <li>• {t('train.opponentAuto')}</li>
              <li>• {t('train.wrongFeedback')}</li>
              <li>• {t('train.hintTip')}</li>
              <li>• {t('train.drillUnlock')}</li>
              <li>• {t('train.arrowColors')}</li>
            </ul>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Train;
