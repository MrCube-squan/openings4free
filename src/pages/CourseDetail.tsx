import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { courses } from '@/lib/courses';
import { ArrowLeft, BookOpen, Play } from 'lucide-react';

const CourseDetail = () => {
  const { courseId } = useParams();
  const course = courses.find((c) => c.id === courseId);

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

  // Sample lines for this course
  const sampleLines = [
    { name: 'Main Line', moves: 8 },
    { name: 'Classical Variation', moves: 10 },
    { name: 'Modern Approach', moves: 7 },
    { name: 'Anti-Theory Line', moves: 6 },
    { name: 'Sharp Gambit', moves: 12 },
  ];

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
                <div className="mb-8">
                  <div className="inline-flex rounded-xl border border-border bg-card p-4">
                    <BookOpen className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <div className="text-2xl font-bold">{course.lines}</div>
                      <div className="text-sm text-muted-foreground">Lines</div>
                    </div>
                  </div>
                </div>

                {/* Starting position */}
                <div className="rounded-xl border border-border bg-card p-6 mb-8">
                  <h3 className="font-bold mb-3">Starting Position</h3>
                  <code className="text-lg font-mono text-primary">{course.moves}</code>
                </div>

                {/* Sample lines */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Lines in this course</h3>
                  <div className="space-y-2">
                    {sampleLines.map((line, index) => (
                      <motion.div
                        key={line.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-card-hover transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="font-medium">{line.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{line.moves} moves</span>
                      </motion.div>
                    ))}
                    <div className="text-center text-muted-foreground text-sm py-4">
                      + {course.lines - sampleLines.length} more lines
                    </div>
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
                  <p className="text-sm text-muted-foreground mb-6">
                    Learn the moves that real players at your rating actually play.
                  </p>
                  <Link to={`/train?course=${course.id}`}>
                    <Button variant="hero" size="lg" className="w-full">
                      <Play className="h-5 w-5 mr-2" />
                      Start Course
                    </Button>
                  </Link>
                  <Link to="/train">
                    <Button variant="ghost" size="lg" className="w-full mt-2">
                      Try first line free
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
