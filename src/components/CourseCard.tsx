import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Course } from '@/lib/courses';
import { BookOpen } from 'lucide-react';
import { getLineCount } from '@/lib/lineCount';

interface CourseCardProps {
  course: Course;
  index?: number;
}

const CourseCard = ({ course, index = 0 }: CourseCardProps) => {
  const lineCount = getLineCount(course.id);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/course/${course.id}`}>
        <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:bg-card-hover hover:shadow-lg hover:shadow-primary/5">
          {/* Color indicator */}
          <div className={`absolute top-0 left-0 h-1 w-full ${course.color === 'white' ? 'bg-gradient-to-r from-gray-200 to-gray-400' : 'bg-gradient-to-r from-gray-700 to-gray-900'}`} />
          
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <span className="text-xs font-mono text-muted-foreground">{course.eco}</span>
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {course.name}
              </h3>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl">
              {course.color === 'white' ? '♚' : '♔'}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {course.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
            </div>
          </div>

          {/* Hover arrow */}
          <div className="absolute bottom-5 right-5 opacity-0 transform translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            <span className="text-primary">→</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CourseCard;
