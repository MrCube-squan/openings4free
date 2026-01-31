import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BoardSettings, BoardTheme, boardThemes } from '@/hooks/useBoardSettings';

interface BoardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BoardSettings;
  onUpdateSettings: (updates: Partial<BoardSettings>) => void;
}

const BoardSettingsModal = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: BoardSettingsModalProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md mx-4 rounded-xl border border-border bg-card p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Board Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Theme selection */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-3 block">Board Theme</Label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(boardThemes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => onUpdateSettings({ theme: key })}
                className={`relative flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
                  settings.theme === key
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                {/* Mini board preview */}
                <div className="w-10 h-10 rounded overflow-hidden mb-1">
                  <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                    <div style={{ backgroundColor: theme.light }} />
                    <div style={{ backgroundColor: theme.dark }} />
                    <div style={{ backgroundColor: theme.dark }} />
                    <div style={{ backgroundColor: theme.light }} />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{theme.name}</span>
                {settings.theme === key && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Coordinates toggle */}
        <div className="flex items-center justify-between py-3 border-t border-border">
          <div>
            <Label className="text-sm font-medium">Show Coordinates</Label>
            <p className="text-xs text-muted-foreground">Display a-h and 1-8 labels</p>
          </div>
          <Switch
            checked={settings.showCoordinates}
            onCheckedChange={checked => onUpdateSettings({ showCoordinates: checked })}
          />
        </div>

        {/* Close button */}
        <div className="mt-6 pt-4 border-t border-border">
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BoardSettingsModal;
