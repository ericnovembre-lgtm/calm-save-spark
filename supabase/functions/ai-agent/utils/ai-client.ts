interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function streamAIResponse(
  systemPrompt: string,
  conversationHistory: Message[],
  userMessage: string
): Promise<ReadableStream> {
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...conversationHistory,
    { role: 'user' as const, content: userMessage },
  ];

  const response = await fetch('https://api.lovable.app/v1/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY') || 'internal'}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.statusText}`);
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
