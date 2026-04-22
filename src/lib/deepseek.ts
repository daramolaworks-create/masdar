/**
 * Client-side chat helper.
 * Calls our own /api/chat serverless endpoint instead of DeepSeek directly,
 * so the API key stays safely on the server.
 */
export const chatWithAssistant = async (
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
): Promise<string> => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${res.status}`);
  }

  const data = await res.json();
  return data.response || '';
};
