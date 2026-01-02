"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Activity, AlertCircle, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface OverlayProps {
  selectedPart: string | null;
  onClose: () => void;
}

export default function Overlay({ selectedPart, onClose }: OverlayProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessageToApi = async (msgs: Message[], part: string) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: msgs, 
          selectedPart: part 
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
  };

  useEffect(() => {
    let isMounted = true;

    if (selectedPart) {
      setMessages([]);
      setLoading(true);
      
      // Initial AI greeting
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
  }, [selectedPart]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedPart) return;

    const newMessages = [...messages, { role: "user", content: input } as Message];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const response = await sendMessageToApi(newMessages, selectedPart);
    
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
          className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-slate-900/95 backdrop-blur-xl shadow-2xl border-l border-slate-700 z-50 flex flex-col text-slate-100"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-slate-800 to-slate-900">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/20 rounded-lg border border-teal-500/30">
                <Activity className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{selectedPart}</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <p className="text-xs text-teal-400 font-medium uppercase tracking-wider">Analysis Active</p>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" ref={scrollRef}>
            {messages.length === 0 && loading && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-teal-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-teal-400 animate-pulse" />
                </div>
                <p className="text-sm font-medium animate-pulse">Analyzing {selectedPart}...</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                    msg.role === "user"
                      ? "bg-teal-600 text-white rounded-br-none"
                      : "bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700/50">
                      <Sparkles className="w-3 h-3 text-teal-400" />
                      <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">AI Assistant</span>
                    </div>
                  )}
                  <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold text-teal-300 mb-2 mt-4" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-bold text-teal-200 mb-2 mt-3" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-bold text-teal-100 mb-1 mt-2" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 mb-2 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 mb-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="text-slate-200" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-teal-100" {...props} />,
                        a: ({node, ...props}) => <a className="text-teal-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-teal-500/50 pl-4 italic text-slate-400 my-2" {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {loading && messages.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-900 border-t border-slate-700">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about symptoms, treatments..."
                className="w-full pl-4 pr-12 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 bottom-2 p-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
              <AlertCircle className="w-3 h-3" />
              <span>AI can make mistakes. Consult a doctor for medical advice.</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
