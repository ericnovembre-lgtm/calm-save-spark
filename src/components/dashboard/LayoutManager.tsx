import { useState } from "react";
import { Save, Download, Upload, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Layout {
  id: string;
  name: string;
  cards: string[];
  createdAt: Date;
}

interface LayoutManagerProps {
  currentLayout: string[];
  onLayoutChange: (layout: string[]) => void;
}

export function LayoutManager({ currentLayout, onLayoutChange }: LayoutManagerProps) {
  const [savedLayouts, setSavedLayouts] = useState<Layout[]>(() => {
    const saved = localStorage.getItem('saved-layouts');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Default', cards: currentLayout, createdAt: new Date() },
    ];
  });
  const [newLayoutName, setNewLayoutName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const saveCurrentLayout = () => {
    if (!newLayoutName.trim()) {
      toast.error('Please enter a layout name');
      return;
    }

    const newLayout: Layout = {
      id: Date.now().toString(),
      name: newLayoutName,
      cards: currentLayout,
      createdAt: new Date(),
    };

    const updated = [...savedLayouts, newLayout];
    setSavedLayouts(updated);
    localStorage.setItem('saved-layouts', JSON.stringify(updated));
    
    toast.success(`Layout "${newLayoutName}" saved`);
    setNewLayoutName('');
    setIsDialogOpen(false);
  };

  const loadLayout = (layoutId: string) => {
    const layout = savedLayouts.find(l => l.id === layoutId);
    if (layout) {
      onLayoutChange(layout.cards);
      toast.success(`Loaded layout: ${layout.name}`);
    }
  };

  const deleteLayout = (layoutId: string) => {
    const layout = savedLayouts.find(l => l.id === layoutId);
    const updated = savedLayouts.filter(l => l.id !== layoutId);
    setSavedLayouts(updated);
    localStorage.setItem('saved-layouts', JSON.stringify(updated));
    toast.success(`Deleted layout: ${layout?.name}`);
  };

  const exportLayout = (layoutId: string) => {
    const layout = savedLayouts.find(l => l.id === layoutId);
    if (layout) {
      const dataStr = JSON.stringify(layout, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${layout.name.toLowerCase().replace(/\s+/g, '-')}-layout.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Layout exported');
    }
  };

  const importLayout = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target?.result as string);
            const newLayout = {
              ...imported,
              id: Date.now().toString(),
              createdAt: new Date()
            };
            const updated = [...savedLayouts, newLayout];
            setSavedLayouts(updated);
            localStorage.setItem('saved-layouts', JSON.stringify(updated));
            toast.success(`Imported layout: ${imported.name}`);
          } catch (error) {
            toast.error('Invalid layout file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-display font-semibold">Layout Manager</h3>
          <p className="text-sm text-muted-foreground">
            Save and manage custom dashboard layouts
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Save Current
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Layout</DialogTitle>
                <DialogDescription>
                  Give your current layout a name to save it
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="layout-name">Layout Name</Label>
                  <Input
                    id="layout-name"
                    placeholder="e.g., Work Setup, Home View"
                    value={newLayoutName}
                    onChange={(e) => setNewLayoutName(e.target.value)}
                  />
                </div>
                <Button onClick={saveCurrentLayout} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Layout
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button size="sm" variant="outline" onClick={importLayout}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {savedLayouts.map((layout) => (
          <div
            key={layout.id}
            className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-sm">{layout.name}</p>
              <p className="text-xs text-muted-foreground">
                {layout.cards.length} cards · {new Date(layout.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => loadLayout(layout.id)}
              >
                Load
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => exportLayout(layout.id)}
              >
                <Download className="w-4 h-4" />
              </Button>
              {layout.name !== 'Default' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteLayout(layout.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
