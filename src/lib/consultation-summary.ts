import { VIEW_LABELS, type BodyView } from './anatomy';
import { AI_NOTICE, type ChatMessage, type SymptomDetails } from './chat-policy';
export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}
export function consultationSummary(part: string, view: BodyView, symptoms: SymptomDetails, messages: ChatMessage[], incomplete = false, created = new Date()) {
  const userText = messages.filter(message => message.role === 'user').map(message => message.content);
  const aiText = messages.filter(message => message.role === 'assistant' && message.content.trim()).map(message => message.content);
  const paragraphs = (items: string[]) => items.length ? items.map(text => `<div class="entry">${escapeHtml(text)}</div>`).join('') : '<p>No details provided.</p>';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>AnatoAI consultation summary</title><style>
  body{max-width:800px;margin:40px auto;padding:0 24px;font:15px/1.7 system-ui,sans-serif;color:#1e293b}h1{color:#1d4ed8}h2{margin-top:32px;font-size:19px}.notice{padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;color:#1e40af}.entry{white-space:pre-wrap;overflow-wrap:anywhere;margin:16px 0;padding:16px;border:1px solid #e2e8f0;border-radius:10px}.meta{color:#475569}dt{font-weight:600}dd{margin:0 0 12px}.print-tip{color:#64748b}@media print{body{margin:0;padding:12mm}.print-tip{display:none}.notice{break-inside:avoid}h2{break-after:avoid}}
  </style></head><body><h1>AnatoAI consultation summary</h1><p class="meta">Created ${escapeHtml(created.toLocaleString())}</p><p class="print-tip">Use your browser's Print command to print or save this summary as a PDF. This file contains the information you chose to download; share it only with people you intend.</p><div class="notice">${escapeHtml(AI_NOTICE)}</div>
  <h2>Selected location</h2><p>${escapeHtml(part)} — ${escapeHtml(VIEW_LABELS[view])}</p><h2>Details provided by the user</h2><dl><dt>Pain severity</dt><dd>${symptoms.severity === undefined ? 'Not provided' : `${symptoms.severity}/10`}</dd><dt>Duration</dt><dd>${escapeHtml(symptoms.duration || 'Not provided')}</dd><dt>Description</dt><dd>${escapeHtml(symptoms.quality || 'Not provided')}</dd></dl>${paragraphs(userText)}
  <h2>AI-generated conversation notes — not a diagnosis</h2>${incomplete ? '<p>The latest answer was stopped or interrupted and may be incomplete.</p>' : ''}${paragraphs(aiText)}<p class="meta">This summary has not been reviewed by a clinician. No examination findings or diagnosis are established by this document.</p></body></html>`;
}
export function downloadSummary(html: string) {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url; link.download = 'AnatoAI-consultation-summary.html';
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
