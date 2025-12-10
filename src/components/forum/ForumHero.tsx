import { motion } from 'framer-motion';
import { MessageCircle, Users, TrendingUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ForumHeroProps {
  onSearch: (query: string) => void;
  onNewPost: () => void;
}

export function ForumHero({ onSearch, onNewPost }: ForumHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-teal-500/20 p-6 border border-blue-500/20"
      data-copilot-id="community-forum-hero"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-blue-500/20">
            <MessageCircle className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Community Forum</h1>
            <p className="text-muted-foreground">Connect, learn, and grow with fellow savers</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 mb-6">
          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Members</span>
            </div>
            <p className="text-2xl font-bold">2.4k</p>
          </div>

          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">Posts</span>
            </div>
            <p className="text-2xl font-bold">847</p>
          </div>

          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Active Today</span>
            </div>
            <p className="text-2xl font-bold">128</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
              className="pl-10 bg-card/50 border-border/50"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <Button onClick={onNewPost}>
            New Post
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
