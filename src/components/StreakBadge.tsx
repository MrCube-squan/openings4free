import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface StreakBadgeProps {
  streak: number;
  compact?: boolean;
}

const StreakBadge = ({ streak, compact = false }: StreakBadgeProps) => {
  const { t } = useLanguage();

  if (streak <= 0) return null;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative flex items-center gap-1.5 rounded-full border border-accent/30 ${
        compact ? 'px-2 py-0.5' : 'px-3 py-1.5'
      }`}
      style={{
        background: 'linear-gradient(135deg, hsl(38 95% 55% / 0.15), hsl(15 90% 50% / 0.1))',
        boxShadow: '0 0 12px hsl(38 95% 55% / 0.2), inset 0 1px 0 hsl(38 95% 55% / 0.1)',
      }}
    >
      {/* Animated flame icon */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'easeInOut',
        }}
        className="relative"
      >
        <Flame
          className={`text-accent drop-shadow-[0_0_6px_hsl(38,95%,55%)] ${compact ? 'h-3.5 w-3.5' : 'h-5 w-5'}`}
          fill="hsl(38, 95%, 55%)"
          strokeWidth={1.5}
        />
      </motion.div>

      {/* Streak count */}
      <span
        className={`font-bold bg-gradient-to-r from-accent to-[hsl(15,90%,55%)] bg-clip-text text-transparent ${
          compact ? 'text-xs' : 'text-sm'
        }`}
      >
        {streak}
      </span>

      {!compact && (
        <span className="text-xs text-muted-foreground">{t('nav.streak')}</span>
      )}

      {/* Ambient glow pulse */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: 'radial-gradient(circle, hsl(38 95% 55% / 0.15), transparent 70%)',
        }}
      />
    </motion.div>
  );
};

export default StreakBadge;
