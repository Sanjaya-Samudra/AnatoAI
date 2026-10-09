"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, AlertCircle, Sparkles } from "lucide-react";
import ChatMarkdown from "./ChatMarkdown";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface OverlayProps {
  selectedPart: string | null;
  onClose: () => void;
  gender: "male" | "female";
}

export default function Overlay({ selectedPart, onClose, gender }: OverlayProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const requestVersion = useRef(0);

  const sendMessageToApi = useCallback(async (msgs: Message[], part: string) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: msgs, 
          selectedPart: part,
          gender: gender
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error("Failed to send message:", error);
      return { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again later." };
    }
  }, [gender]);

  useEffect(() => {
    requestVersion.current += 1;
    let isMounted = true;

    if (selectedPart) {
      setMessages([]);
      setLoading(true);
      
      // Automatically explain a selected pain point, or greet in general chat.
      sendMessageToApi([], selectedPart).then((response) => {
        if (isMounted) {
          setMessages([response]);
          setLoading(false);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [selectedPart, sendMessageToApi]);

  useEffect(() => {
    if (scrollRef.current) {
      // Show a new pain-point overview from its beginning; follow-ups stay at the latest reply.
      scrollRef.current.scrollTop = messages.length <= 1 ? 0 : scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedPart || loading) return;

    const newMessages = [...messages, { role: "user", content: input } as Message];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const currentVersion = requestVersion.current;
    const response = await sendMessageToApi(newMessages, selectedPart);
    if (currentVersion !== requestVersion.current) return;
    
    setMessages((prev) => [...prev, response]);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {selectedPart && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-dvh min-w-0 w-full md:w-[480px] overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border-l border-blue-100 dark:border-slate-800 z-50 flex flex-col text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300"
        >
          {/* Header */}
          <div className="shrink-0 px-5 py-5 border-b border-blue-200 dark:border-slate-800 flex justify-between items-center gap-3 bg-gradient-to-r from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 transition-colors duration-300">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-blue-500/20 bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
                <Image 
                  src="/Asset-2.png" 
                  alt="AnatoAI Logo" 
                  fill
                  className="object-contain p-1.5"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl break-words font-bold text-slate-800 dark:text-slate-100 tracking-tight font-sans">{selectedPart}</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider font-sans">Analysis Active</p>
                </div>
              </div>
            </div>
            <button 
              aria-label="Close chat"
              onClick={onClose}
              className="shrink-0 p-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden px-5 pt-6 pb-8 space-y-5 custom-scrollbar bg-gradient-to-b from-white to-blue-50/30 dark:from-slate-900 dark:to-slate-900/50 transition-colors duration-300" ref={scrollRef}>
            {messages.length === 0 && loading && (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-blue-200 dark:border-slate-700 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>
                <p className="text-sm font-semibold animate-pulse font-sans text-slate-700 dark:text-slate-300">Analyzing {selectedPart}...</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex min-w-0 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`min-w-0 max-w-full px-5 py-5 rounded-2xl shadow-md font-sans transition-colors duration-300 ${
                    msg.role === "user"
                      ? "max-w-[88%] bg-blue-600 dark:bg-blue-600 text-white rounded-br-none"
                      : "w-full bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-200 dark:border-slate-700">
                      <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-sans">AI Assistant</span>
                    </div>
                  )}
                  {msg.role === "assistant" ? <ChatMarkdown content={msg.content} /> : <p className="whitespace-pre-wrap text-sm leading-7 text-white [overflow-wrap:anywhere]">{msg.content}</p>}
                  {msg.role === "assistant" && (
                    <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200" role="note" aria-label="AI-generated medical information notice">
                      <AlertCircle className="mt-1 h-4 w-4 shrink-0 text-blue-500 dark:text-blue-300" aria-hidden="true" />
                      <p><strong className="font-semibold">This response is AI-generated and may contain errors.</strong> It is for educational purposes only. Consult a qualified doctor for medical advice, diagnosis, or treatment.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {loading && messages.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 p-4 rounded-2xl rounded-bl-none flex items-center gap-2 shadow-sm transition-colors duration-300">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="shrink-0 px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-white dark:bg-slate-900 border-t border-blue-200 dark:border-slate-800 transition-colors duration-300">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a health or anatomy question..."
                className="w-full pl-4 pr-12 py-4 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all shadow-inner font-sans"
              />
              <button
                aria-label="Send message"
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 bottom-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="mt-4 flex items-start justify-center gap-2 px-1 text-center text-xs leading-5 text-slate-500 dark:text-slate-400 font-sans">
              <AlertCircle className="mt-1 w-3 h-3 shrink-0 text-slate-400 dark:text-slate-500" />
              <span>AI can make mistakes. Consult a doctor for medical advice.</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
