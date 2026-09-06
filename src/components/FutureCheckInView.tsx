import React, { useState, useEffect, useRef } from 'react';
import { DecisionSnapshot, ChatMessage } from '../types';
import Markdown from 'react-markdown';
import {
  Clock,
  ArrowLeft,
  Sparkles,
  Send,
  CheckCircle2,
  Calendar,
  FileText,
  Compass,
} from 'lucide-react';

interface FutureCheckInViewProps {
  snapshot: DecisionSnapshot;
  onBack: () => void;
  onSaveReflection: (updatedSnapshot: DecisionSnapshot) => Promise<void>;
}

export const FutureCheckInView: React.FC<FutureCheckInViewProps> = ({
  snapshot,
  onBack,
  onSaveReflection,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reflectionNotes, setReflectionNotes] = useState(snapshot.reflectionNotes || '');
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(snapshot.isReviewed || false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize reflection with Gemini's required prompt:
  // "A previous version of you wanted to revisit this decision. What has changed since then?"
  useEffect(() => {
    const initialPrompt =
      'A previous version of you wanted to revisit this decision. What has changed since then?';
    setMessages([
      {
        id: 'initial-reflection-msg',
        role: 'model',
        content: `**"${initialPrompt}"**\n\nTake a breath and look back at where you were when you created this snapshot. Did things unfold the way you anticipated, or did unexpected factors shape the outcome? I'm here to help you unpack what you learned.`,
        createdAt: new Date().toISOString(),
      },
    ]);
  }, [snapshot]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snapshot,
          messages: newMessages,
          reflectionNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to reflection assistant.');
      }

      const data = await response.json();
      const modelMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'model',
        content: data.reply,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Error reflecting with Gemini:', err);
      const errorMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'model',
        content: `*I encountered an issue connecting to the reflection companion: ${err.message}. Please try again.*`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    setIsMarkingComplete(true);
    try {
      const updated: DecisionSnapshot = {
        ...snapshot,
        isReviewed: true,
        reviewedAt: new Date().toISOString(),
        reflectionNotes: reflectionNotes.trim(),
      };
      await onSaveReflection(updated);
      setCompletedSuccess(true);
    } catch (err) {
      console.error('Failed to complete check-in:', err);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col bg-[#F8FAFC] px-4 py-6 sm:px-8">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Feature 7 Badge: "Time to Check In" */}
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-semibold text-amber-700">
          <Clock className="h-3.5 w-3.5 text-amber-600" />
          <span>Time to Check In</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkCompleted}
            disabled={isMarkingComplete}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              completedSuccess
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{completedSuccess ? 'Reflected & Completed' : 'Mark Check-In Completed'}</span>
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Original Decision Snapshot Reference */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Original Snapshot
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(snapshot.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-3">
              <h3 className="text-base font-bold text-slate-800">
                {snapshot.title}
              </h3>
              <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                <strong className="text-indigo-600 block mb-0.5 text-[10px] uppercase">
                  What you were thinking:
                </strong>{' '}
                {snapshot.whatIAmThinkingAbout}
              </p>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Options You Weighed:
                </span>
                <ul className="space-y-1 text-slate-600">
                  {snapshot.optionsConsidered?.map((opt, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-rose-50/60 p-3 border border-rose-100">
                <span className="text-[10px] font-bold text-rose-800 uppercase block mb-0.5">
                  Past Biggest Concern:
                </span>
                <p className="text-slate-700">{snapshot.biggestConcern}</p>
              </div>

              <div className="rounded-xl bg-amber-50/60 p-3 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-800 uppercase block mb-0.5">
                  Past Key Insight:
                </span>
                <p className="text-slate-800 font-medium">{snapshot.keyInsight}</p>
              </div>

              <div className="rounded-xl bg-emerald-50/60 p-3 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-0.5">
                  Suggested Next Step:
                </span>
                <p className="text-slate-800 font-medium">{snapshot.suggestedNextStep}</p>
              </div>
            </div>
          </div>

          {/* User Reflection Notes */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label
              htmlFor="reflection-notes"
              className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1"
            >
              My Reflection Notes
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Capture your takeaways and what actually happened:
            </p>
            <textarea
              id="reflection-notes"
              value={reflectionNotes}
              onChange={(e) => setReflectionNotes(e.target.value)}
              placeholder="e.g., I ended up taking the offer. The first month was stressful, but the team turned out to be much more supportive than I feared..."
              rows={4}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none bg-slate-50"
            />
          </div>
        </div>

        {/* Right Column: Interactive Gemini Reflection Chat */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden h-[640px]">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold text-slate-800">
              Future Me Reflection Dialogue
            </span>
            <span className="text-xs text-slate-400 ml-auto">
              Re-examining with hindsight
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                {msg.role === 'user' ? (
                  <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center text-[11px] font-bold text-slate-700 shrink-0">
                    You
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs'
                      : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
                  }`}
                >
                  <div className="markdown-body">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                  <div
                    className={`mt-1.5 text-[9px] ${
                      msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-2">
                <Sparkles className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                <span>DecideAI is reflecting with you...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-100 p-3.5 bg-slate-50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Reply to DecideAI's reflection question..."
                disabled={isLoading}
                className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1.5 p-1.5 rounded-lg bg-indigo-600 text-white transition-opacity hover:bg-indigo-700 disabled:opacity-40 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
