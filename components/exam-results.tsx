'use client'

import { Trophy, Clock, Target, BarChart3, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { ExamResult } from '@/types/exam'

interface ExamResultsProps {
  result: ExamResult
  onRetry: () => void
}

export function ExamResults({ result, onRetry }: ExamResultsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Result Card */}
      <Card className={`
        overflow-hidden
        ${result.passed 
          ? 'bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/30' 
          : 'bg-gradient-to-br from-destructive/10 via-card to-card border-destructive/30'
        }
      `}>
        <CardContent className="pt-8 pb-10">
          <div className="text-center space-y-6">
            <div className={`
              inline-flex p-5 rounded-full
              ${result.passed ? 'bg-emerald-500/20' : 'bg-destructive/20'}
            `}>
              {result.passed 
                ? <Trophy className="h-12 w-12 text-emerald-500" />
                : <Target className="h-12 w-12 text-destructive" />
              }
            </div>

            <div className="space-y-2">
              <Badge 
                variant={result.passed ? 'default' : 'destructive'} 
                className={`text-sm px-4 py-1 ${result.passed ? 'bg-emerald-500' : ''}`}
              >
                {result.passed ? 'PASSED' : 'NOT PASSED'}
              </Badge>
              <h2 className="text-4xl font-bold">
                {result.percentage}%
              </h2>
              <p className="text-lg text-muted-foreground">
                {result.totalCorrect} out of {result.totalQuestions} correct
              </p>
            </div>

            <div className="flex justify-center gap-8 pt-4">
              <div className="text-center">
                <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-semibold">{formatTime(result.timeSpent)}</p>
                <p className="text-sm text-muted-foreground">Time Spent</p>
              </div>
              <div className="text-center">
                <Target className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-semibold">70%</p>
                <p className="text-sm text-muted-foreground">Passing Score</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="h-5 w-5" />
            Performance by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.categoryResults.map((cat) => (
            <div key={cat.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate flex-1 mr-4">
                  {cat.category}
                </span>
                <div className="flex items-center gap-2">
                  {cat.percentage >= 70 
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    : <XCircle className="h-4 w-4 text-destructive" />
                  }
                  <span className={`
                    text-sm font-semibold min-w-[80px] text-right
                    ${cat.percentage >= 70 ? 'text-emerald-500' : 'text-destructive'}
                  `}>
                    {cat.correct}/{cat.total} ({cat.percentage}%)
                  </span>
                </div>
              </div>
              <Progress 
                value={cat.percentage} 
                className={`h-2 ${cat.percentage >= 70 ? '[&>div]:bg-emerald-500' : '[&>div]:bg-destructive'}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary & Actions */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-muted-foreground">
                {result.passed 
                  ? 'Great job! You have passed the mock exam. Keep practicing to improve further.'
                  : 'Keep practicing! Review the categories where you scored below 70% and try again.'
                }
              </p>
            </div>
            <Button onClick={onRetry} size="lg" className="flex-shrink-0">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
