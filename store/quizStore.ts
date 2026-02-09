import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  EventQuizResult,
  ShuffledChoice,
  MedalType,
  QuizSessionState,
} from '@/types/seerahQuiz';
import { calculateMedal, calculatePercentage } from '@/utils/quizUtils';

const TOTAL_EVENTS = 35;

interface QuizStore {
  // Hydration flag (not persisted — set to true once store is rehydrated from AsyncStorage)
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  // Persistent progress
  currentEventId: number;
  eventResults: Record<number, EventQuizResult>;
  totalCorrect: number;
  totalAnswered: number;
  isQuizComplete: boolean;

  // Session state (persisted so user can leave & resume mid-quiz)
  session: QuizSessionState | null;

  // Actions
  startEventQuiz: (
    eventId: number,
    questionIds: string[],
    shuffledChoices: Record<string, ShuffledChoice>
  ) => void;
  answerQuestion: (questionId: string, selectedIndex: number, isCorrect: boolean) => void;
  nextQuestion: () => void;
  completeEventQuiz: () => void;
  clearSession: () => void;
  resetEventQuiz: (eventId: number) => void;
  resetAllProgress: () => void;
  getOverallPercentage: () => number;
  getMedalType: () => MedalType;
  getCompletedCount: () => number;
  isEventCompleted: (eventId: number) => boolean;
  getEventScore: (eventId: number) => number | null;
  getBestScore: (eventId: number) => number | null;
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      // Hydration
      _hasHydrated: false,
      setHasHydrated: (v: boolean) => set({ _hasHydrated: v }),

      // Initial state
      currentEventId: 1,
      eventResults: {},
      totalCorrect: 0,
      totalAnswered: 0,
      isQuizComplete: false,
      session: null,

      startEventQuiz: (eventId, questionIds, shuffledChoices) => {
        set({
          session: {
            eventId,
            questionIds,
            currentIndex: 0,
            answers: {},
            shuffledChoices,
            correctCount: 0,
          },
        });
      },

      answerQuestion: (questionId, selectedIndex, isCorrect) => {
        const { session } = get();
        if (!session) return;

        set({
          session: {
            ...session,
            answers: { ...session.answers, [questionId]: selectedIndex },
            correctCount: session.correctCount + (isCorrect ? 1 : 0),
          },
        });
      },

      nextQuestion: () => {
        const { session } = get();
        if (!session) return;

        set({
          session: {
            ...session,
            currentIndex: session.currentIndex + 1,
          },
        });
      },

      completeEventQuiz: () => {
        const { session, eventResults, totalCorrect, totalAnswered } = get();
        if (!session) return;

        const score = session.correctCount;
        const passed = score >= 2;
        const result: EventQuizResult = {
          eventId: session.eventId,
          score,
          passed,
          answeredQuestionIds: session.questionIds,
          answers: session.answers,
          completedAt: new Date().toISOString(),
        };

        // Only update total stats if this is first completion or better score
        const prevResult = eventResults[session.eventId];
        const prevScore = prevResult?.score ?? 0;
        const isNewOrBetter = !prevResult || score > prevScore;

        // If retaking and got a better score, update; otherwise keep best
        const bestResult = isNewOrBetter ? result : { ...prevResult!, completedAt: result.completedAt };

        const newTotalCorrect = isNewOrBetter
          ? totalCorrect - prevScore + score
          : totalCorrect;
        const newTotalAnswered = isNewOrBetter
          ? totalAnswered - (prevResult ? 3 : 0) + 3
          : totalAnswered;

        // Check if quiz is complete (all 35 events passed at least once)
        const newResults = { ...eventResults, [session.eventId]: bestResult };
        const completedCount = Object.values(newResults).filter((r) => r.passed).length;
        const isComplete = completedCount >= TOTAL_EVENTS;

        set({
          eventResults: newResults,
          totalCorrect: newTotalCorrect,
          totalAnswered: newTotalAnswered,
          isQuizComplete: isComplete,
          session: null,
        });
      },

      clearSession: () => {
        set({ session: null });
      },

      resetEventQuiz: (eventId) => {
        const { eventResults, totalCorrect, totalAnswered } = get();
        const prevResult = eventResults[eventId];
        if (!prevResult) return;

        const newResults = { ...eventResults };
        delete newResults[eventId];

        set({
          eventResults: newResults,
          totalCorrect: totalCorrect - prevResult.score,
          totalAnswered: totalAnswered - 3,
          session: null,
        });
      },

      resetAllProgress: () => {
        set({
          currentEventId: 1,
          eventResults: {},
          totalCorrect: 0,
          totalAnswered: 0,
          isQuizComplete: false,
          session: null,
        });
      },

      getOverallPercentage: () => {
        const { totalCorrect, totalAnswered } = get();
        return calculatePercentage(totalCorrect, totalAnswered);
      },

      getMedalType: () => {
        const percentage = get().getOverallPercentage();
        return calculateMedal(percentage);
      },

      getCompletedCount: () => {
        const { eventResults } = get();
        return Object.values(eventResults).filter((r) => r.passed).length;
      },

      isEventCompleted: (eventId) => {
        const result = get().eventResults[eventId];
        return result?.passed ?? false;
      },

      getEventScore: (eventId) => {
        const result = get().eventResults[eventId];
        return result?.score ?? null;
      },

      getBestScore: (eventId) => {
        const result = get().eventResults[eventId];
        return result?.score ?? null;
      },
    }),
    {
      name: 'ask-ansar-seerah-quiz',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentEventId: state.currentEventId,
        eventResults: state.eventResults,
        totalCorrect: state.totalCorrect,
        totalAnswered: state.totalAnswered,
        isQuizComplete: state.isQuizComplete,
        session: state.session,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
