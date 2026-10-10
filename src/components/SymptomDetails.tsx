'use client';
import { useState } from 'react';
import { DURATIONS, QUALITIES, type SymptomDetails as Details } from '@/lib/chat-policy';
export default function SymptomDetails({ value, disabled, onSubmit }: { value: Details; disabled: boolean; onSubmit: (details: Details) => void }) {
  const [draft, setDraft] = useState<Details>(value);
  const [skipped, setSkipped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const hasValue = Object.keys(value).length > 0;
  const chip = (active: boolean) => `rounded-lg border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${active ? 'border-blue-500 bg-blue-600 text-white' : 'border-blue-200 bg-white text-blue-800 hover:bg-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-blue-200'}`;
  if ((skipped || hasValue) && !expanded) return <button type="button" className="text-xs font-medium text-blue-600 dark:text-blue-300 underline underline-offset-4" onClick={() => { setDraft(value); setExpanded(true); }}> {hasValue ? 'Update symptom details' : 'Add symptom details (optional)'}</button>;
  return <section aria-label="Optional symptom details" className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/50">
    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Help me understand your pain</h3>
    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Optional — choose what you know, or continue chatting.</p>
    <fieldset disabled={disabled} className="mt-4 space-y-4 disabled:opacity-60">
      <div><label htmlFor="pain-severity" className="mb-2 block text-xs font-semibold">Pain severity</label><select id="pain-severity" value={draft.severity ?? ''} onChange={event => setDraft({ ...draft, severity: event.target.value === '' ? undefined : Number(event.target.value) })} className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"><option value="">Choose if you wish</option>{Array.from({ length: 11 }, (_, i) => <option key={i} value={i}>{i}/10{i === 0 ? ' — no pain' : i === 10 ? ' — worst pain imaginable' : ''}</option>)}</select></div>
      <fieldset><legend className="mb-2 text-xs font-semibold">When did it start?</legend><div className="flex flex-wrap gap-2">{DURATIONS.map(duration => <button key={duration} type="button" aria-pressed={draft.duration === duration} className={chip(draft.duration === duration)} onClick={() => setDraft({ ...draft, duration: draft.duration === duration ? undefined : duration })}>{duration}</button>)}</div></fieldset>
      <fieldset><legend className="mb-2 text-xs font-semibold">What does it feel like?</legend><div className="flex flex-wrap gap-2">{QUALITIES.map(quality => <button key={quality} type="button" aria-pressed={draft.quality === quality} className={chip(draft.quality === quality)} onClick={() => setDraft({ ...draft, quality: draft.quality === quality ? undefined : quality })}>{quality}</button>)}</div></fieldset>
      <div className="flex flex-wrap items-center gap-3"><button type="button" disabled={Object.values(draft).every(value => value === undefined)} onClick={() => { onSubmit(draft); setExpanded(false); }} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Use these details</button><button type="button" className="px-2 py-2 text-xs text-slate-600 dark:text-slate-300" onClick={() => { setSkipped(true); setExpanded(false); }}>Skip for now</button></div>
    </fieldset>
  </section>;
}
