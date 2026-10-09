"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h1: ({ children }) => <h1 className="mt-5 mb-3 text-lg font-bold leading-snug text-blue-700 dark:text-blue-300">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-5 mb-3 text-base font-bold leading-snug text-blue-700 dark:text-blue-300">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-4 mb-2 text-sm font-bold leading-snug text-blue-700 dark:text-blue-300">{children}</h3>,
  p: ({ children }) => <p className="my-3">{children}</p>,
  ul: ({ children }) => <ul className="my-3 list-disc space-y-2 pl-5 marker:text-blue-500 [&_p]:my-1">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-2 pl-5 marker:font-semibold marker:text-blue-500 [&_p]:my-1">{children}</ol>,
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-slate-100">{children}</strong>,
  a: ({ children, href }) => <a href={href} className="text-blue-600 underline decoration-blue-300 underline-offset-4 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200" target="_blank" rel="noopener noreferrer">{children}</a>,
  blockquote: ({ children }) => <blockquote className="my-4 rounded-r-lg border-l-4 border-blue-400 bg-blue-50 px-4 py-3 text-slate-600 dark:bg-blue-950/40 dark:text-slate-300 [&>p]:my-0">{children}</blockquote>,
  table: ({ children }) => <div className="my-4 w-full min-w-0 max-w-full overflow-x-auto rounded-xl border border-blue-200 dark:border-slate-600" role="region" aria-label="Response table" tabIndex={0}><table className="w-full min-w-[24rem] border-collapse text-left text-sm leading-6">{children}</table></div>,
  thead: ({ children }) => <thead className="bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-200">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-blue-100 dark:divide-slate-700 [&>tr:nth-child(even)]:bg-slate-50 dark:[&>tr:nth-child(even)]:bg-slate-900/40">{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children, style }) => <th scope="col" style={style} className="min-w-28 border-b border-blue-200 px-4 py-3 align-top font-semibold dark:border-slate-600">{children}</th>,
  td: ({ children, style }) => <td style={style} className="min-w-28 max-w-64 px-4 py-3 align-top [overflow-wrap:anywhere]">{children}</td>,
  pre: ({ children }) => <pre className="my-4 max-w-full overflow-x-auto rounded-lg bg-slate-100 p-4 text-xs leading-6 dark:bg-slate-900 [&>code]:bg-transparent [&>code]:p-0">{children}</pre>,
  code: ({ children, className }) => <code className={"rounded bg-blue-50 px-1.5 py-0.5 text-[0.9em] dark:bg-slate-900 " + (className || "")}>{children}</code>,
  hr: () => <hr className="my-5 border-blue-100 dark:border-slate-700" />,
};

export default function ChatMarkdown({ content }: { content: string }) {
  return <div className="min-w-0 max-w-full text-sm leading-7 text-slate-700 dark:text-slate-200 [overflow-wrap:anywhere] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_img]:max-w-full"><ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{content}</ReactMarkdown></div>;
}
