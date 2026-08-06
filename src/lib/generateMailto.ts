export function generateMailto(client: string, trsb: string, dueDate: string, questionCount: number): string {
  const to = 'termino@trsb.com'
  const subject = `termino requise | ${client} ${trsb} | échéance ${dueDate} | ${questionCount} Question${questionCount > 1 ? 's' : ''}`
  const body =
    'Bonjour,\n\nVoici le fichier contenant mes questions.\n\nMerci et bonne journée,\n\n\nMarie Giacometti\nProfessional Translator EN, DE → FR\n\n'
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
