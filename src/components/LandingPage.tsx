import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Layers,
  HelpCircle,
  Clock,
  Lock,
  Compass,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  isLoading?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, isLoading }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-[#F8FAFC] text-slate-900">
      {/* Hero Section */}
      <section className="relative w-full max-w-5xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
        {/* Sleek badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700 mb-8 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>Socratic AI for Deeper Thinking</span>
        </div>

        {/* Core Headline */}
        <h1 className="font-extrabold text-4xl tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.12] max-w-3xl mx-auto">
          Think Clearly. <br className="hidden sm:inline" />
          Decide Confidently.
        </h1>

        {/* Core Subheading */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Your private AI companion for exploring decisions, ideas, and reflections.
        </p>

        {/* Primary CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            id="landing-get-started-btn"
            onClick={onGetStarted}
            disabled={isLoading}
            className="group flex h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-8 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            <span>{isLoading ? 'Connecting...' : 'Get Started'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-indigo-600" />
            Private Cloud Firestore
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
            Google Authenticated
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            Powered by Gemini
          </span>
        </div>
      </section>

      {/* Philosophy Callout: Organizing Thoughts vs Giving Answers */}
      <section className="w-full border-y border-slate-200 bg-white py-14 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[11px] font-bold tracking-widest text-indigo-600 uppercase">
            A New Paradigm for AI
          </div>
          <p className="mt-3 font-serif text-2xl sm:text-3xl font-semibold text-slate-800 leading-snug">
            "Instead of telling you what to do, DecideAI helps you hear what you already know."
          </p>
          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Most AI tools jump straight to prescriptive answers. DecideAI slows things down: asking
            sharp follow-up questions, teasing apart trade-offs, and mapping your real criteria so
            the final conviction belongs entirely to you.
          </p>
        </div>
      </section>

      {/* 3 Conversation Modes */}
      <section className="w-full max-w-5xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Three Modes of Exploration
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Tailored companions adapted to the nature of your mental challenge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mode 1: Decision */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 mb-5">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Decision Mode</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Weigh tough career, financial, or personal crossroads. Uncover hidden options, test
                reversibility, and balance pros and cons.
              </p>
            </div>
            <ul className="mt-6 space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                Divergent options beyond binary choices
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                Transparent trade-off breakdown
              </li>
            </ul>
          </div>

          {/* Mode 2: Idea */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 mb-5">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Idea Mode</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Take a spark or project concept and stress-test its premise. Clarify who it's for,
                where the friction lies, and what to build first.
              </p>
            </div>
            <ul className="mt-6 space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                Stress-test underlying assumptions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                Identify the first concrete micro-test
              </li>
            </ul>
          </div>

          {/* Mode 3: Reflection */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 border border-violet-100 mb-5">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Reflection Mode</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Process an outcome, deconstruct feelings, or examine personal milestones. Step back
                with compassion to extract lasting wisdom.
              </p>
            </div>
            <ul className="mt-6 space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                Non-judgmental introspection
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                Distill lessons for future choices
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature Showcase: Decision Snapshot & Future Me Check-In */}
      <section className="w-full border-t border-slate-200 bg-[#F1F5F9] py-20 px-6">
        <div className="mx-auto max-w-5xl space-y-16">
          {/* Decision Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-100 text-indigo-700 px-2.5 py-1 text-xs font-semibold mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Structured Output
              </div>
              <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl tracking-tight">
                The Decision Snapshot
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                When you've finished chatting, tap <strong>"Create Snapshot"</strong>. Gemini
                synthesizes your dialogue into a structured artifact containing your core dilemma,
                all options weighed, trade-offs, primary concern, key insight, and suggested next step.
              </p>
            </div>

            {/* Sleek snapshot visual */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                  Current Snapshot
                </span>
                <span className="text-xs text-slate-400 font-mono">Today</span>
              </div>
              <div className="mt-4">
                <h4 className="text-base font-bold text-slate-800">
                  Relocating for Early-Stage Startup vs. Senior Role
                </h4>
                <p className="mt-1 text-xs text-slate-500 italic">
                  Thinking about: Moving to Early-Stage Startup
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-indigo-500 block mb-1">
                    Key Factors
                  </span>
                  <span className="text-slate-600 leading-snug">Creative Autonomy & Equity upside</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-indigo-500 block mb-1">
                    Main Trade-Off
                  </span>
                  <span className="text-slate-600 leading-snug">Guaranteed stability vs. Accelerated growth</span>
                </div>
              </div>
            </div>
          </div>

          {/* Future Me Check-In */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Sleek Deep Indigo Card from Theme HTML */}
            <div className="order-2 md:order-1 bg-indigo-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="flex items-center gap-2 text-indigo-200 mb-2 font-bold text-sm">
                <Calendar className="h-4 w-4" />
                <span>Future Me Check-in</span>
              </div>
              <p className="text-[13px] text-indigo-200 mb-4 leading-relaxed">
                Select a date to revisit this thinking session. DecideAI prompts you when the date arrives:
              </p>
              <div className="rounded-xl bg-indigo-800/80 p-3.5 border border-indigo-700/80 text-xs italic text-indigo-100 mb-4">
                "A previous version of you wanted to revisit this decision. What has changed since then?"
              </div>
              <div className="flex gap-2 mb-4">
                <span className="flex-1 py-1.5 text-center bg-indigo-800 border border-indigo-700 rounded-lg text-xs font-medium text-indigo-200">
                  1 Month
                </span>
                <span className="flex-1 py-1.5 text-center bg-indigo-800 border border-indigo-700 rounded-lg text-xs font-medium text-indigo-200">
                  3 Months
                </span>
                <span className="flex-1 py-1.5 text-center bg-indigo-800 border border-indigo-700 rounded-lg text-xs font-medium text-indigo-200">
                  6 Months
                </span>
              </div>
              <button
                onClick={onGetStarted}
                className="w-full py-2.5 bg-white text-indigo-900 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors cursor-pointer text-center"
              >
                Experience Future Me Check-In
              </button>
            </div>

            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-100 text-indigo-700 px-2.5 py-1 text-xs font-semibold mb-3">
                <Clock className="h-3.5 w-3.5" />
                Signature Capability
              </div>
              <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl tracking-tight">
                Future Me Check-In
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Great decisions aren't made in a vacuum—they evolve. Schedule a review date (in 1
                month, 3 months, or 1 year). When the date arrives, DecideAI brings back your original
                snapshot and guides you through an illuminating reflection on what has changed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="w-full max-w-4xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          Ready to experience mental clarity?
        </h2>
        <p className="mt-3 text-sm text-slate-600 max-w-md mx-auto">
          Start your first private thinking session today with Google Sign-In.
        </p>
        <div className="mt-8">
          <button
            id="landing-bottom-cta-btn"
            onClick={onGetStarted}
            disabled={isLoading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] cursor-pointer"
          >
            <span>Start Thinking with DecideAI</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 DecideAI. Think Clearly. Decide Confidently.</p>
        <p className="mt-1 text-[11px] text-slate-400">
          Powered by Google Gemini & Firebase Firestore with secure user-isolated paths.
        </p>
      </footer>
    </div>
  );
};
