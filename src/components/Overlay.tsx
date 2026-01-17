"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, AlertCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

  const sendMessageToApi = async (msgs: Message[], part: string) => {
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
          className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border-l border-blue-100 dark:border-slate-800 z-50 flex flex-col text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300"
        >
          {/* Header */}
          <div className="p-6 border-b border-blue-200 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-slate-700">
                <Image src="/LOGO1.png" alt="AnatoAI Logo" width={24} height={24} className="brightness-0 invert" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight font-sans">{selectedPart}</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider font-sans">Analysis Active</p>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-white to-blue-50/30 dark:from-slate-900 dark:to-slate-900/50 transition-colors duration-300" ref={scrollRef}>
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
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl shadow-md font-sans transition-colors duration-300 ${
                    msg.role === "user"
                      ? "bg-blue-600 dark:bg-blue-600 text-white rounded-br-none"
                      : "bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-200 dark:border-slate-700">
                      <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-sans">AI Assistant</span>
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none leading-relaxed">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-2 mt-4 font-sans" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-bold text-blue-600 dark:text-blue-400 mb-2 mt-3 font-sans" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1 mt-2 font-sans" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0 text-slate-700 dark:text-slate-300 font-sans" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 mb-2 space-y-1 text-slate-700 dark:text-slate-300" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 mb-2 space-y-1 text-slate-700 dark:text-slate-300" {...props} />,
                        li: ({node, ...props}) => <li className="text-slate-700 dark:text-slate-300 font-sans" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-slate-800 dark:text-slate-100 font-sans" {...props} />,
                        a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-sans" target="_blank" rel="noopener noreferrer" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-300 dark:border-blue-600 pl-4 italic text-slate-600 dark:text-slate-400 my-2 bg-blue-50/50 dark:bg-blue-900/20 py-2 rounded-r font-sans" {...props} />,
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
                <div className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 p-4 rounded-2xl rounded-bl-none flex items-center gap-2 shadow-sm transition-colors duration-300">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-blue-200 dark:border-slate-800 transition-colors duration-300">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about symptoms, treatments..."
                className="w-full pl-4 pr-12 py-4 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all shadow-inner font-sans"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 bottom-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-sans">
              <AlertCircle className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>AI can make mistakes. Consult a doctor for medical advice.</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
