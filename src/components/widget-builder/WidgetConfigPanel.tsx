import { WidgetConfig } from '@/hooks/useWidgetBuilder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';

interface WidgetConfigPanelProps {
  widget: WidgetConfig | null;
  onUpdate: (id: string, updates: Partial<WidgetConfig>) => void;
}

export function WidgetConfigPanel({ widget, onUpdate }: WidgetConfigPanelProps) {
  if (!widget) {
    return (
      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">Widget Settings</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">
          Select a widget to configure
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Widget Settings</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={widget.title}
            onChange={(e) => onUpdate(widget.id, { title: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="colorScheme">Color Scheme</Label>
          <Select
            value={widget.settings.colorScheme || 'default'}
            onValueChange={(value) => onUpdate(widget.id, {
              settings: { ...widget.settings, colorScheme: value as 'default' | 'warm' | 'cool' | 'monochrome' }
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="cool">Cool</SelectItem>
              <SelectItem value="monochrome">Monochrome</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showLabels">Show Labels</Label>
          <Switch
            id="showLabels"
            checked={widget.settings.showLabels ?? true}
            onCheckedChange={(checked) => onUpdate(widget.id, {
              settings: { ...widget.settings, showLabels: checked }
            })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="animated">Animated</Label>
          <Switch
            id="animated"
            checked={widget.settings.animated ?? true}
            onCheckedChange={(checked) => onUpdate(widget.id, {
              settings: { ...widget.settings, animated: checked }
            })}
          />
        </div>

        <div>
          <Label htmlFor="width">Width (px)</Label>
          <Input
            id="width"
            type="number"
            value={widget.size.width}
            onChange={(e) => onUpdate(widget.id, {
              size: { ...widget.size, width: parseInt(e.target.value) || 200 }
            })}
          />
        </div>

        <div>
          <Label htmlFor="height">Height (px)</Label>
          <Input
            id="height"
            type="number"
            value={widget.size.height}
            onChange={(e) => onUpdate(widget.id, {
              size: { ...widget.size, height: parseInt(e.target.value) || 150 }
            })}
          />
        </div>
      </div>
    </div>
  );
}
