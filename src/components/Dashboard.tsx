import React, { useState } from 'react';
import {
  Conversation,
  ConversationMode,
  DecisionSnapshot,
  UserProfile,
} from '../types';
import { SnapshotCard } from './SnapshotCard';
import {
  Plus,
  Compass,
  Layers,
  HelpCircle,
  Clock,
  Sparkles,
  Calendar,
  ArrowRight,
  Trash2,
  CheckCircle2,
  FileCheck,
  Search,
  ChevronRight,
} from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  conversations: Conversation[];
  snapshots: DecisionSnapshot[];
  onStartThinking: (mode: ConversationMode) => void;
  onOpenConversation: (conv: Conversation) => void;
  onDeleteConversation: (convId: string) => Promise<void>;
  onOpenCheckIn: (snapshot: DecisionSnapshot) => void;
  onViewSnapshot: (snapshot: DecisionSnapshot) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  conversations,
  snapshots,
  onStartThinking,
  onOpenConversation,
  onDeleteConversation,
  onOpenCheckIn,
  onViewSnapshot,
}) => {
  const [selectedModeModal, setSelectedModeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'conversations' | 'snapshots' | 'checkins'>('conversations');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');

  // Filter due check-ins: reviewDate <= today and !isReviewed
  const todayStr = new Date().toISOString().split('T')[0];
  const dueCheckins = snapshots.filter((snap) => {
    if (!snap.reviewDate || snap.isReviewed) return false;
    return snap.reviewDate <= todayStr;
  });

  const upcomingCheckins = snapshots.filter((snap) => {
    if (!snap.reviewDate) return false;
    return snap.reviewDate > todayStr && !snap.isReviewed;
  });

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = filterMode === 'all' || c.mode === filterMode;
    return matchesSearch && matchesMode;
  });

  const filteredSnapshots = snapshots.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = filterMode === 'all' || s.mode === filterMode;
    return matchesSearch && matchesMode;
  });

  const getModeBadge = (mode: ConversationMode) => {
    switch (mode) {
      case 'idea':
        return {
          icon: <Layers className="h-3.5 w-3.5 text-emerald-700" />,
          label: 'Idea Mode',
          cls: 'bg-emerald-100 text-emerald-700',
        };
      case 'reflection':
        return {
          icon: <HelpCircle className="h-3.5 w-3.5 text-violet-700" />,
          label: 'Reflection Mode',
          cls: 'bg-violet-100 text-violet-700',
        };
      default:
        return {
          icon: <Compass className="h-3.5 w-3.5 text-amber-700" />,
          label: 'Decision Mode',
          cls: 'bg-amber-100 text-amber-700',
        };
    }
  };

  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl bg-[#F8FAFC] px-4 py-8 sm:px-8 sm:py-10">
      {/* 3. Welcome Message & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Private Decision Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
            Welcome back, {user.displayName ? user.displayName.split(' ')[0] : 'Alex'}.
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-xl">
            What would you like to think through today? Explore an upcoming decision, stress-test an idea, or process a personal reflection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="start-thinking-primary-btn"
            onClick={() => setSelectedModeModal(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Start Thinking</span>
          </button>
        </div>
      </div>

      {/* Feature 7 Alert: "Time to Check In" */}
      {dueCheckins.length > 0 && (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Clock className="h-5 w-5 animate-spin-slow text-amber-600" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Time to Check In
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-1">
                  You have {dueCheckins.length} decision{dueCheckins.length > 1 ? 's' : ''} ready to revisit!
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                  A previous version of you scheduled a review for today. Revisit your original snapshot and unpack what has changed since then.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="due-checkin-action-btn"
                onClick={() => onOpenCheckIn(dueCheckins[0])}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <span>Reflect on "{dueCheckins[0].title.slice(0, 24)}..."</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Mode Cards */}
      <div className="mt-8">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          Choose a Thinking Companion
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Decision */}
          <div
            id="start-decision-mode-card"
            onClick={() => onStartThinking('decision')}
            className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                  <Compass className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
                  Start <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Decision Companion
              </h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Break down a complex dilemma. Uncover hidden options, evaluate trade-offs, and challenge assumptions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span>Socratic questioning</span>
              <span>•</span>
              <span>Trade-off matrix</span>
            </div>
          </div>

          {/* Idea */}
          <div
            id="start-idea-mode-card"
            onClick={() => onStartThinking('idea')}
            className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Layers className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
                  Start <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Idea Strategist
              </h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Explore a project or creative spark. Stress-test viability, audience demand, and define the first test.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span>Concept sharpening</span>
              <span>•</span>
              <span>Micro-validation</span>
            </div>
          </div>

          {/* Reflection */}
          <div
            id="start-reflection-mode-card"
            onClick={() => onStartThinking('reflection')}
            className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
                  Start <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Reflection Companion
              </h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Step back to evaluate an outcome, personal transition, or habit. Extract clarity and self-compassion.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span>Retrospective learning</span>
              <span>•</span>
              <span>Values alignment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs: Recent Conversations vs Snapshots & Check-Ins */}
      <div className="mt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'conversations'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Recent Conversations ({conversations.length})
            </button>
            <button
              onClick={() => setActiveTab('snapshots')}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'snapshots'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Decision Snapshots ({snapshots.length})
            </button>
            <button
              onClick={() => setActiveTab('checkins')}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer relative ${
                activeTab === 'checkins'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Future Me Check-Ins ({snapshots.filter((s) => s.reviewDate).length})
              {dueCheckins.length > 0 && (
                <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search thinking sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 rounded-lg border border-slate-200 bg-white pl-8.5 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Modes</option>
              <option value="decision">Decision</option>
              <option value="idea">Idea</option>
              <option value="reflection">Reflection</option>
            </select>
          </div>
        </div>

        {/* TAB 1: RECENT CONVERSATIONS */}
        {activeTab === 'conversations' && (
          <div className="mt-6">
            {filteredConversations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <Compass className="mx-auto h-8 w-8 text-slate-400 mb-3" />
                <h3 className="text-base font-bold text-slate-800">
                  {searchQuery ? 'No matching conversations' : 'No conversations yet'}
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery
                    ? 'Try clearing your search query or filter.'
                    : 'Select one of the three thinking modes above to begin your first private session.'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => onStartThinking('decision')}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Start a Decision Session</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConversations.map((conv) => {
                  const badge = getModeBadge(conv.mode);
                  const formattedDate = new Date(conv.updatedAt || conv.createdAt).toLocaleDateString(
                    undefined,
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }
                  );

                  return (
                    <div
                      key={conv.id}
                      id={`conversation-item-${conv.id}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:px-5 hover:border-slate-300 hover:shadow-xs transition-all"
                    >
                      <div
                        onClick={() => onOpenConversation(conv)}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.cls}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {formattedDate}
                          </span>
                          {conv.snapshotId && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-0.5 text-[10px] font-semibold border border-indigo-100">
                              <FileCheck className="h-3 w-3 text-indigo-600" />
                              Snapshot Created
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {conv.title}
                        </h3>

                        {conv.lastMessageSnippet && (
                          <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                            {conv.lastMessageSnippet}
                          </p>
                        )}
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                        {conv.snapshot && (
                          <button
                            onClick={() => onViewSnapshot(conv.snapshot!)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                            title="View Snapshot"
                          >
                            <FileCheck className="h-3.5 w-3.5 text-slate-500" />
                            <span className="hidden sm:inline">Snapshot</span>
                          </button>
                        )}

                        <button
                          onClick={() => onOpenConversation(conv)}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                        >
                          <span>Continue</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteConversation(conv.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete conversation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DECISION SNAPSHOTS */}
        {activeTab === 'snapshots' && (
          <div className="mt-6">
            {filteredSnapshots.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-slate-400 mb-3" />
                <h3 className="text-base font-bold text-slate-800">
                  No Decision Snapshots created yet
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  During any thinking conversation, click "Create Snapshot" to generate a structured synthesis with key factors, trade-offs, and insights.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSnapshots.map((snap) => (
                  <SnapshotCard
                    key={snap.id}
                    snapshot={snap}
                    onCheckInClick={() => onOpenCheckIn(snap)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FUTURE ME CHECK-INS */}
        {activeTab === 'checkins' && (
          <div className="mt-6 space-y-6">
            {/* Due Now */}
            {dueCheckins.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                    Due for Reflection Now ({dueCheckins.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dueCheckins.map((snap) => (
                    <SnapshotCard
                      key={snap.id}
                      snapshot={snap}
                      onCheckInClick={() => onOpenCheckIn(snap)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcomingCheckins.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Upcoming Scheduled Check-Ins ({upcomingCheckins.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingCheckins.map((snap) => (
                    <SnapshotCard
                      key={snap.id}
                      snapshot={snap}
                      onCheckInClick={() => onOpenCheckIn(snap)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {snapshots.filter((s) => s.isReviewed).length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Completed Past Reflections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {snapshots
                    .filter((s) => s.isReviewed)
                    .map((snap) => (
                      <SnapshotCard
                        key={snap.id}
                        snapshot={snap}
                        onCheckInClick={() => onOpenCheckIn(snap)}
                      />
                    ))}
                </div>
              </div>
            )}

            {snapshots.filter((s) => s.reviewDate).length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <Clock className="mx-auto h-8 w-8 text-slate-400 mb-3" />
                <h3 className="text-base font-bold text-slate-800">
                  No Future Check-Ins Scheduled
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  When you create a Decision Snapshot, set a future review date (in 1 month, 3 months, or 1 year). When the time comes, DecideAI will guide you through what changed!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Start Thinking Modal (Mode Selector) */}
      {selectedModeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <h3 className="text-xl font-bold tracking-tight text-slate-800">
              Select Thinking Mode
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Choose the lens through which DecideAI will explore your thoughts.
            </p>

            <div className="mt-5 space-y-3">
              <button
                onClick={() => {
                  setSelectedModeModal(false);
                  onStartThinking('decision');
                }}
                className="w-full flex items-center gap-3.5 rounded-xl border border-slate-200 p-4 text-left hover:border-indigo-400 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Decision Mode
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Weigh choices, uncover hidden options, map trade-offs, and test reversibility.
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedModeModal(false);
                  onStartThinking('idea');
                }}
                className="w-full flex items-center gap-3.5 rounded-xl border border-slate-200 p-4 text-left hover:border-indigo-400 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Idea Mode
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Deconstruct a concept or project, stress-test assumptions, and isolate the first micro-test.
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedModeModal(false);
                  onStartThinking('reflection');
                }}
                className="w-full flex items-center gap-3.5 rounded-xl border border-slate-200 p-4 text-left hover:border-indigo-400 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Reflection Mode
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Process an outcome, transition, or life milestone with deep compassion and learning.
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedModeModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
