import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  Bot,
  MessageSquare,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  EMPLOYEE_SUGGESTED_PROMPTS,
  generateChatbotReply,
  OWNER_SUGGESTED_PROMPTS,
} from '../utils/chatbotEngine';

function renderFormattedText(text) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <div key={i} className={i > 0 ? 'mt-1' : ''}>
        {parts.map((part, idx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={idx} className="font-semibold">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>
    );
  });
}

export default function Chatbot() {
  const { auth, data, currentEmployee } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  const role = auth?.role || 'employee';
  const suggestedPrompts =
    role === 'owner' ? OWNER_SUGGESTED_PROMPTS : EMPLOYEE_SUGGESTED_PROMPTS;

  const getWelcomeMessage = () => ({
    id: 'welcome',
    sender: 'bot',
    text:
      role === 'owner'
        ? 'Hello! I am the **WorkSphere AI Assistant** (simulated demo). Ask me about live attendance, pending leave requests, department stats, or workforce summaries.'
        : `Hi ${currentEmployee?.name?.split(' ')[0] || 'there'}! I am the **WorkSphere AI Assistant** (simulated demo). Ask me about your leave balance, attendance, tasks, performance, or payslips.`,
    followUps: suggestedPrompts.slice(0, 3),
  });

  const [messages, setMessages] = useState([getWelcomeMessage()]);

  // Reset welcome context when role changes
  useEffect(() => {
    setMessages([getWelcomeMessage()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, currentEmployee?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  const sendMessage = (textOverride) => {
    const query = (textOverride ?? input).trim();
    if (!query || typing) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!textOverride) setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply = generateChatbotReply(query, { role, data, currentEmployee });
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: reply.text,
          links: reply.links,
          followUps: reply.followUps,
        },
      ]);
      setTyping(false);
    }, 450);
  };

  return (
    <div className="no-print fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[400px] h-[540px] max-h-[78vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold leading-tight">WorkSphere AI Assistant</h3>
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-indigo-500/20 text-indigo-200 rounded-md border border-indigo-400/30">
                      Demo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Simulated {role === 'owner' ? 'Owner Insights' : 'Employee Helper'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Clear chat"
                  onClick={() => setMessages([getWelcomeMessage()])}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Close assistant"
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Suggested Quick Prompts Bar */}
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center gap-1.5 overflow-x-auto">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm'
                    }`}
                  >
                    {renderFormattedText(msg.text)}

                    {msg.links && msg.links.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {msg.links.map((lk) => (
                          <button
                            key={lk.path}
                            type="button"
                            onClick={() => {
                              navigate(lk.path);
                              setOpen(false);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            {lk.label}
                            <ArrowUpRight className="h-3 w-3" />
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.followUps && msg.followUps.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/70 dark:border-slate-700/70 flex flex-wrap gap-1">
                        {msg.followUps.map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => sendMessage(f)}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: '0.15s' }}
                    />
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: '0.3s' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask WorkSphere Assistant..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-14 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 font-semibold text-sm transition-colors"
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <>
            <MessageSquare className="h-5 w-5" />
            <span className="hidden sm:inline">AI Assistant</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
