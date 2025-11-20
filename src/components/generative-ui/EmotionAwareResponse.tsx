import { Card } from '@/components/ui/card';
import { Heart, Frown, Smile, Meh, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EmotionAwareResponseProps {
  detectedEmotion: 'stressed' | 'anxious' | 'excited' | 'frustrated' | 'neutral' | 'hopeful';
  confidence: number;
  response: string;
  supportResources?: {
    title: string;
    description: string;
    url?: string;
  }[];
}

const emotionConfig = {
  stressed: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    message: "I sense you're feeling stressed about this. Let's take it one step at a time."
  },
  anxious: {
    icon: Frown,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    message: "I understand this might feel overwhelming. You're not alone in this."
  },
  excited: {
    icon: Smile,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    message: "I can sense your excitement! That's wonderful energy to have."
  },
  frustrated: {
    icon: Frown,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    message: "I hear your frustration. Let's work through this together."
  },
  neutral: {
    icon: Meh,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    message: "I'm here to help with whatever you need."
  },
  hopeful: {
    icon: Heart,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    message: "Your optimism is inspiring! Let's build on that positive momentum."
  }
};

export function EmotionAwareResponse({
  detectedEmotion,
  confidence,
  response,
  supportResources = []
}: EmotionAwareResponseProps) {
  const config = emotionConfig[detectedEmotion];
  const Icon = config.icon;

  return (
    <Card className={cn("p-6 space-y-4 border-2", config.borderColor, config.bgColor)}>
      {/* Emotion Detection Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3"
      >
        <div className={cn("p-2 rounded-full", config.bgColor)}>
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Emotional Tone Detected</p>
          <p className="text-xs text-muted-foreground">
            {detectedEmotion.charAt(0).toUpperCase() + detectedEmotion.slice(1)} ({Math.round(confidence * 100)}% confidence)
          </p>
        </div>
      </motion.div>

      {/* Empathetic Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-lg bg-background/50 border"
      >
        <p className="text-sm font-medium mb-2">{config.message}</p>
        <p className="text-sm text-muted-foreground">{response}</p>
      </motion.div>

      {/* Support Resources */}
      {supportResources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <p className="text-sm font-medium">Resources That Might Help</p>
          <div className="space-y-2">
            {supportResources.map((resource, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-background/50 border hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => resource.url && window.open(resource.url, '_blank')}
              >
                <p className="text-sm font-medium">{resource.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Severe Stress Warning */}
      {(detectedEmotion === 'stressed' || detectedEmotion === 'anxious') && confidence > 0.8 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm"
        >
          <p className="font-medium text-red-600">Financial stress is real</p>
          <p className="text-muted-foreground mt-1">
            If you're experiencing significant financial anxiety, consider speaking with a financial counselor or therapist who specializes in financial wellness.
          </p>
        </motion.div>
      )}
    </Card>
  );
}
