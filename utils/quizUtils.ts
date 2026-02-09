import type { QuizQuestion, QuestionType, ShuffledChoice, MedalType } from '@/types/seerahQuiz';

/**
 * Fisher-Yates shuffle — returns a new shuffled array
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Select 3 questions from a pool of 5-6, ensuring type diversity.
 * Tries to pick one of each type (factual, comprehension, significance),
 * then fills remaining from the shuffled pool.
 */
export function selectQuestionsForEvent(
  allQuestions: QuizQuestion[],
  count: number = 3
): QuizQuestion[] {
  const shuffled = shuffle(allQuestions);

  const byType: Record<QuestionType, QuizQuestion[]> = {
    factual: [],
    comprehension: [],
    significance: [],
  };

  for (const q of shuffled) {
    byType[q.type].push(q);
  }

  const selected: QuizQuestion[] = [];
  const usedIds = new Set<string>();

  // Pick one from each type first
  for (const type of ['factual', 'comprehension', 'significance'] as QuestionType[]) {
    if (byType[type].length > 0 && selected.length < count) {
      const q = byType[type][0];
      selected.push(q);
      usedIds.add(q.id);
    }
  }

  // Fill remaining from shuffled pool
  for (const q of shuffled) {
    if (selected.length >= count) break;
    if (!usedIds.has(q.id)) {
      selected.push(q);
      usedIds.add(q.id);
    }
  }

  return shuffle(selected); // Shuffle final order too
}

/**
 * Shuffle the 4 answer choices for a question.
 * Since correctIndex is always 0 in data, we shuffle indices and track the new position.
 */
export function shuffleChoices(question: QuizQuestion): ShuffledChoice {
  const indices = [0, 1, 2, 3];
  const shuffledIndices = shuffle(indices);

  return {
    choices: shuffledIndices.map((i) => question.choices[i]),
    correctIndex: shuffledIndices.indexOf(question.correctIndex),
  };
}

/**
 * Calculate medal type based on overall percentage
 */
export function calculateMedal(percentage: number): MedalType {
  if (percentage >= 90) return 'gold';
  if (percentage >= 80) return 'bronze';
  return 'none';
}

/**
 * Get a letter label for answer index (A, B, C, D)
 */
export function getAnswerLabel(index: number): string {
  return ['A', 'B', 'C', 'D'][index] ?? '';
}

/**
 * Calculate percentage with 1 decimal place
 */
export function calculatePercentage(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 1000) / 10;
}
