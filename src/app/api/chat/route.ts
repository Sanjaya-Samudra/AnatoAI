import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { readLimitedJson, RequestError, validateChatRequest } from '@/lib/chat-policy';
import { checkRateLimit } from '@/lib/rate-limit';
import { buildChatMessages } from '@/lib/chat-prompt';

export const runtime = 'nodejs';
export const maxDuration = 60;
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
function failure(message: string, status: number, retryAfter?: number) {
  return NextResponse.json({ error: message }, { status, headers: { ...headers, ...(retryAfter ? { 'Retry-After': String(retryAfter) } : {}) } });
}
export async function POST(req: Request) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  req.signal.addEventListener('abort', abort, { once: true });
  if (req.signal.aborted) abort();
  const timeout = setTimeout(abort, 45_000);
  const cleanup = () => { clearTimeout(timeout); req.signal.removeEventListener('abort', abort); };
  try {
    const data = validateChatRequest(await readLimitedJson(req, controller.signal));
    let limit;
    try { limit = await checkRateLimit(req); }
    catch { cleanup(); return failure('Chat is temporarily unavailable. Please try again shortly.', 503, 30); }
    if (!limit.allowed) { cleanup(); return failure('You have sent several requests. Please wait a moment before trying again.', 429, limit.retryAfter); }
    if (!process.env.GROQ_API_KEY) { cleanup(); return failure('The health assistant is not configured yet. Please try again later.', 503); }
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY, maxRetries: 0 });
    const stream = await groq.chat.completions.create({
      messages: buildChatMessages(data), model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
      temperature: 0.5, max_tokens: 1400, stream: true,
    }, { signal: controller.signal });
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      async start(output) {
        const emit = (event: object) => { try { output.enqueue(encoder.encode(JSON.stringify(event) + '\n')); } catch { abort(); } };
        let finishReason = '';
        try {
          for await (const chunk of stream) {
            if (controller.signal.aborted) break;
            const choice = chunk.choices[0];
            if (choice?.finish_reason) finishReason = choice.finish_reason;
            const text = choice?.delta?.content;
            if (text) emit({ type: 'delta', text });
          }
          if (!controller.signal.aborted) emit({ type: 'done', truncated: finishReason === 'length' });
          else if (!req.signal.aborted) emit({ type: 'error', message: 'The response timed out. Please retry.' });
        } catch {
          if (!req.signal.aborted) emit({ type: 'error', message: controller.signal.aborted ? 'The response timed out. Please retry.' : 'The response was interrupted. Please retry.' });
        } finally {
          cleanup();
          try { output.close(); } catch { /* The client stopped reading. */ }
        }
      },
      cancel() { abort(); cleanup(); },
    });
    return new Response(body, { headers: { ...headers, 'Content-Type': 'application/x-ndjson; charset=utf-8', 'X-Accel-Buffering': 'no' } });
  } catch (error: unknown) {
    cleanup();
    if (error instanceof RequestError) return failure(error.message, error.status);
    if (controller.signal.aborted) return failure('The response timed out or was cancelled. Please retry.', 504);
    if (error instanceof Groq.APIError && error.status === 429) return failure('The AI service is busy. Please try again shortly.', 429, 30);
    // Keep provider errors, credentials, and health content out of responses and logs.
    return failure('The assistant could not respond. Please try again.', 502);
  }
}
