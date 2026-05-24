import type { Question } from '@/types/exam'

/**
 * Performs stratified random sampling on questions
 * Ensures proportional representation from each category
 */
export function stratifiedRandomSample(
  questions: Question[],
  sampleSize: number
): Question[] {
  // Group questions by category
  const categories = new Map<string, Question[]>()
  
  for (const q of questions) {
    const existing = categories.get(q.category) || []
    existing.push(q)
    categories.set(q.category, existing)
  }

  const totalQuestions = questions.length
  const sampledQuestions: Question[] = []
  let remaining = sampleSize

  // Calculate proportional allocation for each category
  const categoryAllocations: { category: string; count: number; questions: Question[] }[] = []
  
  for (const [category, categoryQuestions] of categories) {
    const proportion = categoryQuestions.length / totalQuestions
    const allocation = Math.floor(proportion * sampleSize)
    categoryAllocations.push({
      category,
      count: allocation,
      questions: categoryQuestions
    })
    remaining -= allocation
  }

  // Distribute remaining slots based on largest remainder method
  const remainders = categoryAllocations.map((cat, index) => ({
    index,
    remainder: (cat.questions.length / totalQuestions) * sampleSize - cat.count
  }))
  
  remainders.sort((a, b) => b.remainder - a.remainder)
  
  for (let i = 0; i < remaining && i < remainders.length; i++) {
    categoryAllocations[remainders[i].index].count++
  }

  // Sample from each category
  for (const { count, questions: categoryQuestions } of categoryAllocations) {
    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5)
    sampledQuestions.push(...shuffled.slice(0, count))
  }

  // Shuffle final selection to randomize order
  return sampledQuestions.sort(() => Math.random() - 0.5)
}

/**
 * Get category distribution summary
 */
export function getCategoryDistribution(questions: Question[]): Map<string, number> {
  const distribution = new Map<string, number>()
  
  for (const q of questions) {
    distribution.set(q.category, (distribution.get(q.category) || 0) + 1)
  }
  
  return distribution
}
