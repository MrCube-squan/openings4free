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
import { useCustomLines, CustomLineData } from '@/hooks/useCustomLines';
import LineEditor from '@/components/LineEditor';
import { ArrowLeft, BookOpen, Play, Dumbbell, Plus, Pencil, Trash2, Check, ChevronDown, ChevronRight, X as XIcon } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === courseId);
  const { getLearnedCount, isLineLearned } = useLearnedLines();
  const { customLines, addLine, updateLine, deleteLine } = useCustomLines(courseId || '');
  
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<CustomLineData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lineToDelete, setLineToDelete] = useState<string | null>(null);
  const [isBuiltInDelete, setIsBuiltInDelete] = useState(false);
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const stored = localStorage.getItem(`openings4free_hidden_lines_${courseId}`);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Mainline']));

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

  // Categorize built-in lines
  const categorizedBuiltInLines = useMemo(() => {
    return categorizeLines(allLines);
  }, [allLines]);

  // Categorize custom lines
  const categorizedCustomLines = useMemo(() => {
    const customTrainingLines: TrainingLine[] = customLines.map(cl => ({
      name: cl.name,
      moves: cl.moves,
    }));
    return categorizeLines(customTrainingLines);
  }, [customLines]);

  // Merge categories and filter hidden lines
  const allCategories = useMemo(() => {
    const merged = new Map<string, CategorizedLine[]>();
    
    // Add built-in lines (filter out hidden ones)
    categorizedBuiltInLines.forEach((lines, category) => {
      const visibleLines = lines.filter(l => !hiddenLines.has(`builtin_${l.index}`));
      if (visibleLines.length > 0) {
        merged.set(category, [...visibleLines]);
      }
    });
    
    // Add custom lines
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

  const sortedCategoryNames = useMemo(() => {
    return getSortedCategories(allCategories);
  }, [allCategories]);

  // Get starting moves for the opening
  const getStartingMoves = () => {
    if (!course) return [];
    // Parse the moves string like "1.e4 e5 2.Nf3 Nc6 3.Bc4"
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

  const handleSaveLine = (name: string, moves: string[], category: string) => {
    if (editingLine) {
      updateLine(editingLine.id, { name, moves, category });
    } else {
      addLine(name, moves, category);
    }
    setEditingLine(null);
  };

  const handleEditLine = (line: CustomLineData) => {
    setEditingLine(line);
    setEditorOpen(true);
  };

  const handleDeleteClick = (lineId: string, isBuiltIn: boolean = false) => {
    setLineToDelete(lineId);
    setIsBuiltInDelete(isBuiltIn);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (lineToDelete) {
      if (isBuiltInDelete) {
        addHiddenLine(lineToDelete);
      } else {
        deleteLine(lineToDelete);
      }
      setLineToDelete(null);
      setIsBuiltInDelete(false);
    }
    setDeleteDialogOpen(false);
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

  const isCustomLine = (lineName: string) => {
    return customLines.some(cl => cl.name === lineName);
  };

  const getCustomLineData = (lineName: string) => {
    return customLines.find(cl => cl.name === lineName);
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-bold">Course not found</h1>
          <Link to="/courses" className="text-primary hover:underline mt-4 inline-block">
            Back to courses
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
          {/* Back link */}
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to courses
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted text-4xl">
                    {course.color === 'white' ? '♔' : '♚'}
                  </div>
                  <div>
                    <span className="text-sm font-mono text-muted-foreground">{course.eco}</span>
                    <h1 className="text-3xl md:text-4xl font-bold">{course.name}</h1>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xl text-muted-foreground mb-8">
                  {course.description}
                </p>

                {/* Stats */}
                <div className="flex gap-4 mb-8">
                  <div className="inline-flex rounded-xl border border-border bg-card p-4">
                    <BookOpen className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <div className="text-2xl font-bold">{totalLines}</div>
                      <div className="text-sm text-muted-foreground">Total Lines</div>
                    </div>
                  </div>
                  {customLines.length > 0 && (
                    <div className="inline-flex rounded-xl border border-border bg-card p-4">
                      <Plus className="h-5 w-5 text-accent mr-3" />
                      <div>
                        <div className="text-2xl font-bold">{customLines.length}</div>
                        <div className="text-sm text-muted-foreground">Custom Lines</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Starting position */}
                <div className="rounded-xl border border-border bg-card p-6 mb-8">
                  <h3 className="font-bold mb-3">Starting Position</h3>
                  <code className="text-lg font-mono text-primary">{course.moves}</code>
                </div>

                {/* All lines by category */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Lines in this course</h3>
                    <Button
                      onClick={() => {
                        setEditingLine(null);
                        setEditorOpen(true);
                      }}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Line
                    </Button>
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
                              const customData = isCustomLine(line.name) ? getCustomLineData(line.name) : null;
                              
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
                                      <span className="font-medium truncate block">{line.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {line.moves.length} moves
                                        {customData && <span className="ml-1 text-accent">★ Custom</span>}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {customData && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditLine(customData);
                                        }}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(customData?.id || `builtin_${line.index}`, !customData);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => handleStartLine(line.index)}
                                    >
                                      <Play className="h-4 w-4 mr-1" />
                                      Learn
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
                  <h3 className="font-bold mb-4">Start Training</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Learn the moves that real players at your rating actually play.
                  </p>
                  
                  {/* Progress indicator */}
                  {learnedCount > 0 && (
                    <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="text-sm font-medium text-primary">
                        {learnedCount} of {totalLines} lines learned
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(learnedCount / totalLines) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <Link to={`/train?course=${course.id}`}>
                    <Button variant="hero" size="lg" className="w-full">
                      <Play className="h-5 w-5 mr-2" />
                      Learn New Lines
                    </Button>
                  </Link>
                  
                  {/* Drill button */}
                  <Link to={`/train?course=${course.id}&mode=drill`}>
                    <Button 
                      variant={canDrill ? "secondary" : "ghost"} 
                      size="lg" 
                      className="w-full mt-2"
                      disabled={!canDrill}
                    >
                      <Dumbbell className="h-5 w-5 mr-2" />
                      {canDrill ? `Drill ${learnedCount} Learned Lines` : 'Learn lines to unlock drilling'}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Line Editor Modal */}
      <LineEditor
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingLine(null);
        }}
        onSave={handleSaveLine}
        initialName={editingLine?.name || ''}
        initialMoves={editingLine?.moves || []}
        initialCategory={editingLine?.category || 'Custom'}
        courseColor={course.color}
        startingMoves={getStartingMoves()}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Line</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this custom line? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CourseDetail;
