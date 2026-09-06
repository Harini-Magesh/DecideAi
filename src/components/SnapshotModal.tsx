import React, { useState } from 'react';
import { DecisionSnapshot } from '../types';
import { SnapshotCard } from './SnapshotCard';
import { X, Calendar, Check, Clock, Sparkles } from 'lucide-react';

interface SnapshotModalProps {
  snapshot: DecisionSnapshot;
  onClose: () => void;
  onSave: (updatedSnapshot: DecisionSnapshot) => Promise<void>;
  onStartCheckIn?: (snapshot: DecisionSnapshot) => void;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({
  snapshot,
  onClose,
  onSave,
  onStartCheckIn,
}) => {
  const getDatePlusDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(
    snapshot.reviewDate || getDatePlusDays(30)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const presets = [
    { label: '1 Week', date: getDatePlusDays(7) },
    { label: '1 Month', date: getDatePlusDays(30) },
    { label: '3 Months', date: getDatePlusDays(90) },
    { label: '6 Months', date: getDatePlusDays(180) },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated: DecisionSnapshot = {
        ...snapshot,
        reviewDate: selectedDate,
      };
      await onSave(updated);
      setSavedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error saving snapshot review date:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-2xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Decision Snapshot & Review
              </h2>
              <p className="text-xs text-slate-400">
                Synthesized from your DecideAI conversation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Visual Snapshot Card */}
          <SnapshotCard
            snapshot={{ ...snapshot, reviewDate: selectedDate }}
            onEditDateClick={() => {}}
          />

          {/* Sleek Deep Indigo Future Me Check-in Card */}
          <div className="bg-indigo-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-800 text-indigo-200">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Future Me Check-in</span>
                </h3>
                <p className="mt-1 text-xs text-indigo-200 leading-relaxed">
                  Select a date to revisit this thinking session. We will remind you to reflect:
                </p>
                <div className="mt-2 rounded-xl bg-indigo-800/80 p-3 border border-indigo-700 text-xs italic text-indigo-100">
                  "A previous version of you wanted to revisit this decision. What has changed since then?"
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-4 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block mb-2">
                Quick Schedule Horizon
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presets.map((preset) => {
                  const isSelected = selectedDate === preset.date;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setSelectedDate(preset.date)}
                      className={`rounded-lg py-2 px-3 text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white text-indigo-900 shadow-xs'
                          : 'bg-indigo-800 border border-indigo-700 text-indigo-100 hover:bg-indigo-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Date Picker */}
            <div className="flex items-center gap-3 mt-4 pt-2 border-t border-indigo-800">
              <label htmlFor="custom-checkin-date" className="text-xs font-medium text-indigo-200">
                Or pick specific calendar date:
              </label>
              <div className="relative">
                <input
                  id="custom-checkin-date"
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-lg border border-indigo-700 bg-indigo-800 px-3 py-1.5 text-xs text-white shadow-2xs focus:border-white focus:outline-hidden cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {onStartCheckIn && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartCheckIn({ ...snapshot, reviewDate: selectedDate });
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Test Reflection Now
              </button>
            )}

            <button
              id="snapshot-modal-save-btn"
              type="button"
              onClick={handleSave}
              disabled={isSaving || savedSuccess}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-60 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" />
                  <span>Saved!</span>
                </>
              ) : isSaving ? (
                <span>Saving to Firestore...</span>
              ) : (
                <>
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Save Review Date</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
