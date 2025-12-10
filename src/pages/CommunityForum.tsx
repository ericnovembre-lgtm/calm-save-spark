import { useState } from 'react';
import { ForumHero } from '@/components/forum/ForumHero';
import { CategoryList } from '@/components/forum/CategoryList';
import { PostCard } from '@/components/forum/PostCard';
import { PostDetail } from '@/components/forum/PostDetail';
import { PostFilters } from '@/components/forum/PostFilters';
import { NewPostModal } from '@/components/forum/NewPostModal';
import { ForumStats } from '@/components/forum/ForumStats';
import { useForumPosts, ForumPost } from '@/hooks/useForumPosts';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommunityForum() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'most_comments' | 'most_liked'>('newest');

  const { posts, isLoading } = useForumPosts(selectedCategory || undefined);

  // Filter posts by search
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.view_count - a.view_count;
      case 'most_comments':
        return b.comment_count - a.comment_count;
      case 'most_liked':
        return b.like_count - a.like_count;
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (selectedPost) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <PostDetail post={selectedPost} onBack={() => setSelectedPost(null)} />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6" data-copilot-id="community-forum-page">
      <ForumHero 
        onSearch={setSearchQuery}
        onNewPost={() => setShowNewPost(true)}
      />

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          <CategoryList
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          <ForumStats />
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-4">
          <PostFilters sortBy={sortBy} onSortChange={setSortBy} />

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : sortedPosts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">No discussions found</p>
              <p className="text-sm">Be the first to start a conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedPosts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={index}
                  onClick={() => setSelectedPost(post)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <NewPostModal open={showNewPost} onOpenChange={setShowNewPost} />
    </div>
  );
}
