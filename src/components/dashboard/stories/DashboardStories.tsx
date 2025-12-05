import { StoryBubbles } from './StoryBubbles';
import { StoryOverlay } from './StoryOverlay';
import { FinancialStory } from '@/hooks/useFinancialStories';

interface DashboardStoriesProps {
  stories: FinancialStory[];
  activeStoryIndex: number | null;
  onStoryClick: (index: number) => void;
  onClose: () => void;
  onStoryViewed: (id: string) => void;
  isViewed: (id: string) => boolean;
}

export function DashboardStories({
  stories,
  activeStoryIndex,
  onStoryClick,
  onClose,
  onStoryViewed,
  isViewed,
}: DashboardStoriesProps) {
  if (stories.length === 0) return null;

  return (
    <>
      <div className="container mx-auto px-4 pt-2">
        <StoryBubbles 
          stories={stories} 
          onStoryClick={onStoryClick}
          isViewed={isViewed}
        />
      </div>
      
      <StoryOverlay
        stories={stories}
        activeIndex={activeStoryIndex}
        onClose={onClose}
        onStoryViewed={onStoryViewed}
      />
    </>
  );
}
