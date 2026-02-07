import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import CourseCard from '@/components/CourseCard';
import { courses, Course } from '@/lib/courses';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, Plus } from 'lucide-react';
import { useCustomCourses } from '@/hooks/useCustomCourses';
import { useAuth } from '@/hooks/useAuth';
import CreateCourseModal from '@/components/CreateCourseModal';

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [colorFilter, setColorFilter] = useState<'all' | 'white' | 'black'>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { customCourses } = useCustomCourses();
  const { isAuthenticated } = useAuth();

  // Convert custom courses to Course format
  const allCourses: Course[] = [
    ...courses,
    ...customCourses.map(cc => ({
      id: cc.id,
      name: cc.name,
      eco: cc.eco,
      color: cc.color,
      lines: 0, // Will be calculated dynamically
      difficulty: 'intermediate' as const,
      description: cc.description,
      popularity: 0,
      moves: cc.moves,
    })),
  ];

  const filteredCourses = allCourses
    .filter((course) => {
      const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesColor = colorFilter === 'all' || course.color === colorFilter;
      return matchesSearch && matchesColor;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Opening Courses
            </h1>
            <p className="text-lg text-muted-foreground">
              Curated repertoires built from real games.
            </p>
          </motion.div>

          {/* Create button - only for authenticated users */}
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-8"
            >
              <Button onClick={() => setCreateModalOpen(true)} variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Create Opening
              </Button>
            </motion.div>
          )}
          
          {/* Sign in prompt for unauthenticated users */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-8 p-4 rounded-lg border border-primary/20 bg-primary/5"
            >
              <p className="text-sm text-muted-foreground">
                <Link to="/auth" className="text-primary font-medium hover:underline">Sign in</Link> to create your own openings and track your progress.
              </p>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search openings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Color filter */}
            <div className="flex gap-2">
              {(['all', 'white', 'black'] as const).map((color) => (
                <Button
                  key={color}
                  variant={colorFilter === color ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setColorFilter(color)}
                  className="capitalize"
                >
                  {color === 'all' ? 'All Colors' : (
                    <span className="flex items-center gap-1.5">
                      <span className="text-lg">{color === 'white' ? '♔' : '♚'}</span>
                      {color}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Course grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>

          {/* Empty state */}
          {filteredCourses.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No courses found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </motion.div>
          )}
        </div>
      </main>

      <CreateCourseModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  );
};

export default Courses;
