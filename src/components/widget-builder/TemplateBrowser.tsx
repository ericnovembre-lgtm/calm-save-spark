import { motion } from 'framer-motion';
import { Download, Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWidgetTemplates, SavedWidgetTemplate } from '@/hooks/useWidgetTemplates';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TemplateBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadTemplate: (template: SavedWidgetTemplate) => void;
}

export function TemplateBrowser({ open, onOpenChange, onLoadTemplate }: TemplateBrowserProps) {
  const { myTemplates, publicTemplates, isLoading, incrementDownload } = useWidgetTemplates();

  const handleLoadTemplate = (template: SavedWidgetTemplate) => {
    incrementDownload.mutate(template.id);
    onLoadTemplate(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Template Browser</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="public" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="public">Community Templates</TabsTrigger>
            <TabsTrigger value="mine">My Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="public" className="mt-4">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            ) : publicTemplates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No community templates yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {publicTemplates.map((template, index) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    index={index}
                    onLoad={() => handleLoadTemplate(template)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mine" className="mt-4">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            ) : myTemplates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No saved templates yet</p>
                <p className="text-sm">Create and save templates from the builder</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {myTemplates.map((template, index) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    index={index}
                    onLoad={() => handleLoadTemplate(template)}
                    isOwner
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function TemplateCard({ 
  template, 
  index, 
  onLoad,
  isOwner 
}: { 
  template: SavedWidgetTemplate; 
  index: number; 
  onLoad: () => void;
  isOwner?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
    >
      <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
        {template.preview_image_url ? (
          <img 
            src={template.preview_image_url} 
            alt={template.template_name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <span className="text-muted-foreground text-sm">Preview</span>
        )}
      </div>

      <h4 className="font-medium mb-1">{template.template_name}</h4>
      
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Download className="w-3 h-3" />
          <span>{template.downloads}</span>
        </div>
        {isOwner && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>Yours</span>
          </div>
        )}
      </div>

      <Button size="sm" className="w-full" onClick={onLoad}>
        Use Template
      </Button>
    </motion.div>
  );
}
