import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { QuizHistoryEntry } from '../types';

export async function saveQuizResult(
  userId: string,
  result: Omit<QuizHistoryEntry, 'id' | 'date'>
): Promise<void> {
  const colRef = collection(db, 'users', userId, 'quizHistory');
  await addDoc(colRef, {
    ...result,
    date: serverTimestamp(),
  });
}

export async function getQuizHistory(
  userId: string,
  maxResults = 20
): Promise<QuizHistoryEntry[]> {
  const colRef = collection(db, 'users', userId, 'quizHistory');
  const q = query(colRef, orderBy('date', 'desc'), limit(maxResults));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      totalQuestions: data.totalQuestions,
      correct: data.correct,
      incorrect: data.incorrect,
      percentage: data.percentage,
      domain: data.domain || null,
      date: data.date?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  });
}

export async function saveIncorrectQuestions(userId: string | null, questionIds: number[]): Promise<void> {
  if (!questionIds || questionIds.length === 0) return;
  const storageKey = userId ? `mistakes_${userId}` : 'mistakes_guest';
  try {
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updated = Array.from(new Set([...existing, ...questionIds]));
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to save mistakes to localStorage", e);
  }
}

export async function removeCorrectedQuestions(userId: string | null, questionIds: number[]): Promise<void> {
  if (!questionIds || questionIds.length === 0) return;
  const storageKey = userId ? `mistakes_${userId}` : 'mistakes_guest';
  try {
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updated = existing.filter((id: number) => !questionIds.includes(id));
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to remove mistakes from localStorage", e);
  }
}

export async function getIncorrectQuestionIds(userId: string | null): Promise<number[]> {
  const storageKey = userId ? `mistakes_${userId}` : 'mistakes_guest';
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch (e) {
    console.warn("Failed to read mistakes from localStorage", e);
    return [];
  }
}
