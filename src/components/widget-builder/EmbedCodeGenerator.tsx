import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WidgetTemplate } from '@/hooks/useWidgetBuilder';

interface EmbedCodeGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: WidgetTemplate;
}

export function EmbedCodeGenerator({ open, onOpenChange, template }: EmbedCodeGeneratorProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const embedCode = `<iframe 
  src="${window.location.origin}/embed/widget/${template.id}"
  width="400"
  height="300"
  frameborder="0"
  style="border-radius: 12px;"
></iframe>`;

  const reactCode = `import { SavePlusWidget } from '@saveplus/widget';

function MyApp() {
  return (
    <SavePlusWidget
      templateId="${template.id}"
      theme="${template.theme}"
      width={400}
      height={300}
    />
  );
}`;

  const jsonCode = JSON.stringify(template, null, 2);

  const handleCopy = async (code: string, type: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Embed Code
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="iframe" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="iframe">iFrame</TabsTrigger>
            <TabsTrigger value="react">React</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="iframe" className="mt-4">
            <CodeBlock
              code={embedCode}
              onCopy={() => handleCopy(embedCode, 'iframe')}
              copied={copied === 'iframe'}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Embed this widget in any website using an iframe.
            </p>
          </TabsContent>

          <TabsContent value="react" className="mt-4">
            <CodeBlock
              code={reactCode}
              onCopy={() => handleCopy(reactCode, 'react')}
              copied={copied === 'react'}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Use our React component for seamless integration.
            </p>
          </TabsContent>

          <TabsContent value="json" className="mt-4">
            <CodeBlock
              code={jsonCode}
              onCopy={() => handleCopy(jsonCode, 'json')}
              copied={copied === 'json'}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Raw configuration for custom implementations.
            </p>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Button variant="ghost" size="sm" asChild>
            <a href="/docs/widgets" target="_blank" rel="noopener">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Docs
            </a>
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CodeBlock({ 
  code, 
  onCopy, 
  copied 
}: { 
  code: string; 
  onCopy: () => void; 
  copied: boolean;
}) {
  return (
    <div className="relative">
      <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-xs font-mono max-h-[200px]">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2"
        onClick={onCopy}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
