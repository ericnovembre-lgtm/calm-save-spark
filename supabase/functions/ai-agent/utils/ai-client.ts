interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function streamAIResponse(
  systemPrompt: string,
  conversationHistory: Message[],
  userMessage: string,
  model: string = 'google/gemini-2.5-flash'
): Promise<ReadableStream> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY is not configured');
  }

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...conversationHistory,
    { role: 'user' as const, content: userMessage },
  ];

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_completion_tokens: 3000,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }
    if (response.status === 402) {
      throw new Error('PAYMENT_REQUIRED');
    }
    const errorText = await response.text();
    console.error('AI Gateway error:', response.status, errorText);
    throw new Error(`AI Gateway error: ${response.statusText}`);
  }

  return response.body!;
}

export function formatContextForAI(context: Record<string, any>): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(context)) {
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      parts.push(`**${formatKey(key)}**: ${value.length} items`);
      parts.push(JSON.stringify(value, null, 2));
    } else if (typeof value === 'object' && value !== null) {
      parts.push(`**${formatKey(key)}**:`);
      parts.push(JSON.stringify(value, null, 2));
    } else if (value != null) {
      parts.push(`**${formatKey(key)}**: ${value}`);
    }
  }

  return parts.join('\n\n');
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}
