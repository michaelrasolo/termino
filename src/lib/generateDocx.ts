import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  Packer,
  BorderStyle,
  PageOrientation,
  WidthType,
  VerticalAlign,
  convertInchesToTwip,
  ShadingType,
} from 'docx'
import { saveAs } from 'file-saver'
import type { FormValues } from './schema'

const FONT = 'Calibri'
const SIZE = 20 // half-points = 10pt

const BORDER = {
  top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
}

// A4 landscape content width at 0.5" margins ≈ 15400 twips
const W = {
  document: 1540,    // 10%
  term: 2772,        // 18%
  question: 4158,    // 27%
  suggestion: 2310,  // 15%
  context: 3850,     // 25%
  answer: 770,       // 5%
} as const

const TOTAL = Object.values(W).reduce((a, b) => a + b, 0)

function cell(text: string, width: number, bold = false, header = false): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: BORDER,
    verticalAlign: VerticalAlign.TOP,
    ...(header ? { shading: { type: ShadingType.CLEAR, fill: 'D9D9D9' } } : {}),
    children: [
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text, bold, font: FONT, size: SIZE })],
      }),
    ],
  })
}

export async function generateDocx(values: FormValues): Promise<void> {
  const { trsb, client, dueDate, questions } = values

  const labelW = 2000
  const valueW = TOTAL - labelW

  const infoTable = new Table({
    width: { size: TOTAL, type: WidthType.DXA },
    rows: [
      new TableRow({ children: [cell('TRSB #:', labelW, true), cell(trsb, valueW)] }),
      new TableRow({ children: [cell('Client #:', labelW, true), cell(client, valueW)] }),
      new TableRow({ children: [cell('Due Date:', labelW, true), cell(dueDate, valueW)] }),
      new TableRow({ children: [cell('Contact:', labelW, true), cell('Not applicable', valueW)] }),
    ],
  })

  const questionTable = new Table({
    width: { size: TOTAL, type: WidthType.DXA },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          cell('Document name/page', W.document, true, true),
          cell('Term or expression', W.term, true, true),
          cell('Question', W.question, true, true),
          cell('Suggestion', W.suggestion, true, true),
          cell('Context (full sentence)', W.context, true, true),
          cell('Answer', W.answer, true, true),
        ],
      }),
      ...questions.map((q) =>
        new TableRow({
          children: [
            cell(q.document, W.document),
            cell(q.term, W.term),
            cell(q.question, W.question),
            cell(q.suggestion ?? '', W.suggestion),
            cell(q.context, W.context),
            cell('', W.answer),
          ],
        }),
      ),
    ],
  })

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: {
              top: convertInchesToTwip(0.5),
              right: convertInchesToTwip(0.5),
              bottom: convertInchesToTwip(0.5),
              left: convertInchesToTwip(0.5),
            },
          },
        },
        children: [
          infoTable,
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          questionTable,
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `Termino_${trsb}.docx`)
}
