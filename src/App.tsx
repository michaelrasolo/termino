import { useEffect, useState, type ChangeEvent } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, FileDown, Mail, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormSchema, type FormValues } from '@/lib/schema'
import { parseProjet } from '@/lib/parseProjet'
import { generateDocx } from '@/lib/generateDocx'
import { generateMailto } from '@/lib/generateMailto'

const EMPTY_QUESTION = {
  document: '',
  term: '',
  question: '',
  suggestion: '',
  context: ''
}

const QUESTION_OPTIONS = [
  "Titre de poste/nom d'équipe à valider.",
  'Please provide French from the system, if available in French. If possible, please send English and French screenshots.',
  'Please confirm what this acronym stands for here.',
  'Please confirm what these acronyms stand for here.',
  'Please clarify what this refers to exactly.',
  'Does this document exist in French? If so, please provide French name and link, if any. If not, should it be left as is or translated freely?',
  'Is there already an official French name for this? If so, please provide it. If not, should it be left as is or translated freely?',
  'Is this available in French? If so, please provide French path.',
  'This sentence is incomplete, please confirm how it should read.',
  'This sentence seems incomplete, please confirm if it should read differently or clarify its meaning.',
  "Is this meant to read 'x'?",
  "Is 'x' meant to read 'y'?"
] as const

const TEXTAREA =
  'w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-sm shadow-xs resize-y min-h-[72px] outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground'

const SELECT =
  'termino-select h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer dark:bg-input/30'

export default function App() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialDark = stored ? stored === 'dark' : prefersDark

    setIsDark(initialDark)
    document.documentElement.classList.toggle('dark', initialDark)
  }, [])

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      projet: '',
      trsb: '',
      client: '',
      dueDate: '',
      questions: [EMPTY_QUESTION]
    },
    mode: 'onChange'
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'questions' })

  const projet = watch('projet')
  const trsb = watch('trsb')
  const client = watch('client')
  const dueDate = watch('dueDate')
  const questions = watch('questions')
  const questionCount = fields.length

  const parsedOk = projet ? parseProjet(projet) !== null : null

  function handleProjetChange(value: string) {
    const parsed = parseProjet(value)
    if (parsed) {
      setValue('trsb', parsed.trsb, { shouldValidate: true })
      setValue('client', parsed.client, { shouldValidate: true })
      if (parsed.dueDate) {
        setValue('dueDate', parsed.dueDate, { shouldValidate: true })
      }
    }
  }

  async function onSubmit(values: FormValues) {
    await generateDocx(values)
  }

  function handleEmail() {
    window.location.href = generateMailto(client, trsb, dueDate, questionCount)
  }

  function toggleTheme() {
    setIsDark(prev => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-screen-xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Termino</h1>
            <p className="text-sm text-muted-foreground">Formulaire de questions terminologiques</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={toggleTheme} aria-label="Basculer le thème">
            {isDark ? <Sun className="h-4 w-4 mr-1.5" /> : <Moon className="h-4 w-4 mr-1.5" />}
            {isDark ? 'Mode clair' : 'Mode sombre'}
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* En-tête du document */}
          <section className="rounded-lg border bg-card p-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">En-tête du document</p>

            <div className="space-y-1.5">
              <Label htmlFor="projet">Projet</Label>
              <Input
                id="projet"
                placeholder="Yelda.ai 26-12345-01 | Temps alloué/Time 3:00 | PE | Livraison/Deadline 2026-08-15 0:00 EDT"
                {...register('projet', {
                  onChange: (e: ChangeEvent<HTMLInputElement>) => handleProjetChange(e.target.value)
                })}
              />
              {projet && (
                <p className={`text-xs ${parsedOk ? 'text-green-600' : 'text-amber-600'}`}>
                  {parsedOk
                    ? 'Parsé avec succès — vérifiez les champs ci-dessous'
                    : 'Format non reconnu — remplissez manuellement les champs TRSB, Client et Échéance'}
                </p>
              )}
              {errors.projet && <p className="text-xs text-destructive">{errors.projet.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="trsb">TRSB #</Label>
                <Input id="trsb" placeholder="26-12345-01" {...register('trsb')} />
                {errors.trsb && <p className="text-xs text-destructive">{errors.trsb.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="client">Client #</Label>
                <Input id="client" placeholder="Yelda.ai" {...register('client')} />
                {errors.client && <p className="text-xs text-destructive">{errors.client.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dueDate">Échéance</Label>
                <Input id="dueDate" placeholder="2026-08-15 0:00 EDT" {...register('dueDate')} />
                {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
              </div>
            </div>
          </section>

          {/* Questions */}
          <section className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Questions ({questionCount})
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => append(EMPTY_QUESTION)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Ajouter une question
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="w-[10%] min-w-[100px] text-left px-2 py-2 text-xs font-medium text-muted-foreground">
                      Document/page
                    </th>
                    <th className="w-[18%] min-w-[140px] text-left px-2 py-2 text-xs font-medium text-muted-foreground">
                      Terme ou expression
                    </th>
                    <th className="w-[27%] min-w-[200px] text-left px-2 py-2 text-xs font-medium text-muted-foreground">
                      Question
                    </th>
                    <th className="w-[15%] min-w-[120px] text-left px-2 py-2 text-xs font-medium text-muted-foreground">
                      Suggestion
                    </th>
                    <th className="w-[25%] min-w-[180px] text-left px-2 py-2 text-xs font-medium text-muted-foreground">
                      Contexte (phrase complète)
                    </th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id} className="border-b last:border-0">
                      <td className="px-2 py-2 align-top">
                        <textarea
                          {...register(`questions.${index}.document`)}
                          className={TEXTAREA}
                          rows={3}
                          placeholder="Doc, p. 12"
                        />
                        {errors.questions?.[index]?.document && (
                          <p className="text-xs text-destructive mt-0.5">{errors.questions[index].document?.message}</p>
                        )}
                      </td>
                      <td className="px-2 py-2 align-top">
                        <textarea
                          {...register(`questions.${index}.term`)}
                          className={TEXTAREA}
                          rows={3}
                          placeholder="terme source"
                        />
                        {errors.questions?.[index]?.term && (
                          <p className="text-xs text-destructive mt-0.5">{errors.questions[index].term?.message}</p>
                        )}
                      </td>
                      <td className="px-2 py-2 align-top">
                        <select
                          {...register(`questions.${index}.question`)}
                          className={`${SELECT} ${questions?.[index]?.question ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                          <option value="">— Sélectionner —</option>
                          {QUESTION_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        {errors.questions?.[index]?.question && (
                          <p className="text-xs text-destructive mt-0.5">{errors.questions[index].question?.message}</p>
                        )}
                      </td>
                      <td className="px-2 py-2 align-top">
                        <textarea
                          {...register(`questions.${index}.suggestion`)}
                          className={TEXTAREA}
                          rows={3}
                          placeholder="suggestion (optionnel)"
                        />
                      </td>
                      <td className="px-2 py-2 align-top">
                        <textarea
                          {...register(`questions.${index}.context`)}
                          className={TEXTAREA}
                          rows={3}
                          placeholder="Phrase complète contenant le terme"
                        />
                        {errors.questions?.[index]?.context && (
                          <p className="text-xs text-destructive mt-0.5">{errors.questions[index].context?.message}</p>
                        )}
                      </td>
                      <td className="px-2 py-2 align-top">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          aria-label="Supprimer cette question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={!isValid}>
              <FileDown className="h-4 w-4 mr-2" />
              Générer le DOCX
            </Button>
            <Button type="button" variant="outline" disabled={!trsb || !dueDate} onClick={handleEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Préparer l'email
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
