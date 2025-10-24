// Shared LLM config and JSON chat utility
export interface APIConfig {
  provider: 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  baseUrl?: string;
}

export function getAPIConfig(): APIConfig {
  // Local hardcoded config (same across games)
  return {
    provider: 'openai',
    apiKey: 'sk-vrgalFUAhsHRsYV4j3PdnDWEc0LK7MGaUckl7vKrhGmfnyvW',
    baseUrl: 'https://api.openxs.top',
  };
}

export async function callChatJSON(prompt: string): Promise<any> {
  const { provider, apiKey, baseUrl } = getAPIConfig();

  if (provider !== 'openai' || !apiKey || !baseUrl) {
    throw new Error('LLM provider not available or misconfigured');
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const endpoint = normalizedBaseUrl.endsWith('/v1')
    ? `${normalizedBaseUrl}/chat/completions`
    : `${normalizedBaseUrl}/v1/chat/completions`;

  const body = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt }
        ]
      }
    ],
    max_tokens: 800,
    temperature: 0.2,
    response_format: { type: 'json_object' }
  };

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI API错误 ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  try {
    return JSON.parse(content);
  } catch {
    const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  }
}
