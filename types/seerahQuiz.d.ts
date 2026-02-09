// Seerah Quiz Game Type Definitions

export type QuestionType = 'factual' | 'comprehension' | 'significance';

export interface QuizQuestion {
  id: string;                    // e.g. "e1_q1" (event 1, question 1)
  eventId: number;               // 1-35, matches SeerahEvent.id
  type: QuestionType;
  question: string;              // Question text in French
  choices: string[];             // Exactly 4 choices; index 0 is always correct in data
  correctIndex: number;          // Always 0 in data file; shuffled at runtime
  explanation: string;           // Brief French explanation shown after answering
}

export interface EventQuizData {
  eventId: number;
  eventTitle: string;            // French title for display
  eventYear: string;             // e.g. "571 apr. J.-C."
  questions: QuizQuestion[];     // 5-6 questions per event
}

export interface EventQuizResult {
  eventId: number;
  score: number;                 // 0, 1, 2, or 3
  passed: boolean;               // score >= 2
  answeredQuestionIds: string[];
  answers: Record<string, number>; // questionId -> selectedShuffledIndex
  completedAt: string;           // ISO date string
}

export interface ShuffledChoice {
  choices: string[];
  correctIndex: number;
}

export type MedalType = 'gold' | 'bronze' | 'none';

export interface QuizSessionState {
  eventId: number;
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, number>;
  shuffledChoices: Record<string, ShuffledChoice>;
  correctCount: number;
}
