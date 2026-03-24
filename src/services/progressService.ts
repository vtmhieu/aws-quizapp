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
