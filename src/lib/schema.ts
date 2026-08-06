import { z } from 'zod'

export const QuestionSchema = z.object({
  document: z.string().min(1, 'Requis'),
  term: z.string().min(1, 'Requis'),
  question: z.string().min(1, 'Requis'),
  suggestion: z.string().optional(),
  context: z.string().min(1, 'Requis'),
})

export const FormSchema = z.object({
  projet: z.string().min(1, 'Requis'),
  trsb: z.string().min(1, 'Requis'),
  client: z.string().min(1, 'Requis'),
  dueDate: z.string().min(1, 'Requis'),
  questions: z.array(QuestionSchema).min(1, 'Au moins une question est requise'),
})

export type FormValues = z.infer<typeof FormSchema>
export type Question = z.infer<typeof QuestionSchema>
