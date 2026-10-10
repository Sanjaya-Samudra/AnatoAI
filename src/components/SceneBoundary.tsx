'use client';
import { Component, type ReactNode } from 'react';
export default class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div className="absolute inset-0 flex items-center justify-center px-8"><div role="alert" className="max-w-sm rounded-2xl border border-blue-200 bg-white/95 p-5 text-center text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><p>The 3D view could not load. You can still use chat or search for a pain point in the anatomy viewer.</p><button className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-white" onClick={() => window.location.reload()}>Reload page</button></div></div>;
    return <div className="h-full w-full">{this.props.children}</div>;
  }
}
