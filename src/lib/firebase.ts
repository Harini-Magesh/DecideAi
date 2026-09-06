import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Conversation, ChatMessage, DecisionSnapshot } from '../types';

// Initialize Firebase App instance safely
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with specific database ID if present
const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
export const db = getFirestore(app, databaseId);

// Auth helper: Google Sign-in
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Sign-in error:', error);
    throw error;
  }
}

// Auth helper: Sign-out
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Auth state observer
export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Recursively remove `undefined` properties from an object so Firestore setDoc/updateDoc
 * does not throw "Unsupported field value: undefined".
 */
export function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => cleanForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

// ==========================================
// FIRESTORE USER-ISOLATED OPERATIONS
// All paths: /users/{userId}/...
// ==========================================

// Save or update a conversation with messages
export async function saveConversation(
  userId: string,
  conversation: Conversation,
  messages: ChatMessage[]
): Promise<void> {
  if (!userId) throw new Error('User ID is required.');

  // Save conversation document
  const convRef = doc(db, 'users', userId, 'conversations', conversation.id);
  const cleanedConv = cleanForFirestore({
    ...conversation,
    updatedAt: new Date().toISOString(),
  });
  await setDoc(convRef, cleanedConv, { merge: true });

  // Save messages in subcollection: /users/{userId}/conversations/{conversationId}/messages/{msgId}
  for (const msg of messages) {
    const msgRef = doc(db, 'users', userId, 'conversations', conversation.id, 'messages', msg.id);
    await setDoc(msgRef, cleanForFirestore(msg), { merge: true });
  }
}

// Fetch all conversations for a user
export async function fetchUserConversations(userId: string): Promise<Conversation[]> {
  if (!userId) return [];
  try {
    const convsCol = collection(db, 'users', userId, 'conversations');
    const q = query(convsCol, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Conversation, 'id'>),
    }));
  } catch (err) {
    console.error('Error fetching conversations:', err);
    return [];
  }
}

// Fetch messages for a specific conversation
export async function fetchConversationMessages(
  userId: string,
  conversationId: string
): Promise<ChatMessage[]> {
  if (!userId || !conversationId) return [];
  try {
    const msgsCol = collection(db, 'users', userId, 'conversations', conversationId, 'messages');
    const q = query(msgsCol, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<ChatMessage, 'id'>),
    }));
  } catch (err) {
    console.error('Error fetching messages:', err);
    return [];
  }
}

// Delete a conversation
export async function deleteConversationDoc(userId: string, conversationId: string): Promise<void> {
  if (!userId || !conversationId) return;
  const convRef = doc(db, 'users', userId, 'conversations', conversationId);
  await deleteDoc(convRef);
}

// Save or update a Decision Snapshot
export async function saveDecisionSnapshot(
  userId: string,
  snapshot: DecisionSnapshot
): Promise<void> {
  if (!userId) throw new Error('User ID is required.');
  const snapRef = doc(db, 'users', userId, 'snapshots', snapshot.id);
  const cleanedSnapshot = cleanForFirestore(snapshot);
  await setDoc(snapRef, cleanedSnapshot, { merge: true });

  // Also link snapshot to conversation if present
  if (snapshot.conversationId) {
    const convRef = doc(db, 'users', userId, 'conversations', snapshot.conversationId);
    await updateDoc(
      convRef,
      cleanForFirestore({
        snapshotId: snapshot.id,
        snapshot: cleanedSnapshot,
        updatedAt: new Date().toISOString(),
      })
    ).catch(() => {
      // Ignore if conversation doc is not found
    });
  }
}

// Fetch all snapshots for a user
export async function fetchUserSnapshots(userId: string): Promise<DecisionSnapshot[]> {
  if (!userId) return [];
  try {
    const snapsCol = collection(db, 'users', userId, 'snapshots');
    const q = query(snapsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<DecisionSnapshot, 'id'>),
    }));
  } catch (err) {
    console.error('Error fetching snapshots:', err);
    return [];
  }
}

// Update review status or notes for a snapshot
export async function updateSnapshotReview(
  userId: string,
  snapshotId: string,
  updates: Partial<DecisionSnapshot>
): Promise<void> {
  if (!userId || !snapshotId) return;
  const snapRef = doc(db, 'users', userId, 'snapshots', snapshotId);
  await updateDoc(snapRef, cleanForFirestore(updates));
}
