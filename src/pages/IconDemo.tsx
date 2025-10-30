import { useState } from 'react';
import { SaveplusAnimIcon } from '@/components/icons';
import { AnimationPreferenceToggle } from '@/components/icons/AnimationPreferenceToggle';
import { getAvailableIcons } from '@/components/icons/saveplus_anim_map';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Demo page showcasing the SaveplusAnimIcon system
 * 
 * View at: /icon-demo
 */
export default function IconDemo() {
  const [selectedSize, setSelectedSize] = useState(48);
  const availableIcons = getAvailableIcons();

  const sizes = [16, 24, 32, 48, 64, 96];

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-4xl text-foreground">
              $ave+ Animated Icons
            </h1>
            <p className="text-muted-foreground mt-2">
              Progressive, accessible, and performant icon system
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {availableIcons.length} Icons
          </Badge>
        </div>

        {/* Animation Preference Toggle */}
        <AnimationPreferenceToggle />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="gallery" className="space-y-6">
        <TabsList>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="sizes">Size Examples</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {availableIcons.map((iconId) => (
              <Card key={iconId} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex flex-col items-center justify-center space-y-3">
                  <SaveplusAnimIcon 
                    name={iconId} 
                    size={64}
                    className="transition-transform hover:scale-110"
                  />
                  <p className="text-xs text-center text-muted-foreground font-medium">
                    {iconId}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Size Examples Tab */}
        <TabsContent value="sizes" className="space-y-6">
          <div className="flex gap-4 flex-wrap">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedSize === size
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-foreground border-border hover:border-foreground'
                }`}
              >
                {size}px
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {availableIcons.slice(0, 8).map((iconId) => (
              <div 
                key={iconId}
                className="flex flex-col items-center justify-center p-8 rounded-xl border border-border bg-card space-y-3"
              >
                <SaveplusAnimIcon 
                  name={iconId} 
                  size={selectedSize}
                />
                <p className="text-sm text-muted-foreground">{iconId}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Variants Tab */}
        <TabsContent value="variants" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Standard (Animated)</CardTitle>
                <CardDescription>
                  Respects user & system preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-6 flex-wrap">
                <SaveplusAnimIcon name="piggy-bank" size={48} />
                <SaveplusAnimIcon name="rocket" size={48} />
                <SaveplusAnimIcon name="sparkles" size={48} />
                <SaveplusAnimIcon name="target" size={48} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Decorative Icons</CardTitle>
                <CardDescription>
                  Hidden from screen readers (use for visual flair)
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-6 flex-wrap">
                <SaveplusAnimIcon name="sparkles" size={48} decorative />
                <SaveplusAnimIcon name="shield" size={48} decorative />
                <SaveplusAnimIcon name="lightbulb" size={48} decorative />
                <SaveplusAnimIcon name="chart-up" size={48} decorative />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Labels</CardTitle>
                <CardDescription>
                  Override default accessibility labels
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-6 flex-wrap">
                <SaveplusAnimIcon 
                  name="target" 
                  size={48} 
                  label="Complete your savings goal"
                />
                <SaveplusAnimIcon 
                  name="rocket" 
                  size={48} 
                  label="Launch your financial journey"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Basic Usage</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`<SaveplusAnimIcon name="piggy-bank" size={32} />`}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">With Custom Label</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`<SaveplusAnimIcon 
  name="rocket" 
  size={48} 
  label="Launch your savings goals" 
/>`}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Decorative (Hidden from Screen Readers)</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`<SaveplusAnimIcon name="sparkles" decorative />`}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Import Statement</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`import { SaveplusAnimIcon } from '@/components/icons';`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature List Example</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { icon: 'target', title: 'Set Savings Goals', desc: 'Create custom pots for each goal' },
                  { icon: 'rocket', title: 'Track Progress', desc: 'Watch your money grow in real-time' },
                  { icon: 'shield', title: 'Bank-Level Security', desc: 'Your funds are always protected' },
                  { icon: 'lightbulb', title: 'Smart Insights', desc: 'AI-powered financial guidance' }
                ].map((feature) => (
                  <div key={feature.icon} className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                    <SaveplusAnimIcon name={feature.icon} size={40} decorative />
                    <div>
                      <h4 className="font-semibold text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <Card className="bg-accent/20 border-accent">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <SaveplusAnimIcon name="lightbulb" size={32} decorative />
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">About This System</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Respects <code className="px-1 py-0.5 bg-muted rounded">prefers-reduced-motion</code></li>
                <li>✓ User preference stored in localStorage</li>
                <li>✓ Progressive fallback: APNG → GIF → PNG → SVG → Emoji</li>
                <li>✓ Accessible with proper ARIA labels</li>
                <li>✓ SSR-safe (no hydration errors)</li>
                <li>✓ Cross-tab preference sync</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
