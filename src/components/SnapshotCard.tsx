import React, { useState } from 'react';
import { DecisionSnapshot } from '../types';
import {
  Compass,
  Layers,
  HelpCircle,
  AlertTriangle,
  ArrowRightCircle,
  Calendar,
  CheckCircle,
  Copy,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';

interface SnapshotCardProps {
  snapshot: DecisionSnapshot;
  onCheckInClick?: () => void;
  onEditDateClick?: () => void;
  isCompact?: boolean;
}

export const SnapshotCard: React.FC<SnapshotCardProps> = ({
  snapshot,
  onCheckInClick,
  onEditDateClick,
  isCompact = false,
}) => {
  const [copied, setCopied] = useState(false);

  const getModeBadge = () => {
    switch (snapshot.mode) {
      case 'idea':
        return {
          icon: <Layers className="h-3.5 w-3.5 text-emerald-700" />,
          label: 'Idea Snapshot',
          cls: 'bg-emerald-100 text-emerald-700',
        };
      case 'reflection':
        return {
          icon: <HelpCircle className="h-3.5 w-3.5 text-violet-700" />,
          label: 'Reflection Snapshot',
          cls: 'bg-violet-100 text-violet-700',
        };
      default:
        return {
          icon: <Compass className="h-3.5 w-3.5 text-amber-700" />,
          label: 'Decision Snapshot',
          cls: 'bg-amber-100 text-amber-700',
        };
    }
  };

  const isReviewDue = () => {
    if (!snapshot.reviewDate || snapshot.isReviewed) return false;
    const review = new Date(snapshot.reviewDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return review <= today;
  };

  const handleCopy = () => {
    const text = `
DECISION SNAPSHOT: ${snapshot.title}
Mode: ${snapshot.mode}
Date: ${new Date(snapshot.createdAt).toLocaleDateString()}

WHAT I AM THINKING ABOUT:
${snapshot.whatIAmThinkingAbout}

OPTIONS CONSIDERED:
${snapshot.optionsConsidered?.map((o) => `• ${o}`).join('\n')}

KEY FACTORS:
${snapshot.keyFactors?.map((f) => `• ${f}`).join('\n')}

MAIN TRADE-OFFS:
${snapshot.mainTradeOffs?.map((t) => `• ${t}`).join('\n')}

BIGGEST CONCERN:
${snapshot.biggestConcern}

KEY INSIGHT:
${snapshot.keyInsight}

SUGGESTED NEXT STEP:
${snapshot.suggestedNextStep}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const badge = getModeBadge();

  return (
    <div
      id={`snapshot-card-${snapshot.id}`}
      className="relative rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm transition-all hover:shadow-md hover:border-slate-300 flex flex-col justify-between"
    >
      <div>
        {/* Top Bar: Mode, Date, Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.cls}`}
            >
              {badge.icon}
              {badge.label}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {new Date(snapshot.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              title="Copy snapshot to clipboard"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Title & What I am thinking about */}
        <div className="mt-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug">
            {snapshot.title}
          </h3>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="font-bold text-indigo-600 block mb-0.5 text-[10px] uppercase tracking-wider">
              What I am thinking about:
            </span>
            {snapshot.whatIAmThinkingAbout}
          </p>
        </div>

        {/* Grid: Options & Key Factors */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Options Considered */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1.5">
              Options Considered
            </span>
            <ul className="space-y-1 text-xs text-slate-700">
              {snapshot.optionsConsidered?.map((opt, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span className="leading-snug">{opt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Factors */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1.5">
              Key Factors & Priorities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {snapshot.keyFactors?.map((factor, i) => (
                <span
                  key={i}
                  className="inline-block rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200"
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Trade-Offs */}
        {snapshot.mainTradeOffs && snapshot.mainTradeOffs.length > 0 && (
          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
              Main Trade-Offs
            </span>
            <ul className="space-y-1 text-xs text-slate-700">
              {snapshot.mainTradeOffs.map((trade, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-slate-400 font-bold">⇄</span>
                  <span className="leading-snug">{trade}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Biggest Concern & Key Insight */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Biggest Concern */}
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
            <div className="flex items-center gap-1.5 mb-1 text-rose-800">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Biggest Concern
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              {snapshot.biggestConcern}
            </p>
          </div>

          {/* Key Insight */}
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
            <div className="flex items-center gap-1.5 mb-1 text-amber-800">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Key Insight
              </span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {snapshot.keyInsight}
            </p>
          </div>
        </div>

        {/* Suggested Next Step */}
        <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 flex items-start gap-2.5">
          <ArrowRightCircle className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
              Suggested Next Step
            </span>
            <p className="mt-0.5 text-xs text-slate-800 leading-relaxed font-medium">
              {snapshot.suggestedNextStep}
            </p>
          </div>
        </div>
      </div>

      {/* Future Me Check-In Status Bar */}
      <div className="mt-6 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50 -mx-6 -mb-6 sm:-mx-7 sm:-mb-7 p-4 sm:px-7 rounded-b-2xl">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-500" />
          {snapshot.reviewDate ? (
            <span className="text-xs text-slate-600">
              Review Date:{' '}
              <strong className="text-slate-800 font-semibold">
                {new Date(snapshot.reviewDate + 'T00:00:00').toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </strong>
            </span>
          ) : (
            <span className="text-xs text-slate-500">No review date set</span>
          )}

          {snapshot.isReviewed && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              <CheckCircle className="h-3 w-3" />
              Reflected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onEditDateClick && (
            <button
              onClick={onEditDateClick}
              className="text-xs text-slate-600 hover:text-indigo-600 underline font-medium cursor-pointer"
            >
              {snapshot.reviewDate ? 'Change Date' : 'Set Review Date'}
            </button>
          )}

          {isReviewDue() && onCheckInClick && (
            <button
              onClick={onCheckInClick}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-amber-700 cursor-pointer animate-pulse"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Time to Check In</span>
            </button>
          )}

          {!isReviewDue() && onCheckInClick && (
            <button
              onClick={onCheckInClick}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 cursor-pointer"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{snapshot.isReviewed ? 'Review Again' : 'Check In'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
