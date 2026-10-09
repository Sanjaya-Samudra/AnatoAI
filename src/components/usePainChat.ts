'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { BodyGender, BodyView } from '@/lib/anatomy';
import { MAX_MESSAGES, type ChatMessage, type SymptomDetails } from '@/lib/chat-policy';
import { readChatStream } from '@/lib/chat-stream';

function boundedHistory(messages: ChatMessage[]) {
  const result = messages.filter(message => message.content.trim()).slice(-MAX_MESSAGES);
  const encoder = new TextEncoder();
  while (encoder.encode(JSON.stringify(result)).byteLength > 48_000 && result.length > 1) result.shift();
  return result;
}
export function usePainChat(selectedPart: string, gender: BodyGender, viewMode: BodyView) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interrupted, setInterrupted] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const version = useRef(0);
  const lastRequest = useRef<{ messages: ChatMessage[]; symptoms: SymptomDetails }>({ messages: [], symptoms: {} });
  const run = useCallback(async (history: ChatMessage[], symptoms: SymptomDetails) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const current = ++version.current;
    lastRequest.current = { messages: history, symptoms };
    setError(null); setInterrupted(false); setLoading(true);
    setMessages([...history, { role: 'assistant', content: '' }]);
    let content = '';
    try {
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ messages: boundedHistory(history), selectedPart, gender, viewMode, symptoms }),
      });
      const result = await readChatStream(response, text => {
        content += text;
        if (version.current === current) setMessages([...history, { role: 'assistant', content }]);
      });
      if (version.current === current && result.truncated) { setInterrupted(true); setError('This answer reached its length limit. You can ask a follow-up for more detail.'); }
    } catch (cause) {
      if (version.current === current) {
        setInterrupted(true);
        setError(controller.signal.aborted ? 'Response stopped. You can retry or ask another question.' : cause instanceof Error ? cause.message : 'Could not connect. Please retry.');
      }
    } finally { if (version.current === current) { setLoading(false); requestRef.current = null; } }
  }, [selectedPart, gender, viewMode]);
  useEffect(() => {
    // Strict Mode replays effects in development. Deferring one tick avoids
    // sending and immediately aborting an extra paid provider request.
    const timer = setTimeout(() => { void run([], {}); }, 0);
    return () => { clearTimeout(timer); version.current += 1; requestRef.current?.abort(); };
  }, [run]);
  const stop = () => requestRef.current?.abort();
  const retry = () => { if (!loading) void run(lastRequest.current.messages, lastRequest.current.symptoms); };
  const send = (content: string, symptoms: SymptomDetails) => {
    if (loading || !content.trim()) return;
    // A partial answer is visible but should not be presented to the model as complete.
    const history = interrupted ? lastRequest.current.messages : messages.filter(message => message.content.trim());
    void run([...history, { role: 'user', content: content.trim() }], symptoms);
  };
  return { messages, loading, error, interrupted, send, stop, retry };
}
