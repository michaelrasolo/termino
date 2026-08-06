export interface ParsedProjet {
  client: string
  trsb: string
  dueDate: string | null
}

const TRSB_REGEX = /\b(\d{2}-\d{5}-\d{2})\b/

export function parseProjet(value: string): ParsedProjet | null {
  if (!value.trim()) return null

  // Take everything before the first "|"
  const beforePipe = value.split('|')[0].trim()

  // Extract TRSB number
  const trsbMatch = beforePipe.match(TRSB_REGEX)
  if (!trsbMatch) return null

  const trsb = trsbMatch[1]
  const client = beforePipe.slice(0, beforePipe.indexOf(trsb)).trim()

  if (!client) return null

  // Try to extract deadline from "Livraison/Deadline XXXX"
  const deadlineMatch = value.match(/Livraison\/Deadline\s+([^|]+)/)
  const dueDate = deadlineMatch ? deadlineMatch[1].trim() : null

  return { client, trsb, dueDate }
}
