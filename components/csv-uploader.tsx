'use client'

import { useState, useCallback } from 'react'
import Papa from 'papaparse'
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Question } from '@/types/exam'

interface CSVUploaderProps {
  onQuestionsLoaded: (questions: Question[]) => void
}

export function CSVUploader({ onQuestionsLoaded }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const parseCSV = useCallback((file: File) => {
    setIsLoading(true)
    setError(null)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const questions: Question[] = results.data.map((row, index) => ({
            id: parseInt(row.id) || index + 1,
            category: row.category?.trim() || 'Uncategorized',
            question_text: row.question_text?.trim() || '',
            option_a: row.option_a?.trim() || '',
            option_b: row.option_b?.trim() || '',
            option_c: row.option_c?.trim() || '',
            option_d: row.option_d?.trim() || '',
            correct_answer: (row.correct_answer?.trim().toUpperCase() || 'A') as 'A' | 'B' | 'C' | 'D',
            explanation: row.explanation?.trim() || ''
          }))

          const validQuestions = questions.filter(
            q => q.question_text && q.option_a && q.option_b && q.option_c && q.option_d
          )

          if (validQuestions.length === 0) {
            setError('No valid questions found in CSV. Please check the format.')
            setIsLoading(false)
            return
          }

          onQuestionsLoaded(validQuestions)
        } catch {
          setError('Failed to parse CSV file. Please check the format.')
        }
        setIsLoading(false)
      },
      error: () => {
        setError('Failed to read CSV file.')
        setIsLoading(false)
      }
    })
  }, [onQuestionsLoaded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      parseCSV(file)
    } else {
      setError('Please upload a CSV file.')
    }
  }, [parseCSV])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      parseCSV(file)
    }
  }, [parseCSV])

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 border-dashed border-muted-foreground/25 bg-card/50">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <FileSpreadsheet className="h-7 w-7 text-primary" />
          Upload Question Bank
        </CardTitle>
        <CardDescription className="text-base">
          Upload your RTA® question bank CSV to start the mock exam
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`
            relative rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200
            ${isDragging 
              ? 'border-primary bg-primary/5 scale-[1.02]' 
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
            }
          `}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className={`
              p-4 rounded-full transition-colors duration-200
              ${isDragging ? 'bg-primary/10' : 'bg-muted'}
            `}>
              <Upload className={`h-10 w-10 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isLoading ? 'Processing...' : 'Drop your CSV file here'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
            </div>

            <Button variant="outline" className="mt-2" disabled={isLoading}>
              Select CSV File
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/25 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <p className="text-sm font-medium mb-2">Expected CSV format:</p>
          <code className="text-xs text-muted-foreground block overflow-x-auto">
            id, category, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation
          </code>
        </div>
      </CardContent>
    </Card>
  )
}
