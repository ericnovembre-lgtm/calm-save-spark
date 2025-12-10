import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useWidgetTemplates } from '@/hooks/useWidgetTemplates';
import { WidgetTemplate } from '@/hooks/useWidgetBuilder';

interface SaveTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: WidgetTemplate;
}

export function SaveTemplateModal({ open, onOpenChange, template }: SaveTemplateModalProps) {
  const { saveTemplate } = useWidgetTemplates();
  const [name, setName] = useState(template.name);
  const [isPublic, setIsPublic] = useState(false);

  const handleSave = () => {
    saveTemplate.mutate(
      {
        name,
        template: { ...template, name },
        isPublic,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Dashboard Template"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is-public">Share with Community</Label>
              <p className="text-xs text-muted-foreground">
                Make this template available to others
              </p>
            </div>
            <Switch
              id="is-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          <div className="p-3 rounded-lg bg-muted/50 text-sm">
            <p className="font-medium mb-1">Template includes:</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• {template.widgets.length} widgets</li>
              <li>• {template.layout} layout</li>
              <li>• {template.theme} theme</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || saveTemplate.isPending}
          >
            {saveTemplate.isPending ? 'Saving...' : 'Save Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
