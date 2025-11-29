import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { History, Search, ArrowRight, Calendar, Sparkles, Filter, LayoutGrid, List, Brain, Gamepad2, BarChart3 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FEATURE_UPDATES, getFeaturesByVersion, getAllVersions } from '@/hooks/useWhatsNew';
import { VersionTimeline } from '@/components/changelog/VersionTimeline';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Filter },
  { id: 'ai', label: 'AI', icon: Brain },
  { id: 'gamification', label: 'Gamification', icon: Gamepad2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Changelog() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [expandedVersions, setExpandedVersions] = useState<string[]>([getAllVersions()[0]]);

  const versions = getAllVersions();

  // Filter features based on search and version
  const filteredFeatures = useMemo(() => {
    let features = selectedVersion 
      ? getFeaturesByVersion(selectedVersion)
      : FEATURE_UPDATES;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      features = features.filter(
        f => f.title.toLowerCase().includes(query) || 
             f.description.toLowerCase().includes(query)
      );
    }

    return features;
  }, [searchQuery, selectedVersion]);

  // Group features by version
  const groupedFeatures = useMemo(() => {
    const groups: Record<string, typeof FEATURE_UPDATES> = {};
    
    filteredFeatures.forEach(feature => {
      if (!groups[feature.version]) {
        groups[feature.version] = [];
      }
      groups[feature.version].push(feature);
    });

    return groups;
  }, [filteredFeatures]);

  const toggleVersion = (version: string) => {
    setExpandedVersions(prev => 
      prev.includes(version)
        ? prev.filter(v => v !== version)
        : [...prev, version]
    );
  };

  const handleTryFeature = (tourStep?: string) => {
    if (!tourStep) return;
    
    navigate('/dashboard');
    
    // Scroll to feature after navigation
    setTimeout(() => {
      const element = document.querySelector(`[data-tour="${tourStep}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
        }, 2000);
      }
    }, 500);
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4"
          >
            <History className="w-10 h-10 text-primary" />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight mb-2"
          >
            Changelog
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-muted-foreground"
          >
            See what's new in each $ave+ release
          </motion.p>
        </header>

        {/* Search & Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-8"
        >
          {/* View Toggle & Search Row */}
          <div className="flex items-center gap-4">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'timeline' | 'list')} className="w-auto">
              <TabsList className="h-9">
                <TabsTrigger value="timeline" className="gap-1.5 px-3">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-1.5 px-3">
                  <List className="w-3.5 h-3.5" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search updates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id || (cat.id === 'all' && !selectedCategory) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id === 'all' ? null : cat.id)}
                  className="gap-1.5"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </Button>
              );
            })}
          </div>

          {/* Version Pills */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedVersion === null ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedVersion(null)}
            >
              All Versions
            </Button>
            {versions.map((version) => (
              <Button
                key={version}
                variant={selectedVersion === version ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedVersion(version)}
              >
                v{version}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Content based on view mode */}
        {viewMode === 'timeline' ? (
          <VersionTimeline
            searchQuery={searchQuery}
            selectedVersion={selectedVersion}
            selectedCategory={selectedCategory}
          />
        ) : (
          /* List View */
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            {/* Version Sections */}
            <AnimatePresence mode="popLayout">
              {Object.entries(groupedFeatures).length > 0 ? (
                Object.entries(groupedFeatures)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([version, features], versionIndex) => {
                    const isExpanded = expandedVersions.includes(version);
                    const versionDate = features[0]?.date;
                    const isLatest = versionIndex === 0;

                    return (
                      <motion.div
                        key={version}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: versionIndex * 0.05 }}
                        className="relative pl-10 pb-8"
                      >
                        {/* Timeline dot */}
                        <div className={cn(
                          "absolute left-2 top-1 w-5 h-5 rounded-full border-2 bg-background",
                          isLatest 
                            ? "border-primary bg-primary" 
                            : "border-muted-foreground/30"
                        )}>
                          {isLatest && (
                            <Sparkles className="w-3 h-3 text-primary-foreground absolute top-0.5 left-0.5" />
                          )}
                        </div>

                        <Collapsible open={isExpanded} onOpenChange={() => toggleVersion(version)}>
                          <CollapsibleTrigger asChild>
                            <Card className={cn(
                              "cursor-pointer transition-all hover:shadow-md",
                              isLatest && "border-primary/30 bg-primary/5"
                            )}>
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <CardTitle className="text-lg">
                                      Version {version}
                                    </CardTitle>
                                    {isLatest && (
                                      <Badge className="bg-primary text-primary-foreground">
                                        Latest
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    {versionDate && format(new Date(versionDate), 'MMM d, yyyy')}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {features.length} update{features.length !== 1 ? 's' : ''}
                                </p>
                              </CardHeader>
                            </Card>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="mt-3 space-y-3">
                              {features.map((feature, featureIndex) => {
                                const Icon = feature.icon;
                                return (
                                  <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: featureIndex * 0.05 }}
                                  >
                                    <Card className="bg-card/50">
                                      <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                            <Icon className="w-5 h-5" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-foreground mb-1">
                                              {feature.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                              {feature.description}
                                            </p>
                                          </div>
                                          {feature.tourStep && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleTryFeature(feature.tourStep)}
                                              className="shrink-0"
                                            >
                                              Try it
                                              <ArrowRight className="w-3 h-3 ml-1" />
                                            </Button>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </motion.div>
                    );
                  })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    No updates found for "{searchQuery}"
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Back to Dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
}
