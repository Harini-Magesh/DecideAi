import React, { useState, useEffect, useRef } from 'react';
import { Conversation, ChatMessage, ConversationMode, DecisionSnapshot } from '../types';
import { SnapshotModal } from './SnapshotModal';
import Markdown from 'react-markdown';
import {
  Send,
  Sparkles,
  ArrowLeft,
  Compass,
  Layers,
  HelpCircle,
  FileCheck,
  Edit2,
  Check,
  AlertCircle,
  Clock,
  ChevronRight,
  Calendar,
} from 'lucide-react';

interface ChatViewProps {
  conversation: Conversation;
  initialMessages: ChatMessage[];
  onBack: () => void;
  onSaveConversation: (updatedConv: Conversation, messages: ChatMessage[]) => Promise<void>;
  onSaveSnapshot: (snapshot: DecisionSnapshot) => Promise<void>;
  onNavigateToCheckIn?: (snapshot: DecisionSnapshot) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  initialMessages,
  onBack,
  onSaveConversation,
  onSaveSnapshot,
  onNavigateToCheckIn,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSnapshot, setIsGeneratingSnapshot] = useState(false);
  const [activeSnapshot, setActiveSnapshot] = useState<DecisionSnapshot | null>(
    conversation.snapshot || null
  );
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [title, setTitle] = useState(conversation.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      let initialGreeting = '';
      if (conversation.mode === 'decision') {
        initialGreeting =
          "Hello! I am your DecideAI Decision Companion.\n\nYou can ask me any question—from general topics, technology, careers, and business, to breaking down complex dilemmas, mapping options, and weighing trade-offs.\n\n**What would you like to explore or decide today?**";
      } else if (conversation.mode === 'idea') {
        initialGreeting =
          "Welcome! I am your Idea Strategist.\n\nWhether you want to brainstorm a new concept, ask about tools and technology, or stress-test a project idea, I'm ready.\n\n**What spark or question is on your mind?**";
      } else {
        initialGreeting =
          "Welcome to your Reflection space.\n\nHere we can explore past outcomes, talk through personal growth, or discuss any topic you'd like clarity on.\n\n**What would you like to reflect on or discuss today?**";
      }

      const greetingMessage: ChatMessage = {
        id: 'initial-greeting-' + Date.now(),
        role: 'model',
        content: initialGreeting,
        createdAt: new Date().toISOString(),
      };
      setMessages([greetingMessage]);
      onSaveConversation(conversation, [greetingMessage]);
    }
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    setErrorBanner(null);

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let updatedTitle = title;
    if (
      title.startsWith('New ') ||
      title === 'Untitled Decision' ||
      title === 'Untitled Idea' ||
      title === 'Untitled Reflection'
    ) {
      updatedTitle = text.trim().slice(0, 40) + (text.length > 40 ? '...' : '');
      setTitle(updatedTitle);
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          mode: conversation.mode,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to connect to DecideAI companion.');
      }

      const data = await res.json();
      const modelMessage: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'model',
        content: data.reply,
        createdAt: new Date().toISOString(),
      };

      const finalMessages = [...newMessages, modelMessage];
      setMessages(finalMessages);

      const updatedConv: Conversation = {
        ...conversation,
        title: updatedTitle,
        updatedAt: new Date().toISOString(),
        lastMessageSnippet: modelMessage.content.slice(0, 100),
        messageCount: finalMessages.length,
      };
      await onSaveConversation(updatedConv, finalMessages);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorBanner(err.message || 'Something went wrong. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSnapshot = async () => {
    if (messages.length < 2) {
      setErrorBanner('Please share your thoughts first before creating a snapshot.');
      return;
    }

    setIsGeneratingSnapshot(true);
    setErrorBanner(null);

    try {
      const res = await fetch('/api/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          mode: conversation.mode,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate snapshot.');
      }

      const { snapshot: rawSnapshot } = await res.json();

      const snapshotId = activeSnapshot?.id || 'snap-' + Date.now();
      const newSnapshot: DecisionSnapshot = {
        id: snapshotId,
        userId: conversation.userId,
        conversationId: conversation.id,
        conversationTitle: title,
        mode: conversation.mode,
        title: rawSnapshot.title || title,
        whatIAmThinkingAbout: rawSnapshot.whatIAmThinkingAbout || '',
        optionsConsidered: rawSnapshot.optionsConsidered || [],
        keyFactors: rawSnapshot.keyFactors || [],
        mainTradeOffs: rawSnapshot.mainTradeOffs || [],
        biggestConcern: rawSnapshot.biggestConcern || '',
        keyInsight: rawSnapshot.keyInsight || '',
        suggestedNextStep: rawSnapshot.suggestedNextStep || '',
        createdAt: activeSnapshot?.createdAt || new Date().toISOString(),
        ...(activeSnapshot?.reviewDate ? { reviewDate: activeSnapshot.reviewDate } : {}),
        ...(activeSnapshot?.isReviewed !== undefined ? { isReviewed: activeSnapshot.isReviewed } : {}),
        ...(activeSnapshot?.reviewedAt ? { reviewedAt: activeSnapshot.reviewedAt } : {}),
        ...(activeSnapshot?.reflectionNotes ? { reflectionNotes: activeSnapshot.reflectionNotes } : {}),
      };

      setActiveSnapshot(newSnapshot);
      await onSaveSnapshot(newSnapshot);

      const updatedConv: Conversation = {
        ...conversation,
        title: newSnapshot.title,
        snapshotId: newSnapshot.id,
        snapshot: newSnapshot,
        updatedAt: new Date().toISOString(),
      };
      setTitle(newSnapshot.title);
      await onSaveConversation(updatedConv, messages);

      setShowSnapshotModal(true);
    } catch (err: any) {
      console.error('Snapshot error:', err);
      setErrorBanner(err.message || 'Failed to synthesize snapshot. Please try again.');
    } finally {
      setIsGeneratingSnapshot(false);
    }
  };

  const getModeBadge = () => {
    switch (conversation.mode) {
      case 'idea':
        return {
          label: 'Idea Mode',
          cls: 'bg-emerald-100 text-emerald-700',
        };
      case 'reflection':
        return {
          label: 'Reflection Mode',
          cls: 'bg-violet-100 text-violet-700',
        };
      default:
        return {
          label: 'Decision Mode',
          cls: 'bg-amber-100 text-amber-700',
        };
    }
  };

  const modeBadge = getModeBadge();

  const starterPrompts = {
    decision: [
      "I'm deciding between accepting a new job offer or staying in my current role.",
      "What are the main differences and trade-offs between an LLC and a C-Corp?",
      "How do I decide between paying off debt vs investing in index funds?",
    ],
    idea: [
      "I have an idea for an AI micro-SaaS. What is the best way to validate it?",
      "What are the most popular tech stacks for web applications in 2026?",
      "Help me brainstorm 3 unique features for a developer productivity tool.",
    ],
    reflection: [
      "I want to reflect on why I feel overwhelmed despite achieving recent goals.",
      "How can I build sustainable daily focus habits without burning out?",
      "Reviewing the outcome of a major decision I made 6 months ago.",
    ],
  }[conversation.mode];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#F1F5F9]">
      {/* Sleek Header Bar from Design Theme */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
        <div className="flex items-center gap-3 text-sm font-medium">
          <button
            id="chat-back-btn"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Conversations</span>
          </button>
          <span className="text-slate-300">/</span>

          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-md border border-slate-300 px-2 py-0.5 text-xs font-semibold text-slate-800 focus:outline-hidden"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingTitle(false);
                }}
              />
              <button
                onClick={() => setIsEditingTitle(false)}
                className="p-1 text-slate-500 hover:text-slate-900"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className="group flex items-center gap-1.5 cursor-pointer"
              title="Click to rename"
            >
              <span className="text-slate-700 italic truncate max-w-[200px] sm:max-w-xs font-medium">
                {title}
              </span>
              <Edit2 className="h-3 w-3 text-slate-400 group-hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>

        {/* Right Badges & Actions */}
        <div className="flex items-center gap-2.5">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${modeBadge.cls}`}>
            {modeBadge.label}
          </span>

          {activeSnapshot && (
            <button
              id="view-existing-snapshot-btn"
              onClick={() => setShowSnapshotModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <FileCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span>Snapshot</span>
            </button>
          )}

          <button
            id="create-my-snapshot-btn"
            onClick={handleCreateSnapshot}
            disabled={isGeneratingSnapshot || messages.length < 2}
            className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
            <span>
              {isGeneratingSnapshot
                ? 'Synthesizing...'
                : activeSnapshot
                ? 'Update Snapshot'
                : 'Create Snapshot'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Section: Chat area + optional desktop sidebar */}
      <section className="flex-1 p-4 sm:p-6 lg:p-8 flex gap-6 overflow-hidden max-w-7xl mx-auto w-full">
        {/* Chat Main Card */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
          {/* Socratic banner */}
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-2.5 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span>
                DecideAI answers your questions directly, explores trade-offs, and helps you clarify complex decisions and ideas.
              </span>
            </span>
            {activeSnapshot?.reviewDate && (
              <span className="hidden md:inline-flex items-center gap-1 text-indigo-600 font-semibold text-[11px]">
                <Clock className="h-3 w-3" />
                Check-in: {activeSnapshot.reviewDate}
              </span>
            )}
          </div>

          {/* Error Banner */}
          {errorBanner && (
            <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs text-rose-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                {errorBanner}
              </span>
              <button
                onClick={() => setErrorBanner(null)}
                className="text-rose-500 hover:text-rose-800"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                    You
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-2xs">
                    <Compass className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl max-w-[82%] text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs'
                      : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
                  }`}
                >
                  <div className="markdown-body">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                  <div
                    className={`mt-1.5 text-[10px] ${
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

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 text-sm text-slate-500 flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                    <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span className="text-xs italic text-slate-500">
                    DecideAI is reflecting with you...
                  </span>
                </div>
              </div>
            )}

            {/* Starter Prompts */}
            {messages.length === 1 && (
              <div className="mt-8 pt-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Quick Prompts to Begin
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {starterPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 text-left text-xs text-slate-700 hover:border-indigo-400 hover:bg-white transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <span className="leading-snug font-medium">"{prompt}"</span>
                      <ChevronRight className="h-3.5 w-3.5 self-end text-indigo-500 mt-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sleek Input Composer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative"
            >
              <textarea
                ref={textareaRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Reply to DecideAI... (Shift+Enter for new line)"
                disabled={isLoading}
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white text-sm text-slate-800 placeholder:text-slate-400 resize-none leading-relaxed shadow-2xs"
              />

              <button
                id="chat-send-btn"
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-3 top-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors cursor-pointer"
                title="Send (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Sleek Desktop Sidebar (Snapshot preview & Future Me card) */}
        {activeSnapshot && (
          <aside className="hidden lg:flex w-80 flex-col gap-4 overflow-y-auto">
            {/* Current Snapshot Card */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                  Current Snapshot
                </h2>
                <button
                  onClick={() => setShowSnapshotModal(true)}
                  className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  Full View
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{activeSnapshot.title}</h3>
                  <p className="text-[12px] text-slate-500 mt-1 italic line-clamp-2">
                    {activeSnapshot.whatIAmThinkingAbout}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold uppercase text-indigo-600 mb-1">
                      Key Factors
                    </div>
                    <ul className="text-[12px] text-slate-600 space-y-1">
                      {activeSnapshot.keyFactors?.slice(0, 3).map((f, i) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                  </div>

                  {activeSnapshot.mainTradeOffs && activeSnapshot.mainTradeOffs.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-bold uppercase text-indigo-600 mb-1">
                        Main Trade-off
                      </div>
                      <p className="text-[12px] text-slate-600 leading-snug">
                        {activeSnapshot.mainTradeOffs[0]}
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold uppercase text-indigo-600 mb-1">
                      Suggested Next Step
                    </div>
                    <p className="text-[12px] text-slate-600 leading-snug">
                      {activeSnapshot.suggestedNextStep}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Deep Indigo Future Me Check-in Card */}
            <div className="bg-indigo-900 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <h3 className="text-sm font-bold mb-2 flex items-center gap-2 text-white">
                <Calendar className="w-4 h-4 text-indigo-200" />
                Future Me Check-in
              </h3>
              <p className="text-[12px] text-indigo-200 mb-4 leading-relaxed">
                {activeSnapshot.reviewDate
                  ? `Scheduled for ${activeSnapshot.reviewDate}. We'll remind you to reflect.`
                  : 'Select a date to revisit this thinking session. We will remind you to reflect.'}
              </p>

              <button
                onClick={() => setShowSnapshotModal(true)}
                className="w-full py-2.5 bg-white text-indigo-900 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                {activeSnapshot.reviewDate ? 'Manage Review Date' : 'Set Review Date'}
              </button>
            </div>
          </aside>
        )}
      </section>

      {/* Snapshot Modal */}
      {showSnapshotModal && activeSnapshot && (
        <SnapshotModal
          snapshot={activeSnapshot}
          onClose={() => setShowSnapshotModal(false)}
          onSave={async (updated) => {
            setActiveSnapshot(updated);
            await onSaveSnapshot(updated);
          }}
          onStartCheckIn={(snapshot) => {
            setShowSnapshotModal(false);
            if (onNavigateToCheckIn) {
              onNavigateToCheckIn(snapshot);
            }
          }}
        />
      )}
    </div>
  );
};
