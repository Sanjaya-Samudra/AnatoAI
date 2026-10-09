import { BODY_VIEWS, GENERAL_ASSISTANT, PARTS_BY_GENDER, type BodyGender, type BodyView } from './anatomy';

export const MAX_REQUEST_BYTES = 64 * 1024;
export const MAX_MESSAGES = 16;
export const MAX_USER_LENGTH = 2000;
export const DURATIONS = ['Today', 'A few days', 'A week or more', 'A month or more'] as const;
export const QUALITIES = ['Sharp', 'Aching', 'Burning', 'Throbbing', 'Tingling'] as const;
export const AI_NOTICE = 'This response is AI-generated and may contain errors. It is for educational purposes only. Consult a qualified doctor for medical advice, diagnosis, or treatment.';
export interface ChatMessage { role: 'user' | 'assistant'; content: string }
export interface SymptomDetails { severity?: number; duration?: string; quality?: string }
export interface ChatRequest { messages: ChatMessage[]; selectedPart: string; gender: BodyGender; viewMode: BodyView; symptoms?: SymptomDetails }
export class RequestError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export async function readLimitedJson(req: Request, signal?: AbortSignal): Promise<unknown> {
  if (signal?.aborted) throw new RequestError('The request timed out. Please retry.', 408);
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new RequestError('Use application/json for chat requests.', 415);
  const origin = req.headers.get('origin');
  if (origin) {
    // Next may construct req.url with its internal hostname. The browser's
    // Origin must match the actual HTTP Host, including its public port.
    const url = new URL(req.url);
    const host = req.headers.get('host') || url.host;
    const protocol = req.headers.get('x-forwarded-proto')?.split(',')[0].trim() || url.protocol.slice(0, -1);
    let expectedOrigin = '';
    try { if (protocol === 'http' || protocol === 'https') expectedOrigin = new URL(`${protocol}://${host}`).origin; } catch { /* Invalid host is rejected below. */ }
    if (origin !== expectedOrigin) throw new RequestError('This request is not allowed.', 403);
  }
  if (Number(req.headers.get('content-length')) > MAX_REQUEST_BYTES) throw new RequestError('The conversation is too large.', 413);
  const reader = req.body?.getReader();
  if (!reader) throw new RequestError('A request body is required.');
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal?.addEventListener('abort', cancel, { once: true });
  let bytes = 0;
  let text = '';
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (signal?.aborted) throw new RequestError('The request timed out. Please retry.', 408);
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_REQUEST_BYTES) { await reader.cancel(); throw new RequestError('The conversation is too large.', 413); }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    try { return JSON.parse(text); } catch { throw new RequestError('The request contains invalid JSON.'); }
  } finally { signal?.removeEventListener('abort', cancel); reader.releaseLock(); }
}
export function validateChatRequest(value: unknown): ChatRequest {
  if (!value || typeof value !== 'object') throw new RequestError('Invalid chat request.');
  const data = value as Record<string, unknown>;
  const { messages, gender, selectedPart, symptoms } = data;
  const viewMode = data.viewMode ?? 'full';
  if ((gender !== 'male' && gender !== 'female') || !BODY_VIEWS.includes(viewMode as BodyView)) throw new RequestError('Invalid body view.');
  const view = viewMode as BodyView;
  const allowed = view === 'full' ? Object.values(PARTS_BY_GENDER[gender]).flat() : PARTS_BY_GENDER[gender][view];
  if (typeof selectedPart !== 'string' || (selectedPart !== GENERAL_ASSISTANT && !allowed.some(part => part.name === selectedPart))) throw new RequestError('Select a valid body point.');
  if (!Array.isArray(messages) || messages.length > MAX_MESSAGES) throw new RequestError('The conversation is too long. Start a new chat.');
  const cleanMessages: ChatMessage[] = messages.map(message => {
    if (!message || (message.role !== 'user' && message.role !== 'assistant') || typeof message.content !== 'string' || !message.content.trim()) throw new RequestError('Invalid chat message.');
    if (message.content.length > (message.role === 'user' ? MAX_USER_LENGTH : 12000)) throw new RequestError('A message is too long.', 413);
    return { role: message.role, content: message.content };
  });
  let cleanSymptoms: SymptomDetails | undefined;
  if (symptoms !== undefined) {
    if (!symptoms || typeof symptoms !== 'object' || Array.isArray(symptoms)) throw new RequestError('Invalid symptom details.');
    const details = symptoms as Record<string, unknown>;
    if (Object.keys(details).some(key => !['severity', 'duration', 'quality'].includes(key))) throw new RequestError('Invalid symptom details.');
    if (details.severity !== undefined && (typeof details.severity !== 'number' || !Number.isInteger(details.severity) || details.severity < 0 || details.severity > 10)) throw new RequestError('Choose a severity between 0 and 10.');
    if (details.duration !== undefined && !DURATIONS.includes(details.duration as typeof DURATIONS[number])) throw new RequestError('Invalid duration.');
    if (details.quality !== undefined && !QUALITIES.includes(details.quality as typeof QUALITIES[number])) throw new RequestError('Invalid pain description.');
    cleanSymptoms = { ...(details.severity !== undefined ? { severity: details.severity as number } : {}), ...(details.duration ? { duration: details.duration as string } : {}), ...(details.quality ? { quality: details.quality as string } : {}) };
  }
  return { messages: cleanMessages, gender, selectedPart, viewMode: view, symptoms: cleanSymptoms };
}
