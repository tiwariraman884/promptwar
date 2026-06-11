export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerously-allow-browser': 'true'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      stream: !!onChunk,
    }),
  });

  if (onChunk && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split('\n').filter(Boolean);
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'content_block_delta') {
              const chunk = data.delta?.text || '';
              fullText += chunk;
              onChunk(chunk);
            }
          } catch {}
        }
      }
    }
    return fullText;
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}
