'use client';
import { useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { searchableParts, VIEW_LABELS, type BodyGender, type BodyView } from '@/lib/anatomy';
export default function BodyPartSearch({ gender, viewMode, onSelect }: { gender: BodyGender; viewMode: BodyView; onSelect: (name: string, view: BodyView) => void }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const options = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return searchableParts(gender, viewMode).filter(part => terms.every(term => `${part.name} ${part.region}`.toLowerCase().includes(term)));
  }, [gender, viewMode, query]);
  const choose = (index: number) => {
    const result = options[index];
    if (!result) return;
    onSelect(result.name, result.view); setOpen(false); setQuery(''); setActive(-1); input.current?.focus();
  };
  return <div className="relative w-full max-w-sm" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white/95 px-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <Search className="h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
      <input ref={input} aria-label="Search pain points" role="combobox" aria-expanded={open} aria-controls="pain-point-options" aria-autocomplete="list" aria-activedescendant={active >= 0 ? `pain-option-${active}` : undefined} placeholder={viewMode === 'full' ? 'Find a pain point…' : `Search ${VIEW_LABELS[viewMode]} pain points…`} value={query} onFocus={() => setOpen(true)} onChange={event => { setQuery(event.target.value); setActive(-1); setOpen(true); }} onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); const next = event.key === 'ArrowDown' ? Math.min(active + 1, options.length - 1) : Math.max(active - 1, 0); setActive(next); document.getElementById(`pain-option-${next}`)?.scrollIntoView({ block: 'nearest' }); }
        if (event.key === 'Enter' && open) { event.preventDefault(); choose(active < 0 ? 0 : active); }
        if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); }
      }} className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-500 dark:text-slate-100" />
      {open && <button type="button" aria-label="Close pain point search" className="p-1 text-slate-500" onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>}
    </div>
    {open && <ul id="pain-point-options" role="listbox" aria-label="Pain points" className="absolute top-full z-50 mt-2 max-h-[35dvh] w-full overflow-y-auto rounded-xl border border-blue-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
      {options.map((part, index) => <li id={`pain-option-${index}`} key={`${part.view}-${part.name}`} role="option" aria-selected={index === active} onMouseDown={event => event.preventDefault()} onClick={() => choose(index)} className={`cursor-pointer rounded-lg px-3 py-2 text-sm ${index === active ? 'bg-blue-100 dark:bg-blue-950' : 'hover:bg-blue-50 dark:hover:bg-slate-800'}`}><span className="block text-slate-800 dark:text-slate-100">{part.name}</span><span className="text-xs text-blue-600 dark:text-blue-300">{part.region}</span></li>)}
      {!options.length && <li role="presentation" className="p-3 text-sm text-slate-500">No matching pain point in {VIEW_LABELS[viewMode].toLowerCase()}.</li>}
    </ul>}
  </div>;
}
