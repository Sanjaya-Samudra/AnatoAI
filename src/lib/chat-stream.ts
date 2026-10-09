export async function readChatStream(response: Response, onDelta: (text: string) => void) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const wait = Number(response.headers.get('retry-after'));
    throw new Error((typeof error.error === 'string' ? error.error : 'The assistant could not respond.') + (wait > 0 ? ` Try again in ${wait} seconds.` : ''));
  }
  if (!response.body) throw new Error('No response was received. Please retry.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finished = false;
  let truncated = false;
  let hasText = false;
  const parse = (line: string) => {
    if (!line.trim()) return;
    const event = JSON.parse(line);
    if (event.type === 'delta' && typeof event.text === 'string') { hasText = true; onDelta(event.text); }
    else if (event.type === 'done') { finished = true; truncated = event.truncated === true; }
    else if (event.type === 'error') throw new Error(typeof event.message === 'string' ? event.message : 'The response was interrupted.');
  };
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let newline: number;
      while ((newline = buffer.indexOf('\n')) >= 0) { parse(buffer.slice(0, newline)); buffer = buffer.slice(newline + 1); }
    }
    buffer += decoder.decode();
    if (buffer) parse(buffer);
    if (!finished || !hasText) throw new Error('The response was interrupted. Please retry.');
    return { truncated };
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
