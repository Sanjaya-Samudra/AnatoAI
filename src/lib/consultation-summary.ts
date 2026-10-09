import { VIEW_LABELS, type BodyView } from './anatomy';
import { AI_NOTICE, type ChatMessage, type SymptomDetails } from './chat-policy';

export interface ConsultationSummary {
  part: string;
  region: string;
  created: Date;
  symptoms: SymptomDetails;
  userQuestions: string[];
  guidance: string[];
  incomplete: boolean;
}

const generatedSymptomPrompt = /Please use these details for your follow-up guidance\.?$/i;

export function consultationSummary(part: string, view: BodyView, symptoms: SymptomDetails, messages: ChatMessage[], incomplete = false, created = new Date()): ConsultationSummary {
  return {
    part,
    region: VIEW_LABELS[view],
    created,
    symptoms,
    userQuestions: messages
      .filter(message => message.role === 'user' && !generatedSymptomPrompt.test(message.content.trim()))
      .map(message => message.content.trim())
      .filter(Boolean),
    guidance: messages.filter(message => message.role === 'assistant').map(message => message.content.trim()).filter(Boolean),
    incomplete,
  };
}

function pdfText(value: string) {
  return value
    .replace(/\r/g, '')
    .replace(/```[\s\S]*?```/g, block => block.replace(/```[^\n]*\n?/g, ''))
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '- ')
    .replace(/^[ \t]*\|?[ \t]*:?-{3,}:?[ \t]*(\|[ \t]*:?-{3,}:?[ \t]*)+\|?[ \t]*$/gm, '')
    .replace(/^[ \t]*\|(.+)\|[ \t]*$/gm, (_, row: string) => row.split('|').map(cell => cell.trim()).filter(Boolean).join(' - '))
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function createConsultationPdf(summary: ConsultationSummary) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 52;
  const contentWidth = pageWidth - margin * 2;
  const blue: [number, number, number] = [37, 99, 235];
  const navy: [number, number, number] = [15, 23, 42];
  const slate: [number, number, number] = [71, 85, 105];
  let y = 0;

  const addPage = () => {
    doc.addPage();
    doc.setFillColor(...blue);
    doc.rect(0, 0, pageWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...slate);
    doc.text('AnatoAI Health Conversation Summary - continued', margin, 34);
    y = 62;
  };
  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - 62) addPage();
  };
  const sectionTitle = (title: string) => {
    ensureSpace(34);
    doc.setFillColor(...blue);
    doc.roundedRect(margin, y + 2, 5, 18, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...navy);
    doc.text(title, margin + 16, y + 16);
    y += 32;
  };
  const writeParagraph = (text: string, options: { color?: [number, number, number]; size?: number; indent?: number } = {}) => {
    const clean = pdfText(text);
    if (!clean) return;
    const indent = options.indent ?? 0;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(options.size ?? 10.5);
    doc.setTextColor(...(options.color ?? navy));
    const lines = doc.splitTextToSize(clean, contentWidth - indent);
    for (const line of lines) {
      ensureSpace(16);
      doc.text(line, margin + indent, y);
      y += 15;
    }
    y += 7;
  };
  const detailCard = (label: string, value: string, x: number, width: number) => {
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(x, y, width, 55, 9, 9, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(29, 78, 216);
    doc.text(label.toUpperCase(), x + 12, y + 18);
    doc.setFontSize(11);
    doc.setTextColor(...navy);
    doc.text(pdfText(value), x + 12, y + 39, { maxWidth: width - 24 });
  };

  doc.setFillColor(...blue);
  doc.rect(0, 0, pageWidth, 116, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(25);
  doc.text('AnatoAI', margin, 49);
  doc.setFontSize(15);
  doc.text('Health Conversation Summary', margin, 76);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Prepared ${summary.created.toLocaleString()}`, margin, 98);

  y = 144;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 72, 12, 12, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...slate);
  doc.text('SELECTED LOCATION', margin + 18, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...navy);
  doc.text(pdfText(summary.part), margin + 18, y + 47, { maxWidth: contentWidth - 36 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...blue);
  doc.text(pdfText(summary.region), margin + 18, y + 63);
  y += 98;

  sectionTitle('Details you provided');
  const gap = 10;
  const cardWidth = (contentWidth - gap * 2) / 3;
  detailCard('Pain severity', summary.symptoms.severity === undefined ? 'Not provided' : `${summary.symptoms.severity}/10`, margin, cardWidth);
  detailCard('Duration', summary.symptoms.duration || 'Not provided', margin + cardWidth + gap, cardWidth);
  detailCard('Description', summary.symptoms.quality || 'Not provided', margin + (cardWidth + gap) * 2, cardWidth);
  y += 78;

  if (summary.userQuestions.length) {
    sectionTitle('Your questions and notes');
    summary.userQuestions.forEach((question, index) => {
      ensureSpace(28);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...blue);
      doc.text(`YOU ${index + 1}`, margin, y);
      y += 17;
      writeParagraph(question, { indent: 10 });
    });
  }

  sectionTitle('AI guidance');
  if (summary.incomplete) {
    doc.setFillColor(255, 247, 237);
    doc.setDrawColor(253, 186, 116);
    doc.roundedRect(margin, y, contentWidth, 38, 8, 8, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(154, 52, 18);
    doc.text('The latest response was interrupted and may be incomplete.', margin + 12, y + 23);
    y += 54;
  }
  summary.guidance.forEach((answer, index) => {
    ensureSpace(100);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...blue);
    doc.text(`ANATOAI ${index + 1}`, margin, y);
    y += 17;
    writeParagraph(answer, { indent: 10 });
  });

  ensureSpace(94);
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(147, 197, 253);
  doc.roundedRect(margin, y, contentWidth, 74, 10, 10, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 64, 175);
  doc.text('Please remember', margin + 14, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const noticeLines = doc.splitTextToSize(pdfText(AI_NOTICE), contentWidth - 28);
  doc.text(noticeLines, margin + 14, y + 37);

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 42, pageWidth - margin, pageHeight - 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...slate);
    doc.text('Educational information - not a diagnosis', margin, pageHeight - 25);
    doc.text(`Page ${page} of ${pages}`, pageWidth - margin, pageHeight - 25, { align: 'right' });
  }

  return new Uint8Array(doc.output('arraybuffer'));
}

export async function downloadSummary(summary: ConsultationSummary) {
  const bytes = await createConsultationPdf(summary);
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `AnatoAI-health-summary-${summary.created.toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
