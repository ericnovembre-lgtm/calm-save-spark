import { useState } from 'react';
import { Save, Download, Code, Trash2, LayoutGrid, Move } from 'lucide-react';
import { WidgetBuilderHero } from '@/components/widget-builder/WidgetBuilderHero';
import { WidgetCanvas } from '@/components/widget-builder/WidgetCanvas';
import { WidgetPalette } from '@/components/widget-builder/WidgetPalette';
import { WidgetConfigPanel } from '@/components/widget-builder/WidgetConfigPanel';
import { TemplateBrowser } from '@/components/widget-builder/TemplateBrowser';
import { SaveTemplateModal } from '@/components/widget-builder/SaveTemplateModal';
import { EmbedCodeGenerator } from '@/components/widget-builder/EmbedCodeGenerator';
import { useWidgetBuilder } from '@/hooks/useWidgetBuilder';
import { Button } from '@/components/ui/button';
import { SavedWidgetTemplate } from '@/hooks/useWidgetTemplates';

export default function WidgetBuilder() {
  const {
    widgets,
    selectedWidget,
    layout,
    setSelectedWidget,
    setLayout,
    addWidget,
    updateWidget,
    removeWidget,
    moveWidget,
    getTemplate,
    loadTemplate,
    clearCanvas,
  } = useWidgetBuilder();

  const [showTemplateBrowser, setShowTemplateBrowser] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  const selectedWidgetData = widgets.find(w => w.id === selectedWidget) || null;

  const handleLoadTemplate = (template: SavedWidgetTemplate) => {
    loadTemplate(template.widget_config);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6" data-copilot-id="widget-builder-page">
      <WidgetBuilderHero onBrowseTemplates={() => setShowTemplateBrowser(true)} />

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={layout === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLayout('grid')}
          >
            <LayoutGrid className="w-4 h-4 mr-1" />
            Grid
          </Button>
          <Button
            variant={layout === 'freeform' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLayout('freeform')}
          >
            <Move className="w-4 h-4 mr-1" />
            Freeform
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={clearCanvas}>
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowEmbedCode(true)}>
            <Code className="w-4 h-4 mr-1" />
            Embed
          </Button>
          <Button size="sm" onClick={() => setShowSaveModal(true)}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="space-y-6">
          <WidgetPalette onAddWidget={addWidget} />
        </div>

        <div className="md:col-span-2">
          <WidgetCanvas
            widgets={widgets}
            selectedWidget={selectedWidget}
            layout={layout}
            onSelectWidget={setSelectedWidget}
            onRemoveWidget={removeWidget}
            onMoveWidget={moveWidget}
          />
        </div>

        <div>
          <WidgetConfigPanel
            widget={selectedWidgetData}
            onUpdate={updateWidget}
          />
        </div>
      </div>

      <TemplateBrowser
        open={showTemplateBrowser}
        onOpenChange={setShowTemplateBrowser}
        onLoadTemplate={handleLoadTemplate}
      />

      <SaveTemplateModal
        open={showSaveModal}
        onOpenChange={setShowSaveModal}
        template={getTemplate()}
      />

      <EmbedCodeGenerator
        open={showEmbedCode}
        onOpenChange={setShowEmbedCode}
        template={getTemplate()}
      />
    </div>
  );
}
