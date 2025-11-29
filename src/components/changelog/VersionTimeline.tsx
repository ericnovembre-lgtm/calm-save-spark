import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FEATURE_UPDATES, getAllVersions } from '@/hooks/useWhatsNew';
import { TimelineNode } from './TimelineNode';
import { FeatureCard } from './FeatureCard';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface VersionTimelineProps {
  searchQuery?: string;
  selectedVersion?: string | null;
  selectedCategory?: string | null;
}

// Map tourStep prefixes to categories
function getCategory(tourStep?: string): string {
  if (!tourStep) return 'default';
  if (['nlq-commander', 'daily-briefing', 'smart-actions', 'anomaly-alerts'].includes(tourStep)) return 'ai';
  if (['peer-insights', 'skill-tree', 'journey-milestones', 'weekly-challenges'].includes(tourStep)) return 'gamification';
  if (['portfolio-widget', 'cashflow', 'upcoming-bills'].includes(tourStep)) return 'analytics';
  return 'default';
}

export function VersionTimeline({
  searchQuery = '',
  selectedVersion = null,
  selectedCategory = null,
}: VersionTimelineProps) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [expandedVersions, setExpandedVersions] = useState<string[]>([getAllVersions()[0]]);

  // Filter and group features
  const groupedFeatures = useMemo(() => {
    let features = selectedVersion
      ? FEATURE_UPDATES.filter(f => f.version === selectedVersion)
      : FEATURE_UPDATES;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      features = features.filter(
        f => f.title.toLowerCase().includes(query) ||
             f.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      features = features.filter(f => getCategory(f.tourStep) === selectedCategory);
    }

    const groups: Record<string, typeof FEATURE_UPDATES> = {};
    features.forEach(feature => {
      if (!groups[feature.version]) {
        groups[feature.version] = [];
      }
      groups[feature.version].push(feature);
    });

    return groups;
  }, [searchQuery, selectedVersion, selectedCategory]);

  const toggleVersion = (version: string) => {
    setExpandedVersions(prev =>
      prev.includes(version)
        ? prev.filter(v => v !== version)
        : [...prev, version]
    );
  };

  const handleTryFeature = (tourStep: string) => {
    navigate('/dashboard');
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

  const versions = Object.entries(groupedFeatures)
    .sort(([a], [b]) => b.localeCompare(a));

  if (versions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No updates found matching your criteria.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Animated timeline line */}
      <motion.div
        className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary via-border to-border"
        initial={prefersReducedMotion ? {} : { scaleY: 0, originY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 1, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Version sections */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {versions.map(([version, features], versionIndex) => {
            const isExpanded = expandedVersions.includes(version);
            const isLatest = versionIndex === 0;
            const versionDate = features[0]?.date || '';

            return (
              <div key={version} className="relative pl-2">
                <TimelineNode
                  version={version}
                  date={versionDate}
                  featureCount={features.length}
                  isLatest={isLatest}
                  isExpanded={isExpanded}
                  index={versionIndex}
                  onToggle={() => toggleVersion(version)}
                />

                {/* Feature cards */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                      className="ml-8 mt-4 space-y-3 overflow-hidden"
                    >
                      {features.map((feature, featureIndex) => (
                        <FeatureCard
                          key={feature.title}
                          title={feature.title}
                          description={feature.description}
                          icon={feature.icon}
                          tourStep={feature.tourStep}
                          category={getCategory(feature.tourStep)}
                          index={featureIndex}
                          onTryFeature={handleTryFeature}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
