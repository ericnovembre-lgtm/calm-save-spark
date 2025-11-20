import { useState, useCallback } from 'react';

type Emotion = 'stressed' | 'anxious' | 'excited' | 'frustrated' | 'neutral' | 'hopeful';

interface EmotionResult {
  emotion: Emotion;
  confidence: number;
  indicators: string[];
}

const emotionKeywords: Record<Emotion, string[]> = {
  stressed: ['stressed', 'overwhelmed', 'too much', 'pressure', 'burden', 'worried', 'nervous'],
  anxious: ['anxious', 'scared', 'afraid', 'uncertain', 'nervous', 'worried', 'concerned'],
  excited: ['excited', 'great', 'awesome', 'amazing', 'fantastic', 'happy', 'thrilled', '!', '😊', '🎉'],
  frustrated: ['frustrated', 'annoying', 'difficult', 'hard', 'stuck', 'confused', 'ugh', '😤'],
  hopeful: ['hopeful', 'optimistic', 'looking forward', 'better', 'improve', 'goal', 'future'],
  neutral: []
};

export function useEmotionDetection() {
  const [lastDetectedEmotion, setLastDetectedEmotion] = useState<EmotionResult | null>(null);

  const detectEmotion = useCallback((text: string): EmotionResult => {
    const textLower = text.toLowerCase();
    const emotionScores: Record<Emotion, { score: number; indicators: string[] }> = {
      stressed: { score: 0, indicators: [] },
      anxious: { score: 0, indicators: [] },
      excited: { score: 0, indicators: [] },
      frustrated: { score: 0, indicators: [] },
      hopeful: { score: 0, indicators: [] },
      neutral: { score: 0, indicators: [] }
    };

    // Check for emotion keywords
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      for (const keyword of keywords) {
        if (textLower.includes(keyword)) {
          emotionScores[emotion as Emotion].score++;
          emotionScores[emotion as Emotion].indicators.push(keyword);
        }
      }
    }

    // Analyze sentence patterns
    const sentences = text.split(/[.!?]+/);
    
    // Check for question marks (uncertainty/anxiety)
    const questionCount = (text.match(/\?/g) || []).length;
    if (questionCount > 2) {
      emotionScores.anxious.score += questionCount * 0.5;
      emotionScores.anxious.indicators.push('multiple questions');
    }

    // Check for exclamation marks (excitement or frustration)
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 1) {
      emotionScores.excited.score += exclamationCount * 0.3;
      emotionScores.excited.indicators.push('enthusiastic punctuation');
    }

    // Check for negative words
    const negativeWords = ['no', 'not', 'never', 'cant', "can't", 'won\'t', 'don\'t'];
    const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
    if (negativeCount > 2) {
      emotionScores.frustrated.score += negativeCount * 0.4;
      emotionScores.frustrated.indicators.push('negative language');
    }

    // Check for financial stress indicators
    const stressIndicators = ['debt', 'owe', 'late', 'overdue', 'collection', 'bill'];
    const stressCount = stressIndicators.filter(word => textLower.includes(word)).length;
    if (stressCount > 0) {
      emotionScores.stressed.score += stressCount * 0.8;
      emotionScores.stressed.indicators.push('financial stress keywords');
    }

    // Check for hopeful indicators
    const hopeIndicators = ['save', 'goal', 'plan', 'future', 'invest', 'grow'];
    const hopeCount = hopeIndicators.filter(word => textLower.includes(word)).length;
    if (hopeCount > 1) {
      emotionScores.hopeful.score += hopeCount * 0.5;
      emotionScores.hopeful.indicators.push('forward-looking language');
    }

    // Find dominant emotion
    let dominantEmotion: Emotion = 'neutral';
    let maxScore = 0;

    for (const [emotion, data] of Object.entries(emotionScores)) {
      if (data.score > maxScore) {
        maxScore = data.score;
        dominantEmotion = emotion as Emotion;
      }
    }

    // Calculate confidence (0-1)
    const totalScore = Object.values(emotionScores).reduce((sum, data) => sum + data.score, 0);
    const confidence = totalScore > 0 ? Math.min(maxScore / totalScore, 1) : 0.5;

    const result: EmotionResult = {
      emotion: dominantEmotion,
      confidence: Math.max(confidence, 0.3), // Minimum 30% confidence
      indicators: emotionScores[dominantEmotion].indicators
    };

    setLastDetectedEmotion(result);
    return result;
  }, []);

  const getEmotionalResponse = useCallback((emotion: Emotion): string => {
    const responses: Record<Emotion, string[]> = {
      stressed: [
        "I understand you're feeling stressed. Let's break this down into manageable steps.",
        "Financial stress is real, and you're not alone. We'll tackle this together.",
        "Take a deep breath. Let's focus on what we can control right now."
      ],
      anxious: [
        "I hear your concerns. Let's address them one by one.",
        "It's normal to feel anxious about finances. Knowledge is power, so let's learn together.",
        "Your worries are valid. Let's find some clarity and create a plan."
      ],
      excited: [
        "I love your enthusiasm! Let's channel that energy into your goals.",
        "That's the spirit! Your positive attitude will help you succeed.",
        "Fantastic! Let's build on this momentum."
      ],
      frustrated: [
        "I can sense your frustration. Let's try a different approach.",
        "I understand this is challenging. We'll figure this out together.",
        "Your frustration is valid. Let's find what's blocking your progress."
      ],
      hopeful: [
        "Your optimism is inspiring! Let's turn that hope into action.",
        "I love your forward-thinking mindset. Let's create a solid plan.",
        "With that attitude, you're already on the path to success!"
      ],
      neutral: [
        "I'm here to help you with whatever you need.",
        "Let's explore your financial situation together.",
        "What would you like to focus on today?"
      ]
    };

    const options = responses[emotion];
    return options[Math.floor(Math.random() * options.length)];
  }, []);

  return {
    detectEmotion,
    getEmotionalResponse,
    lastDetectedEmotion
  };
}
