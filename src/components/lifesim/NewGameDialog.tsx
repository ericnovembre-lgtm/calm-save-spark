import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

interface NewGameDialogProps {
  onCreateGame: (params: { sessionName: string; startingAge: number; targetAge: number }) => void;
  children?: React.ReactNode;
}

export function NewGameDialog({ onCreateGame, children }: NewGameDialogProps) {
  const [open, setOpen] = useState(false);
  const [sessionName, setSessionName] = useState('My Financial Journey');
  const [startingAge, setStartingAge] = useState(22);
  const [targetAge, setTargetAge] = useState(65);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateGame({ sessionName, startingAge, targetAge });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Game
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start New Simulation</DialogTitle>
          <DialogDescription>
            Configure your life simulation parameters. Live a simulated life and learn from your financial decisions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="sessionName">Simulation Name</Label>
            <Input
              id="sessionName"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Conservative Path"
              required
            />
          </div>

          <div>
            <Label>Starting Age: {startingAge}</Label>
            <Slider
              value={[startingAge]}
              onValueChange={([value]) => setStartingAge(value)}
              min={18}
              max={30}
              step={1}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your age at the start of the simulation
            </p>
          </div>

          <div>
            <Label>Target Retirement Age: {targetAge}</Label>
            <Slider
              value={[targetAge]}
              onValueChange={([value]) => setTargetAge(value)}
              min={50}
              max={75}
              step={1}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              When you want to retire in the simulation
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Start Simulation</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
