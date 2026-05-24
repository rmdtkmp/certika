export interface Question {
  id: number
  category: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

export interface ExamState {
  questions: Question[]
  currentIndex: number
  answers: Record<number, string>
  startTime: number
  isComplete: boolean
}

export interface CategoryResult {
  category: string
  correct: number
  total: number
  percentage: number
}

export interface ExamResult {
  totalCorrect: number
  totalQuestions: number
  percentage: number
  categoryResults: CategoryResult[]
  timeSpent: number
  passed: boolean
}
