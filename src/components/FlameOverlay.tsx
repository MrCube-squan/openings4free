import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

interface FlameOverlayProps {
  show: boolean;
  streak: number;
}

const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 200,
  y: -(Math.random() * 120 + 40),
  scale: Math.random() * 0.6 + 0.4,
  delay: Math.random() * 0.3,
  rotate: (Math.random() - 0.5) * 60,
}));

const FlameOverlay = ({ show, streak }: FlameOverlayProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
        >
          {/* Radial glow backdrop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute"
            style={{
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, hsl(38 95% 55% / 0.15) 0%, transparent 70%)',
            }}
          />

          {/* Central flame burst */}
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: [0, 1.4, 1], y: [20, -10, 0] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
            className="relative flex flex-col items-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -3, 3, 0],
              }}
              transition={{
                duration: 0.8,
                repeat: 2,
                ease: 'easeInOut',
              }}
            >
              <Flame
                className="h-20 w-20 drop-shadow-[0_0_20px_hsl(38,95%,55%)]"
                style={{ color: 'hsl(38, 95%, 55%)' }}
                fill="hsl(38, 95%, 55%)"
                strokeWidth={1}
              />
            </motion.div>

            {/* Streak number */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-2 flex items-center gap-2"
            >
              <span
                className="text-3xl font-bold bg-gradient-to-r from-accent to-[hsl(15,90%,55%)] bg-clip-text text-transparent drop-shadow-[0_0_10px_hsl(38,95%,55%/0.5)]"
              >
                {streak} day streak!
              </span>
            </motion.div>
          </motion.div>

          {/* Rising ember particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute"
              initial={{
                opacity: 0,
                x: 0,
                y: 40,
                scale: 0,
                rotate: 0,
              }}
              animate={{
                opacity: [0, 1, 0],
                x: p.x,
                y: p.y,
                scale: [0, p.scale, 0],
                rotate: p.rotate,
              }}
              transition={{
                duration: 1.2,
                delay: p.delay,
                ease: 'easeOut',
              }}
            >
              <Flame
                className="h-6 w-6"
                style={{ color: 'hsl(25, 95%, 55%)' }}
                fill="hsl(25, 95%, 55%)"
                strokeWidth={0}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FlameOverlay;
