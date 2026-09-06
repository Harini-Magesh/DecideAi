import React from 'react';
import { UserProfile } from '../types';
import { LogOut, Brain, CalendarClock, Shield } from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
  onSignIn: () => void;
  onSignOut: () => void;
  currentView: 'landing' | 'dashboard' | 'chat' | 'checkin';
  onNavigate: (view: 'landing' | 'dashboard') => void;
  dueCheckinsCount?: number;
  onOpenDueCheckins?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSignIn,
  onSignOut,
  currentView,
  onNavigate,
  dueCheckinsCount = 0,
  onOpenDueCheckins,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Brand */}
        <div
          id="nav-brand-logo"
          onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
          className="flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-xs">
            D
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-xl tracking-tight text-slate-800">
              DecideAI
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Platform
            </span>
          </div>
        </div>

        {/* Actions & User State */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {dueCheckinsCount > 0 && (
                <button
                  id="nav-due-checkins-btn"
                  onClick={onOpenDueCheckins}
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-200 cursor-pointer"
                  title="Check-ins due for reflection"
                >
                  <CalendarClock className="h-3.5 w-3.5 text-amber-600" />
                  <span>
                    {dueCheckinsCount} Check-in{dueCheckinsCount > 1 ? 's' : ''} Due
                  </span>
                </button>
              )}

              <button
                id="nav-dashboard-link"
                onClick={() => onNavigate('dashboard')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Brain className="h-4 w-4" />
                <span>Dashboard</span>
              </button>

              {/* User profile info */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                {user.photoURL ? (
                  <img
                    id="user-avatar-img"
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.displayName || 'Alex Morgan'}
                  </span>
                  <span className="text-[11px] text-slate-400 leading-tight truncate max-w-[120px]">
                    {user.email || ''}
                  </span>
                </div>
                <button
                  id="nav-sign-out-btn"
                  onClick={onSignOut}
                  title="Sign Out"
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Shield className="h-3.5 w-3.5 text-indigo-600" />
                <span>Private & Encrypted</span>
              </div>
              <button
                id="nav-signin-google-btn"
                onClick={onSignIn}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] cursor-pointer"
              >
                <span>Sign In with Google</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
