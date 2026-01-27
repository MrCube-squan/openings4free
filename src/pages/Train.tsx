import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ChessTrainer from '@/components/ChessTrainer';
import { courses } from '@/lib/courses';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Flame, Trophy } from 'lucide-react';

const Train = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course');
  const course = courseId ? courses.find((c) => c.id === courseId) : null;

  // Sample training lines
  const trainingLines = [
    {
      name: 'Italian Game: Main Line',
      moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'd6'],
    },
    {
      name: 'Italian Game: Evans Gambit',
      moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4'],
    },
    {
      name: 'Italian Game: Two Knights Defense',
      moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'd4', 'exd4'],
    },
    {
      name: 'Italian Game: Giuoco Piano',
      moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'd3', 'Nf6'],
    },
  ];

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
                  <h1 className="text-3xl font-bold">{course.name}</h1>
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

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-4"
            >
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
            </motion.div>
          </div>

          {/* Trainer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ChessTrainer
              lines={trainingLines}
              playerColor="white"
              courseName={course?.name || 'Italian Game'}
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
              <li>• Make the correct move for your color (White in this demo)</li>
              <li>• The opponent's moves are played automatically</li>
              <li>• Wrong moves show feedback and you can try again</li>
              <li>• Use the hint button if you're stuck</li>
              <li>• Complete lines to build your repertoire memory</li>
            </ul>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Train;
