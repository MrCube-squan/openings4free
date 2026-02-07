import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCustomCourses } from '@/hooks/useCustomCourses';
import { useNavigate } from 'react-router-dom';

interface CreateCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCourseModal = ({ open, onOpenChange }: CreateCourseModalProps) => {
  const navigate = useNavigate();
  const { addCourse } = useCustomCourses();
  
  const [name, setName] = useState('');
  const [eco, setEco] = useState('');
  const [color, setColor] = useState<'white' | 'black'>('white');
  const [description, setDescription] = useState('');
  const [moves, setMoves] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    const newCourse = await addCourse({
      name: name.trim(),
      eco: eco.trim() || 'A00',
      color,
      description: description.trim() || `Custom ${color === 'white' ? 'White' : 'Black'} repertoire`,
      moves: moves.trim() || '',
    });

    // Reset form
    setName('');
    setEco('');
    setColor('white');
    setDescription('');
    setMoves('');
    
    onOpenChange(false);
    
    // Navigate to the new course if created successfully
    if (newCourse) {
      navigate(`/course/${newCourse.id}`);
    }
  };

  const handleClose = () => {
    setName('');
    setEco('');
    setColor('white');
    setDescription('');
    setMoves('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Opening</DialogTitle>
          <DialogDescription>
            Build your own opening repertoire from scratch.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Opening Name *</Label>
            <Input
              id="name"
              placeholder="e.g. My Italian Repertoire"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eco">ECO Code</Label>
              <Input
                id="eco"
                placeholder="e.g. C50"
                value={eco}
                onChange={(e) => setEco(e.target.value.toUpperCase())}
                maxLength={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={color === 'white' ? 'default' : 'secondary'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setColor('white')}
                >
                  <span className="text-lg mr-1">♔</span> White
                </Button>
                <Button
                  type="button"
                  variant={color === 'black' ? 'default' : 'secondary'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setColor('black')}
                >
                  <span className="text-lg mr-1">♚</span> Black
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="A brief description of your opening..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moves">Starting Moves (optional)</Label>
            <Input
              id="moves"
              placeholder="e.g. 1.e4 e5 2.Nf3 Nc6 3.Bc4"
              value={moves}
              onChange={(e) => setMoves(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The base position for this opening. You can add lines later.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create Opening
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseModal;
