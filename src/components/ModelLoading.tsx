'use client';
import { useProgress } from '@react-three/drei';
export default function ModelLoading() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return <div role="status" aria-live="polite" className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"><div className="w-60 rounded-2xl border border-blue-200 bg-white/95 p-5 text-center shadow-lg dark:border-slate-700 dark:bg-slate-900/95"><p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Loading body model</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-blue-100 dark:bg-slate-700"><div className="h-full rounded-full bg-blue-500 transition-[width]" style={{ width: `${Math.max(5, Math.min(100, progress))}%` }} /></div><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Preparing the anatomy view…</p></div></div>;
}
