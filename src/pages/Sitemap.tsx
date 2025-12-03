import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  SITEMAP_PAGES, 
  SITEMAP_REDIRECTS, 
  SITEMAP_STATS, 
  CATEGORY_META,
  type PageCategory 
} from "@/data/sitemap";
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  ArrowRight,
  Map,
  ExternalLink,
  Shield,
  Lock,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Sitemap() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(CATEGORY_META))
  );

  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return SITEMAP_PAGES;
    const query = searchQuery.toLowerCase();
    return SITEMAP_PAGES.filter(page => 
      page.title.toLowerCase().includes(query) ||
      page.route.toLowerCase().includes(query) ||
      page.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const pagesByCategory = useMemo(() => {
    const grouped: Record<PageCategory, typeof SITEMAP_PAGES> = {} as any;
    Object.keys(CATEGORY_META).forEach(cat => {
      grouped[cat as PageCategory] = filteredPages.filter(p => p.category === cat);
    });
    return grouped;
  }, [filteredPages]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const getCategoryColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      green: 'bg-green-500/20 text-green-300 border-green-500/30',
      emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      violet: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      red: 'bg-red-500/20 text-red-300 border-red-500/30',
      slate: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Map className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Navigation Sitemap</h1>
              <p className="text-muted-foreground text-sm">
                Complete page structure for $ave+ ({SITEMAP_STATS.totalPages} pages, {SITEMAP_STATS.totalRedirects} redirects)
              </p>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-foreground">{SITEMAP_STATS.totalPages}</div>
                <div className="text-xs text-muted-foreground">Total Pages</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{SITEMAP_STATS.protectedPages}</div>
                <div className="text-xs text-muted-foreground">Protected</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">{SITEMAP_STATS.publicPages}</div>
                <div className="text-xs text-muted-foreground">Public</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-amber-400">{SITEMAP_STATS.totalRedirects}</div>
                <div className="text-xs text-muted-foreground">Redirects</div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages by name, route, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pages by Category */}
          <div className="space-y-4">
            {(Object.keys(CATEGORY_META) as PageCategory[]).map((category) => {
              const meta = CATEGORY_META[category];
              const pages = pagesByCategory[category];
              const isExpanded = expandedCategories.has(category);

              if (pages.length === 0 && searchQuery) return null;

              return (
                <Collapsible key={category} open={isExpanded} onOpenChange={() => toggleCategory(category)}>
                  <Card className="bg-card/50 border-border/50 overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Badge className={getCategoryColorClass(meta.color)}>
                              {meta.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {pages.length} pages
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">{meta.description}</span>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-4">
                        <div className="grid gap-2">
                          {pages.map((page, idx) => (
                            <motion.div
                              key={page.route}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.02 }}
                            >
                              <Link
                                to={page.route}
                                className="flex items-center justify-between p-3 rounded-lg bg-background/30 hover:bg-background/50 border border-transparent hover:border-border/50 transition-all group"
                              >
                                <div className="flex items-center gap-3">
                                  <code className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                                    {page.route}
                                  </code>
                                  <span className="font-medium text-foreground">{page.title}</span>
                                  <span className="text-sm text-muted-foreground hidden md:inline">
                                    — {page.description}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {page.adminOnly && (
                                    <Shield className="h-3.5 w-3.5 text-red-400" aria-label="Admin only" />
                                  )}
                                  {page.protected ? (
                                    <Lock className="h-3.5 w-3.5 text-amber-400" aria-label="Protected" />
                                  ) : (
                                    <Globe className="h-3.5 w-3.5 text-green-400" aria-label="Public" />
                                  )}
                                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>

          {/* Redirects Section */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowRight className="h-5 w-5 text-orange-400" />
                Active Redirects ({SITEMAP_REDIRECTS.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {SITEMAP_REDIRECTS.map((redirect, idx) => (
                  <motion.div
                    key={redirect.from}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/30"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded line-through">
                        {redirect.from}
                      </code>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <code className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                        {redirect.to}
                      </code>
                    </div>
                    <span className="text-xs text-muted-foreground hidden md:inline">{redirect.reason}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
