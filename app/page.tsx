'use client'

import { useState, useCallback } from 'react'
import { BookOpen, Award, FileText, Users } from 'lucide-react'
import { CSVUploader } from '@/components/csv-uploader'
import { ExamEngine } from '@/components/exam-engine'
import { ExamResults } from '@/components/exam-results'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { stratifiedRandomSample, getCategoryDistribution } from '@/lib/stratified-sampling'
import type { Question, ExamResult } from '@/types/exam'

type AppState = 'upload' | 'ready' | 'exam' | 'results'

const EXAM_QUESTIONS = 100

export default function CertikaApp() {
  const [state, setState] = useState<AppState>('upload')
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [examQuestions, setExamQuestions] = useState<Question[]>([])
  const [result, setResult] = useState<ExamResult | null>(null)

  const handleQuestionsLoaded = useCallback((questions: Question[]) => {
    setAllQuestions(questions)
    setState('ready')
  }, [])

  const startExam = useCallback(() => {
    const sampled = stratifiedRandomSample(allQuestions, EXAM_QUESTIONS)
    setExamQuestions(sampled)
    setState('exam')
  }, [allQuestions])

  const handleExamComplete = useCallback((examResult: ExamResult) => {
    setResult(examResult)
    setState('results')
  }, [])

  const handleRetry = useCallback(() => {
    setResult(null)
    setState('ready')
  }, [])

  const handleUploadNew = useCallback(() => {
    setAllQuestions([])
    setExamQuestions([])
    setResult(null)
    setState('upload')
  }, [])

  const categoryDistribution = allQuestions.length > 0 
    ? getCategoryDistribution(allQuestions) 
    : new Map()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Award className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Certika</h1>
              <p className="text-xs text-muted-foreground">RTA® Mock Exam</p>
            </div>
          </div>

          {state !== 'upload' && (
            <Button variant="outline" size="sm" onClick={handleUploadNew}>
              <FileText className="h-4 w-4 mr-2" />
              New Upload
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={`px-4 py-8 mx-auto ${state === 'exam' ? 'max-w-[1400px]' : 'container'}`}>
        {state === 'upload' && (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <Badge variant="secondary" className="text-sm px-4 py-1">
                BNSP & LSP-PM Certified
              </Badge>
              <h2 className="text-4xl font-bold tracking-tight text-balance">
                Master Your RTA® Certification
              </h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Practice with stratified random sampling for a realistic exam experience. 
                100 questions, 2 hours, 70% to pass.
              </p>
            </div>

            {/* Upload Section */}
            <CSVUploader onQuestionsLoaded={handleQuestionsLoaded} />

            {/* Features */}
            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              <Card className="bg-card/50">
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Stratified Sampling</h3>
                  <p className="text-sm text-muted-foreground">
                    Questions are proportionally sampled from each category for balanced coverage
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Real Exam Format</h3>
                  <p className="text-sm text-muted-foreground">
                    100 questions with a 2-hour timer, matching the actual RTA® exam
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Detailed Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    See your performance breakdown by category to focus your study
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {state === 'ready' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-emerald-500/10">
                <FileText className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold">Question Bank Loaded!</h2>
              <p className="text-muted-foreground">
                {allQuestions.length} questions across {categoryDistribution.size} categories
              </p>
            </div>

            {/* Category Distribution */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Category Distribution</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(categoryDistribution.entries()).map(([category, count]) => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}: {count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Exam Info */}
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-3 text-center">
                  <div>
                    <p className="text-3xl font-bold text-primary">{EXAM_QUESTIONS}</p>
                    <p className="text-sm text-muted-foreground">Questions</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">120</p>
                    <p className="text-sm text-muted-foreground">Minutes</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">70%</p>
                    <p className="text-sm text-muted-foreground">Pass Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button size="lg" onClick={startExam} className="px-8">
                Start Mock Exam
              </Button>
            </div>
          </div>
        )}

        {state === 'exam' && (
          <ExamEngine 
            questions={examQuestions} 
            onComplete={handleExamComplete}
            examDuration={120}
          />
        )}

        {state === 'results' && result && (
          <ExamResults result={result} onRetry={handleRetry} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container px-4 py-6 mx-auto text-center text-sm text-muted-foreground">
          <p>Certika Mock Exam Platform • Phase 1: Static Exam Engine</p>
          <p className="text-xs mt-1">For RTA® (Regular Technical Analyst) certification prep</p>
        </div>
      </footer>
    </div>
  )
}
