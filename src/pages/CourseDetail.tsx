import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { courses } from '@/lib/courses';
import { getTrainingLines, TrainingLine } from '@/lib/courseLines';
import { categorizeLines, getSortedCategories, CategorizedLine } from '@/lib/lineCategories';
import { useLearnedLines } from '@/hooks/useLearnedLines';
import { useCustomLines } from '@/hooks/useCustomLines';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, BookOpen, Play, Dumbbell, Check, ChevronDown, ChevronRight, X as XIcon } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === courseId);
  const { getLearnedCount, isLineLearned, getLearnedLinesForCourse } = useLearnedLines();
  const { customLines } = useCustomLines(courseId || '');
  const { t } = useLanguage();
  
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const stored = localStorage.getItem(`openings4free_hidden_lines_${courseId}`);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Lines 1–10']));

  const addHiddenLine = (lineId: string) => {
    setHiddenLines(prev => {
      const newSet = new Set(prev);
      newSet.add(lineId);
      localStorage.setItem(`openings4free_hidden_lines_${courseId}`, JSON.stringify([...newSet]));
      return newSet;
    });
  };
  
  const allLines = courseId ? getTrainingLines(courseId) : [];
  const learnedCount = courseId ? getLearnedCount(courseId) : 0;
  const canDrill = learnedCount > 0;

  const categorizedBuiltInLines = useMemo(() => categorizeLines(allLines), [allLines]);

  const categorizedCustomLines = useMemo(() => {
    const customTrainingLines: TrainingLine[] = customLines.map(cl => ({
      name: cl.name,
      moves: cl.moves,
    }));
    return categorizeLines(customTrainingLines);
  }, [customLines]);

  const allCategories = useMemo(() => {
    const merged = new Map<string, CategorizedLine[]>();
    
    categorizedBuiltInLines.forEach((lines, category) => {
      const visibleLines = lines.filter(l => !hiddenLines.has(`builtin_${l.index}`));
      if (visibleLines.length > 0) {
        merged.set(category, [...visibleLines]);
      }
    });
    
    categorizedCustomLines.forEach((lines, category) => {
      if (merged.has(category)) {
        merged.get(category)!.push(...lines.map(l => ({
          ...l,
          index: allLines.length + customLines.findIndex(cl => cl.name === l.name),
        })));
      } else {
        merged.set(category, lines.map(l => ({
          ...l,
          index: allLines.length + customLines.findIndex(cl => cl.name === l.name),
        })));
      }
    });
    
    return merged;
  }, [categorizedBuiltInLines, categorizedCustomLines, allLines, customLines, hiddenLines]);

  const sortedCategoryNames = useMemo(() => getSortedCategories(allCategories), [allCategories]);

  const getStartingMoves = () => {
    if (!course) return [];
    const movesStr = course.moves;
    const moves: string[] = [];
    const regex = /(\d+\.+)?\s*([a-zA-Z0-9+#=\-]+)/g;
    let match;
    while ((match = regex.exec(movesStr)) !== null) {
      if (match[2] && !match[2].match(/^\d+$/)) {
        moves.push(match[2]);
      }
    }
    return moves;
  };

  const handleStartLine = (lineIndex: number) => {
    navigate(`/train?course=${courseId}&startLine=${lineIndex}`);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-bold">{t('course.notFound')}</h1>
          <Link to="/courses" className="text-primary hover:underline mt-4 inline-block">
            {t('course.backToCourses')}
          </Link>
        </div>
      </div>
    );
  }

  const totalLines = allLines.length + customLines.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('course.backToCourses')}
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted text-4xl">
                    {course.color === 'white' ? '♚' : '♔'}
                  </div>
                  <div>
                    <span className="text-sm font-mono text-muted-foreground">{course.eco}</span>
                    <h1 className="text-3xl md:text-4xl font-bold">{course.name}</h1>
                  </div>
                </div>

                <p className="text-xl text-muted-foreground mb-8">
                  {course.description}
                </p>

                <div className="flex gap-4 mb-8">
                  <div className="inline-flex rounded-xl border border-border bg-card p-4">
                    <BookOpen className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <div className="text-2xl font-bold">{totalLines}</div>
                      <div className="text-sm text-muted-foreground">{t('general.totalLines')}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 mb-8">
                  <h3 className="font-bold mb-3">{t('course.startingPosition')}</h3>
                  <code className="text-lg font-mono text-primary">{course.moves}</code>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{t('course.linesInCourse')}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {sortedCategoryNames.map((category) => {
                      const lines = allCategories.get(category) || [];
                      const isExpanded = expandedCategories.has(category);
                      
                      return (
                        <Collapsible
                          key={category}
                          open={isExpanded}
                          onOpenChange={() => toggleCategory(category)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-between p-4 h-auto rounded-lg border border-border bg-card hover:bg-card-hover"
                            >
                              <div className="flex items-center gap-3">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                <span className="font-semibold">{category}</span>
                                <Badge variant="secondary">{lines.length}</Badge>
                              </div>
                            </Button>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent className="mt-2 space-y-2 ml-4">
                            {lines.map((line, idx) => {
                              const isLearned = courseId && isLineLearned(courseId, line.index);
                              
                              return (
                                <motion.div
                                  key={`${category}-${line.name}-${idx}`}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.02 }}
                                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-card-hover transition-colors group"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                                      isLearned 
                                        ? 'bg-primary/20 text-primary' 
                                        : 'bg-muted text-muted-foreground'
                                    }`}>
                                      {isLearned ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        <XIcon className="h-4 w-4" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <span className="font-medium truncate block">
                                        <span className="text-muted-foreground font-mono text-xs mr-2">#{line.index + 1}</span>
                                        {line.name}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {line.moves.length} {t('general.moves')}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => handleStartLine(line.index)}
                                    >
                                      <Play className="h-4 w-4 mr-1" />
                                      {t('general.learn')}
                                    </Button>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="sticky top-24"
              >
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-bold mb-4">{t('general.startTraining')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('course.learnDescription')}
                  </p>
                  
                  {learnedCount > 0 && (
                    <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="text-sm font-medium text-primary">
                        {learnedCount} {t('general.of')} {totalLines} {t('general.linesLearned')}
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(learnedCount / totalLines) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {(() => {
                    const learnedSet = new Set(getLearnedLinesForCourse(course.id).map(l => l.lineIndex));
                    const firstUnlearned = Array.from({ length: totalLines }, (_, i) => i).find(i => !learnedSet.has(i));
                    const allLearned = firstUnlearned === undefined;
                    return allLearned ? (
                      <Button variant="hero" size="lg" className="w-full" disabled>
                        <Check className="h-5 w-5 mr-2" />
                        {t('general.allLearned')}
                      </Button>
                    ) : (
                      <Link to={`/train?course=${course.id}&startLine=${firstUnlearned}`}>
                        <Button variant="hero" size="lg" className="w-full">
                          <Play className="h-5 w-5 mr-2" />
                          {t('general.learnNewLines')}
                        </Button>
                      </Link>
                    );
                  })()}
                  
                  <Link to={`/train?course=${course.id}&mode=drill`}>
                    <Button 
                      variant={canDrill ? "secondary" : "ghost"} 
                      size="lg" 
                      className="w-full mt-2"
                      disabled={!canDrill}
                    >
                      <Dumbbell className="h-5 w-5 mr-2" />
                      {canDrill ? `${t('general.drill')} ${learnedCount} ${t('general.linesLearned')}` : t('course.unlockDrill')}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetail;
