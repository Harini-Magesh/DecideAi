export type ConversationMode = 'decision' | 'idea' | 'reflection';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

export interface DecisionSnapshot {
  id: string;
  userId: string;
  conversationId: string;
  conversationTitle?: string;
  mode: ConversationMode;
  title: string;
  whatIAmThinkingAbout: string;
  optionsConsidered: string[];
  keyFactors: string[];
  mainTradeOffs: string[];
  biggestConcern: string;
  keyInsight: string;
  suggestedNextStep: string;
  createdAt: string;
  reviewDate?: string; // YYYY-MM-DD
  isReviewed?: boolean;
  reviewedAt?: string;
  reflectionNotes?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  mode: ConversationMode;
  createdAt: string;
  updatedAt: string;
  lastMessageSnippet?: string;
  snapshotId?: string;
  snapshot?: DecisionSnapshot;
  messageCount?: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
