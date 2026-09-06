/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ChatView } from './components/ChatView';
import { FutureCheckInView } from './components/FutureCheckInView';
import { SnapshotModal } from './components/SnapshotModal';
import {
  UserProfile,
  Conversation,
  ConversationMode,
  ChatMessage,
  DecisionSnapshot,
} from './types';
import {
  subscribeToAuth,
  signInWithGoogle,
  logoutUser,
  fetchUserConversations,
  fetchConversationMessages,
  saveConversation,
  deleteConversationDoc,
  fetchUserSnapshots,
  saveDecisionSnapshot,
} from './lib/firebase';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // App navigation state: 'landing' | 'dashboard' | 'chat' | 'checkin'
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'chat' | 'checkin'>('landing');

  // Active items
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [snapshots, setSnapshots] = useState<DecisionSnapshot[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [activeCheckInSnapshot, setActiveCheckInSnapshot] = useState<DecisionSnapshot | null>(null);

  // Modal for standalone snapshot viewing
  const [viewingSnapshot, setViewingSnapshot] = useState<DecisionSnapshot | null>(null);

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuth((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
        setCurrentView('dashboard');
      } else {
        setUser(null);
        setCurrentView('landing');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load user data from Firestore whenever user logs in
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setSnapshots([]);
      return;
    }

    const loadUserData = async () => {
      try {
        const [userConvs, userSnaps] = await Promise.all([
          fetchUserConversations(user.uid),
          fetchUserSnapshots(user.uid),
        ]);
        setConversations(userConvs);
        setSnapshots(userSnaps);
      } catch (err) {
        console.error('Error loading user data from Firestore:', err);
      }
    };

    loadUserData();
  }, [user]);

  // Handle Google Sign-In
  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setAuthError(
        err.message?.includes('popup-blocked')
          ? 'Sign-in popup was blocked by browser. Please allow popups for this applet or open in a new tab.'
          : err.message || 'Failed to sign in with Google.'
      );
    }
  };

  // Handle Sign-Out
  const handleSignOut = async () => {
    try {
      await logoutUser();
      setActiveConversation(null);
      setActiveMessages([]);
      setActiveCheckInSnapshot(null);
      setCurrentView('landing');
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  // Create & Start new thinking conversation
  const handleStartThinking = async (mode: ConversationMode) => {
    if (!user) {
      handleSignIn();
      return;
    }

    const defaultTitle =
      mode === 'decision'
        ? 'New Decision'
        : mode === 'idea'
        ? 'New Idea'
        : 'New Reflection';

    const newConv: Conversation = {
      id: 'conv-' + Date.now(),
      userId: user.uid,
      title: defaultTitle,
      mode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    };

    setActiveConversation(newConv);
    setActiveMessages([]);
    setCurrentView('chat');
  };

  // Open existing conversation
  const handleOpenConversation = async (conv: Conversation) => {
    if (!user) return;
    setActiveConversation(conv);
    try {
      const msgs = await fetchConversationMessages(user.uid, conv.id);
      setActiveMessages(msgs);
    } catch (err) {
      console.error('Error loading conversation messages:', err);
      setActiveMessages([]);
    }
    setCurrentView('chat');
  };

  // Save conversation updates to Firestore & state
  const handleSaveConversation = async (
    updatedConv: Conversation,
    messages: ChatMessage[]
  ) => {
    if (!user) return;
    setActiveConversation(updatedConv);
    setActiveMessages(messages);

    // Update in list
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === updatedConv.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedConv;
        return copy;
      }
      return [updatedConv, ...prev];
    });

    await saveConversation(user.uid, updatedConv, messages);
  };

  // Delete conversation
  const handleDeleteConversation = async (convId: string) => {
    if (!user) return;
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    await deleteConversationDoc(user.uid, convId);
  };

  // Save snapshot to Firestore & state
  const handleSaveSnapshot = async (snapshot: DecisionSnapshot) => {
    if (!user) return;
    setSnapshots((prev) => {
      const idx = prev.findIndex((s) => s.id === snapshot.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = snapshot;
        return copy;
      }
      return [snapshot, ...prev];
    });

    await saveDecisionSnapshot(user.uid, snapshot);
  };

  // Launch Future Me Check-In view
  const handleOpenCheckIn = (snapshot: DecisionSnapshot) => {
    setActiveCheckInSnapshot(snapshot);
    setCurrentView('checkin');
  };

  // Calculate due check-ins count
  const todayStr = new Date().toISOString().split('T')[0];
  const dueCheckinsCount = snapshots.filter(
    (s) => s.reviewDate && !s.isReviewed && s.reviewDate <= todayStr
  ).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Navbar */}
      <Navbar
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        dueCheckinsCount={dueCheckinsCount}
        onOpenDueCheckins={() => {
          if (dueCheckinsCount > 0) {
            const firstDue = snapshots.find(
              (s) => s.reviewDate && !s.isReviewed && s.reviewDate <= todayStr
            );
            if (firstDue) handleOpenCheckIn(firstDue);
          }
        }}
      />

      {/* Auth error banner */}
      {authError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
            <span>{authError}</span>
          </div>
          <button
            onClick={() => setAuthError(null)}
            className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main View Router */}
      <main>
        {currentView === 'landing' && (
          <LandingPage
            onGetStarted={() => {
              if (user) {
                setCurrentView('dashboard');
              } else {
                handleSignIn();
              }
            }}
            isLoading={authLoading}
          />
        )}

        {currentView === 'dashboard' && user && (
          <Dashboard
            user={user}
            conversations={conversations}
            snapshots={snapshots}
            onStartThinking={handleStartThinking}
            onOpenConversation={handleOpenConversation}
            onDeleteConversation={handleDeleteConversation}
            onOpenCheckIn={handleOpenCheckIn}
            onViewSnapshot={(snap) => setViewingSnapshot(snap)}
          />
        )}

        {currentView === 'chat' && activeConversation && user && (
          <ChatView
            conversation={activeConversation}
            initialMessages={activeMessages}
            onBack={() => {
              setCurrentView('dashboard');
              setActiveConversation(null);
            }}
            onSaveConversation={handleSaveConversation}
            onSaveSnapshot={handleSaveSnapshot}
            onNavigateToCheckIn={handleOpenCheckIn}
          />
        )}

        {currentView === 'checkin' && activeCheckInSnapshot && user && (
          <FutureCheckInView
            snapshot={activeCheckInSnapshot}
            onBack={() => {
              setCurrentView('dashboard');
              setActiveCheckInSnapshot(null);
            }}
            onSaveReflection={async (updated) => {
              await handleSaveSnapshot(updated);
              setActiveCheckInSnapshot(updated);
            }}
          />
        )}
      </main>

      {/* Standalone Viewing Snapshot Modal */}
      {viewingSnapshot && (
        <SnapshotModal
          snapshot={viewingSnapshot}
          onClose={() => setViewingSnapshot(null)}
          onSave={async (updated) => {
            await handleSaveSnapshot(updated);
            setViewingSnapshot(updated);
          }}
          onStartCheckIn={(snap) => {
            setViewingSnapshot(null);
            handleOpenCheckIn(snap);
          }}
        />
      )}
    </div>
  );
}
