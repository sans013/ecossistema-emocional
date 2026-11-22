import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { getFlowerByMood } from '../../domain/catalog/FlowerCatalog';

export interface PdfReportRecord {
  id: string;
  nivelHumor: number;
  contextos: string[];
  pensamento: string | null;
  registradoEm: string;
  mensagemFlor?: string | null;
}

export interface GeneratePdfReportInput {
  nomeUsuario: string;
  emailUsuario: string;
  periodoDias: 7 | 30;
  registros: PdfReportRecord[];
  rotulosHumorCustom?: Record<string, string>;
}

const CONTEXT_LABELS: Record<string, string> = {
  sono: 'Sono',
  estudo: 'Estudo',
  trabalho: 'Trabalho',
  descanso: 'Descanso',
  relacoes: 'Relações',
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function buildEmotionalReportHtml(input: GeneratePdfReportInput): string {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - input.periodoDias);

  const filteredRecords = input.registros.filter((rec) => {
    const parsed = new Date(rec.registradoEm);
    return !Number.isNaN(parsed.getTime()) && parsed >= cutoff;
  });

  const moodCounts = new Map<number, number>();
  const contextCounts = new Map<string, number>();

  for (const rec of filteredRecords) {
    moodCounts.set(rec.nivelHumor, (moodCounts.get(rec.nivelHumor) ?? 0) + 1);
    for (const ctx of rec.contextos) {
      contextCounts.set(ctx, (contextCounts.get(ctx) ?? 0) + 1);
    }
  }

  const moodRows = ([5, 4, 3, 2, 1] as const)
    .map((level) => {
      const flower = getFlowerByMood(level);
      const label = input.rotulosHumorCustom?.[String(level)] || flower.rotuloPadrao;
      const count = moodCounts.get(level) ?? 0;
      const pct =
        filteredRecords.length > 0 ? Math.round((count / filteredRecords.length) * 100) : 0;
      return `
        <tr>
          <td>${escapeHtml(label)}</td>
          <td>${escapeHtml(flower.flor)} (${escapeHtml(flower.clima)})</td>
          <td style="text-align:center;">${count}</td>
          <td style="text-align:right;">${pct}%</td>
        </tr>
      `;
    })
    .join('');

  const topContexts = Array.from(contextCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(
      ([slug, count]) =>
        `<span class="chip">${escapeHtml(CONTEXT_LABELS[slug] ?? slug)}: ${count}</span>`
    )
    .join('');

  const recordsHtml =
    filteredRecords.length > 0
      ? filteredRecords
          .map((rec) => {
            const flower = getFlowerByMood(rec.nivelHumor);
            const label =
              input.rotulosHumorCustom?.[String(rec.nivelHumor)] || flower.rotuloPadrao;
            const contexts =
              rec.contextos.length > 0
                ? rec.contextos.map((c) => CONTEXT_LABELS[c] ?? c).join(', ')
                : 'Sem contextos informados';
            const thoughtBlock = rec.pensamento
              ? `<p class="thought"><strong>Anotação:</strong> ${escapeHtml(rec.pensamento)}</p>`
              : '';
            const flowerMsgBlock = rec.mensagemFlor
              ? `<p class="ai-msg"><strong>Mensagem da flor (${escapeHtml(flower.flor)}):</strong> “${escapeHtml(
                  rec.mensagemFlor
                )}”</p>`
              : '';

            return `
              <div class="record-card">
                <div class="record-header">
                  <strong>${escapeHtml(label)} • ${escapeHtml(flower.flor)} (${escapeHtml(
                    flower.clima
                  )})</strong>
                  <span class="record-date">${escapeHtml(formatDateTime(rec.registradoEm))}</span>
                </div>
                <p class="contexts"><strong>Contextos:</strong> ${escapeHtml(contexts)}</p>
                ${thoughtBlock}
                ${flowerMsgBlock}
              </div>
            `;
          })
          .join('')
      : '<p class="empty">Nenhum registro encontrado neste período.</p>';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Relatório Emocional - Ecossistema Emocional</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #1f2937;
            margin: 28px;
            line-height: 1.45;
          }
          .header {
            border-bottom: 2px solid #3b6e57;
            padding-bottom: 12px;
            margin-bottom: 18px;
          }
          h1 {
            color: #244a39;
            font-size: 22px;
            margin: 0 0 6px 0;
          }
          .meta {
            font-size: 12px;
            color: #4b5563;
            margin: 2px 0;
          }
          .notice {
            background: #eef6f1;
            border-left: 4px solid #3b6e57;
            padding: 10px 12px;
            font-size: 12px;
            color: #244a39;
            margin-bottom: 18px;
          }
          h2 {
            font-size: 16px;
            color: #244a39;
            margin: 18px 0 8px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-bottom: 12px;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 7px 9px;
            text-align: left;
          }
          th {
            background: #f3f7f4;
            color: #1f2937;
          }
          .chip {
            display: inline-block;
            background: #eef2f0;
            color: #244a39;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 12px;
            margin: 3px 6px 3px 0;
          }
          .record-card {
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 10px 12px;
            margin-bottom: 10px;
            page-break-inside: avoid;
          }
          .record-header {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            font-size: 13px;
            margin-bottom: 4px;
          }
          .record-date {
            color: #6b7280;
            font-size: 12px;
          }
          .contexts, .thought, .ai-msg {
            font-size: 12px;
            margin: 4px 0;
          }
          .ai-msg {
            color: #2e5a44;
            background: #f6faf7;
            padding: 6px 8px;
            border-radius: 6px;
          }
          .empty {
            color: #6b7280;
            font-size: 13px;
          }
          .footer {
            margin-top: 24px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            font-size: 11px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Ecossistema Emocional — Relatório de Reflexão</h1>
          <p class="meta"><strong>Titular dos dados:</strong> ${escapeHtml(input.nomeUsuario)} (${escapeHtml(
            input.emailUsuario
          )})</p>
          <p class="meta"><strong>Período analisado:</strong> Últimos ${input.periodoDias} dias • <strong>Total de registros:</strong> ${
            filteredRecords.length
          }</p>
          <p class="meta"><strong>Gerado em:</strong> ${escapeHtml(formatDateTime(now.toISOString()))}</p>
        </div>

        <div class="notice">
          Este documento reúne exclusivamente os registros do usuário autenticado, para fins de autoconhecimento e acompanhamento pessoal. O aplicativo não realiza diagnóstico nem substitui atendimento profissional de saúde mental.
        </div>

        <h2>1. Frequência de estados emocionais e flores</h2>
        <table>
          <thead>
            <tr>
              <th>Estado emocional</th>
              <th>Flor e clima</th>
              <th style="text-align:center;">Registros</th>
              <th style="text-align:right;">Proporção</th>
            </tr>
          </thead>
          <tbody>
            ${moodRows}
          </tbody>
        </table>

        <h2>2. Contextos mais presentes</h2>
        <div>
          ${topContexts || '<p class="empty">Nenhum contexto registrado neste período.</p>'}
        </div>

        <h2>3. Histórico detalhado do período</h2>
        ${recordsHtml}

        <div class="footer">
          Gerado pelo aplicativo Ecossistema Emocional (LGPD — dados pessoais exclusivos do titular autenticado). Em situações de urgência emocional, procure atendimento profissional ou ligue para o CVV (188).
        </div>
      </body>
    </html>
  `;
}

export async function exportEmotionalReportPdf(
  input: GeneratePdfReportInput
): Promise<{ uri?: string; shared: boolean }> {
  const html = buildEmotionalReportHtml(input);

  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return { shared: true };
  }

  const { uri } = await Print.printToFileAsync({ html });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Baixar ou compartilhar relatório em PDF',
      UTI: 'com.adobe.pdf',
    });
    return { uri, shared: true };
  }

  return { uri, shared: false };
}