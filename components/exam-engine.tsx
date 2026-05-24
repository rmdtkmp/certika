'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Clock, Flag, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { Question, ExamResult, CategoryResult } from '@/types/exam'

interface ExamEngineProps {
  questions: Question[]
  onComplete: (result: ExamResult) => void
  examDuration?: number // in minutes
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const

export function ExamEngine({ questions, onComplete, examDuration = 120 }: ExamEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [startTime] = useState(Date.now())
  const [timeRemaining, setTimeRemaining] = useState(examDuration * 60)
  const [showConfirm, setShowConfirm] = useState(false)

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswer = useCallback((questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }, [])

  const handleFlag = useCallback(() => {
    setFlagged(prev => {
      const newSet = new Set(prev)
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id)
      } else {
        newSet.add(currentQuestion.id)
      }
      return newSet
    })
  }, [currentQuestion.id])

  const handleSubmit = useCallback(() => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    
    // Calculate results by category
    const categoryMap = new Map<string, { correct: number; total: number }>()
    
    for (const q of questions) {
      const existing = categoryMap.get(q.category) || { correct: 0, total: 0 }
      existing.total++
      if (answers[q.id] === q.correct_answer) {
        existing.correct++
      }
      categoryMap.set(q.category, existing)
    }

    const categoryResults: CategoryResult[] = Array.from(categoryMap.entries()).map(
      ([category, { correct, total }]) => ({
        category,
        correct,
        total,
        percentage: Math.round((correct / total) * 100)
      })
    )

    const totalCorrect = categoryResults.reduce((sum, c) => sum + c.correct, 0)
    const percentage = Math.round((totalCorrect / questions.length) * 100)

    onComplete({
      totalCorrect,
      totalQuestions: questions.length,
      percentage,
      categoryResults: categoryResults.sort((a, b) => b.percentage - a.percentage),
      timeSpent,
      passed: percentage >= 70
    })
  }, [answers, questions, startTime, onComplete])

  const options = [
    { key: 'A', value: currentQuestion.option_a },
    { key: 'B', value: currentQuestion.option_b },
    { key: 'C', value: currentQuestion.option_c },
    { key: 'D', value: currentQuestion.option_d },
  ]

  const getTimeColor = () => {
    if (timeRemaining <= 300) return 'text-destructive'
    if (timeRemaining <= 600) return 'text-amber-500'
    return 'text-muted-foreground'
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header with timer and progress */}
      <Card className="bg-card/80 backdrop-blur">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Clock className={`h-5 w-5 ${getTimeColor()}`} />
              <span className={`font-mono text-lg font-semibold ${getTimeColor()}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>

            <div className="flex-1 max-w-md">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{currentIndex + 1} / {questions.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-medium">
                {answeredCount} answered
              </Badge>
              {flagged.size > 0 && (
                <Badge variant="outline" className="font-medium text-amber-500 border-amber-500/50">
                  {flagged.size} flagged
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="min-h-[500px] flex flex-col">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {currentQuestion.category}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFlag}
              className={flagged.has(currentQuestion.id) ? 'text-amber-500' : ''}
            >
              <Flag className="h-4 w-4 mr-1" />
              {flagged.has(currentQuestion.id) ? 'Flagged' : 'Flag'}
            </Button>
          </div>
          
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentIndex + 1}
            </span>
            <p className="text-lg leading-relaxed">{currentQuestion.question_text}</p>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          <div className="grid gap-3">
            {options.map(({ key, value }) => {
              const isSelected = answers[currentQuestion.id] === key
              return (
                <button
                  key={key}
                  onClick={() => handleAnswer(currentQuestion.id, key)}
                  className={`
                    w-full p-4 rounded-xl border-2 text-left transition-all duration-200
                    hover:border-primary/50 hover:bg-primary/5
                    ${isSelected 
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                      : 'border-border bg-card'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className={`
                      flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                      font-semibold text-sm transition-colors
                      ${isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      {key}
                    </span>
                    <span className="pt-1">{value}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>

        <CardFooter className="border-t bg-muted/30 justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentIndex === questions.length - 1 ? (
              <Button onClick={() => setShowConfirm(true)} className="bg-primary">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Submit Exam
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Question Navigator */}
      <Card>
        <CardContent className="py-4">
          <p className="text-sm font-medium text-muted-foreground mb-3">Question Navigator</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined
              const isFlagged = flagged.has(q.id)
              const isCurrent = idx === currentIndex
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`
                    w-10 h-10 rounded-lg text-sm font-medium transition-all
                    ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}
                    ${isAnswered 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                    ${isFlagged ? 'ring-2 ring-amber-500 ring-offset-1' : ''}
                  `}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="text-xl font-semibold">Submit Exam?</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You have answered <strong>{answeredCount}</strong> out of <strong>{questions.length}</strong> questions.
              </p>
              {answeredCount < questions.length && (
                <p className="text-amber-500 text-sm">
                  ⚠️ You have {questions.length - answeredCount} unanswered questions.
                </p>
              )}
              {flagged.size > 0 && (
                <p className="text-amber-500 text-sm">
                  ⚠️ You have {flagged.size} flagged questions for review.
                </p>
              )}
            </CardContent>
            <CardFooter className="gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Continue Review
              </Button>
              <Button onClick={handleSubmit}>
                Submit Exam
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
