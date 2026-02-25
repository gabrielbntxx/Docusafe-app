import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import PDFDocument from "pdfkit";

// Force Node.js runtime (required for pdfkit streams)
export const runtime = "nodejs";

// ─── Types ────────────────────────────────────────────────────────────────────

type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
};

type InvoiceData = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  senderName: string;
  senderAddress: string;
  senderCity: string;
  senderSiret?: string;
  senderEmail?: string;
  senderPhone?: string;
  clientName: string;
  clientAddress: string;
  clientCity: string;
  clientEmail?: string;
  items: LineItem[];
  notes?: string;
  paymentTerms?: string;
};

type QuoteData = {
  quoteNumber: string;
  quoteDate: string;
  validUntil: string;
  senderName: string;
  senderAddress: string;
  senderCity: string;
  senderSiret?: string;
  senderEmail?: string;
  senderPhone?: string;
  clientName: string;
  clientAddress: string;
  clientCity: string;
  clientEmail?: string;
  items: LineItem[];
  notes?: string;
};

type ContractData = {
  providerName: string;
  providerAddress: string;
  providerCity: string;
  providerSiret?: string;
  providerEmail?: string;
  clientName: string;
  clientAddress: string;
  clientCity: string;
  clientEmail?: string;
  missionTitle: string;
  missionDescription: string;
  startDate: string;
  endDate: string;
  rate: string;
  rateType: "fixed" | "daily" | "hourly";
  paymentSchedule?: string;
  obligations?: string;
  terminationClause?: string;
};

type PurchaseOrderData = {
  orderNumber: string;
  orderDate: string;
  deliveryDate?: string;
  buyerName: string;
  buyerAddress: string;
  buyerCity: string;
  buyerEmail?: string;
  vendorName: string;
  vendorAddress: string;
  vendorCity: string;
  vendorEmail?: string;
  items: (LineItem & { reference?: string })[];
  deliveryTerms?: string;
  notes?: string;
};

type LetterData = {
  senderName: string;
  senderAddress: string;
  senderCity: string;
  recipientName: string;
  recipientAddress: string;
  recipientCity: string;
  city: string;
  date: string;
  subject: string;
  body: string;
  closing: string;
};

// ─── Generic structured document ─────────────────────────────────────────────

type GenericSection =
  | { type: "text"; title: string; content: string }
  | { type: "keyval"; title: string; pairs: Array<{ label: string; value: string }> }
  | { type: "grid"; title: string; items: Array<{ label: string; value: string }> }
  | { type: "table"; title: string; headers: string[]; rows: string[][] };

type GenericDocData = {
  title: string;
  subtitle: string;
  parties?: Array<{ label: string; lines: string[] }>;
  sections: GenericSection[];
  signatures?: Array<{ label: string }>;
};

type GenerateRequest = {
  type: string;
  data: InvoiceData | QuoteData | ContractData | PurchaseOrderData | LetterData | GenericDocData;
};

// ─── PDF helpers ──────────────────────────────────────────────────────────────

const BLUE = "#2563EB";
const DARK = "#111827";
const GRAY = "#6B7280";
const LIGHT = "#F9FAFB";
const WHITE = "#FFFFFF";
const PAGE_W = 595;
const MARGIN = 50;
const COL_W = PAGE_W - 2 * MARGIN;

function drawHeader(doc: PDFKit.PDFDocument, title: string, sub: string) {
  doc.rect(0, 0, PAGE_W, 90).fill(BLUE);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(26).text(title, MARGIN, 28);
  doc.font("Helvetica").fontSize(10).fillColor("rgba(255,255,255,0.8)").text(sub, MARGIN, 60);
}

function drawFooter(doc: PDFKit.PDFDocument) {
  doc.rect(0, 820, PAGE_W, 22).fill(LIGHT);
  doc.fillColor(GRAY).font("Helvetica").fontSize(7)
    .text("Document généré avec DocuSafe – docusafe.app", MARGIN, 827, { width: COL_W, align: "center" });
}

function twoColumns(
  doc: PDFKit.PDFDocument,
  y: number,
  leftTitle: string,
  leftLines: string[],
  rightTitle: string,
  rightLines: string[]
) {
  const half = COL_W / 2 - 10;
  doc.fillColor(GRAY).font("Helvetica-Bold").fontSize(8)
    .text(leftTitle.toUpperCase(), MARGIN, y);
  doc.fillColor(DARK).font("Helvetica").fontSize(9);
  leftLines.filter(Boolean).forEach((l, i) => doc.text(l, MARGIN, y + 14 + i * 13));

  doc.fillColor(GRAY).font("Helvetica-Bold").fontSize(8)
    .text(rightTitle.toUpperCase(), MARGIN + half + 20, y);
  doc.fillColor(DARK).font("Helvetica").fontSize(9);
  rightLines.filter(Boolean).forEach((l, i) => doc.text(l, MARGIN + half + 20, y + 14 + i * 13));

  return y + 14 + Math.max(leftLines.filter(Boolean).length, rightLines.filter(Boolean).length) * 13 + 16;
}

function drawItemsTable(
  doc: PDFKit.PDFDocument,
  y: number,
  items: LineItem[],
  showVat = true
): { y: number; subtotalHT: number; totalVAT: number } {
  // Header
  doc.rect(MARGIN, y, COL_W, 22).fill(BLUE);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(8);
  doc.text("Description", MARGIN + 6, y + 7);
  doc.text("Qté", MARGIN + 270, y + 7, { width: 40, align: "center" });
  doc.text("P.U. HT", MARGIN + 315, y + 7, { width: 65, align: "right" });
  if (showVat) doc.text("TVA", MARGIN + 385, y + 7, { width: 35, align: "center" });
  doc.text("Total TTC", MARGIN + 425, y + 7, { width: 70, align: "right" });
  y += 22;

  let subtotalHT = 0;
  let totalVAT = 0;

  items.forEach((item, idx) => {
    const ht = item.quantity * item.unitPrice;
    const vat = ht * (item.vatRate / 100);
    const ttc = ht + vat;
    subtotalHT += ht;
    totalVAT += vat;

    doc.rect(MARGIN, y, COL_W, 20).fill(idx % 2 === 0 ? WHITE : LIGHT);
    doc.fillColor(DARK).font("Helvetica").fontSize(8);
    doc.text(item.description || "—", MARGIN + 6, y + 6, { width: 260 });
    doc.text(String(item.quantity), MARGIN + 270, y + 6, { width: 40, align: "center" });
    doc.text(`${item.unitPrice.toFixed(2)} €`, MARGIN + 315, y + 6, { width: 65, align: "right" });
    if (showVat) doc.text(`${item.vatRate}%`, MARGIN + 385, y + 6, { width: 35, align: "center" });
    doc.text(`${ttc.toFixed(2)} €`, MARGIN + 425, y + 6, { width: 70, align: "right" });
    y += 20;
  });

  // Bottom border
  doc.rect(MARGIN, y, COL_W, 1).fill("#E5E7EB");
  y += 1;

  return { y, subtotalHT, totalVAT };
}

function drawTotals(
  doc: PDFKit.PDFDocument,
  y: number,
  subtotalHT: number,
  totalVAT: number
): number {
  const totalTTC = subtotalHT + totalVAT;
  const tx = MARGIN + COL_W - 200;

  y += 8;
  doc.rect(tx, y, 200, 62).fill(LIGHT);
  doc.fillColor(GRAY).font("Helvetica").fontSize(9)
    .text("Sous-total HT", tx + 8, y + 8)
    .text(`${subtotalHT.toFixed(2)} €`, tx + 8, y + 8, { width: 184, align: "right" })
    .text("TVA", tx + 8, y + 24)
    .text(`${totalVAT.toFixed(2)} €`, tx + 8, y + 24, { width: 184, align: "right" });

  doc.rect(tx, y + 44, 200, 26).fill(BLUE);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(10)
    .text("TOTAL TTC", tx + 8, y + 52)
    .text(`${totalTTC.toFixed(2)} €`, tx + 8, y + 52, { width: 184, align: "right" });

  return y + 80;
}

// ─── Document generators ───────────────────────────────────────────────────────

function generateInvoice(doc: PDFKit.PDFDocument, d: InvoiceData) {
  drawHeader(doc, "FACTURE", `N° ${d.invoiceNumber} • ${d.invoiceDate}`);

  // Meta block (top right)
  doc.fillColor(DARK).font("Helvetica-Bold").fontSize(9)
    .text(`Facture n°: ${d.invoiceNumber}`, MARGIN + COL_W - 160, 28, { width: 160, align: "right" });
  doc.font("Helvetica").fillColor(GRAY).fontSize(8)
    .text(`Date: ${d.invoiceDate}`, MARGIN + COL_W - 160, 44, { width: 160, align: "right" })
    .text(`Échéance: ${d.dueDate}`, MARGIN + COL_W - 160, 56, { width: 160, align: "right" });

  let y = 110;
  const leftLines = [d.senderName, d.senderAddress, d.senderCity, d.senderSiret ? `SIRET: ${d.senderSiret}` : "", d.senderEmail || "", d.senderPhone || ""].filter(Boolean);
  const rightLines = [d.clientName, d.clientAddress, d.clientCity, d.clientEmail || ""].filter(Boolean);
  y = twoColumns(doc, y, "De", leftLines, "Facturé à", rightLines);

  y += 10;
  const { y: afterTable, subtotalHT, totalVAT } = drawItemsTable(doc, y, d.items);
  y = drawTotals(doc, afterTable, subtotalHT, totalVAT);

  if (d.notes) {
    y += 10;
    doc.fillColor(GRAY).font("Helvetica-Bold").fontSize(8).text("NOTES", MARGIN, y);
    doc.font("Helvetica").fillColor(DARK).fontSize(9).text(d.notes, MARGIN, y + 12, { width: COL_W });
    y += 12 + doc.heightOfString(d.notes, { width: COL_W });
  }
  if (d.paymentTerms) {
    y += 10;
    doc.fillColor(GRAY).font("Helvetica-Bold").fontSize(8).text("CONDITIONS DE PAIEMENT", MARGIN, y);
    doc.font("Helvetica").fillColor(DARK).fontSize(9).text(d.paymentTerms, MARGIN, y + 12, { width: COL_W });
  }

  drawFooter(doc);
}

function generateQuote(doc: PDFKit.PDFDocument, d: QuoteData) {
  drawHeader(doc, "DEVIS", `N° ${d.quoteNumber} • ${d.quoteDate}`);

  doc.fillColor(DARK).font("Helvetica-Bold").fontSize(9)
    .text(`Devis n°: ${d.quoteNumber}`, MARGIN + COL_W - 160, 28, { width: 160, align: "right" });
  doc.font("Helvetica").fillColor(GRAY).fontSize(8)
    .text(`Date: ${d.quoteDate}`, MARGIN + COL_W - 160, 44, { width: 160, align: "right" })
    .text(`Valable jusqu'au: ${d.validUntil}`, MARGIN + COL_W - 160, 56, { width: 160, align: "right" });

  let y = 110;
  const leftLines = [d.senderName, d.senderAddress, d.senderCity, d.senderSiret ? `SIRET: ${d.senderSiret}` : "", d.senderEmail || "", d.senderPhone || ""].filter(Boolean);
  const rightLines = [d.clientName, d.clientAddress, d.clientCity, d.clientEmail || ""].filter(Boolean);
  y = twoColumns(doc, y, "Prestataire", leftLines, "Client", rightLines);

  y += 10;
  const { y: afterTable, subtotalHT, totalVAT } = drawItemsTable(doc, y, d.items);
  y = drawTotals(doc, afterTable, subtotalHT, totalVAT);

  if (d.notes) {
    y += 10;
    doc.fillColor(GRAY).font("Helvetica-Bold").fontSize(8).text("NOTES", MARGIN, y);
    doc.font("Helvetica").fillColor(DARK).fontSize(9).text(d.notes, MARGIN, y + 12, { width: COL_W });
  }

  // Signature area
  y += 30;
  doc.rect(MARGIN + COL_W - 200, y, 200, 50).stroke("#E5E7EB");
  doc.fillColor(GRAY).fontSize(8).text("Signature client (bon pour accord):", MARGIN + COL_W - 196, y + 4, { width: 192 });

  drawFooter(doc);
}

function generateContract(doc: PDFKit.PDFDocument, d: ContractData) {
  const rateLabel = d.rateType === "fixed" ? "Forfait" : d.rateType === "daily" ? "Tarif journalier" : "Tarif horaire";

  drawHeader(doc, "CONTRAT DE PRESTATION", "de service");

  let y = 110;
  const leftLines = [d.providerName, d.providerAddress, d.providerCity, d.providerSiret ? `SIRET: ${d.providerSiret}` : "", d.providerEmail || ""].filter(Boolean);
  const rightLines = [d.clientName, d.clientAddress, d.clientCity, d.clientEmail || ""].filter(Boolean);
  y = twoColumns(doc, y, "Prestataire", leftLines, "Client", rightLines);

  const article = (title: string, text: string) => {
    if (y > 750) { doc.addPage(); y = 50; }
    doc.rect(MARGIN, y, COL_W, 20).fill(LIGHT);
    doc.fillColor(BLUE).font("Helvetica-Bold").fontSize(9).text(title, MARGIN + 8, y + 6);
    y += 24;
    doc.fillColor(DARK).font("Helvetica").fontSize(9).text(text, MARGIN, y, { width: COL_W });
    y += doc.heightOfString(text, { width: COL_W }) + 16;
  };

  article("Objet de la mission", d.missionTitle + (d.missionDescription ? `\n${d.missionDescription}` : ""));
  article("Durée", `Du ${d.startDate} au ${d.endDate}`);
  article("Rémunération", `${rateLabel} : ${d.rate} €${d.paymentSchedule ? `\n${d.paymentSchedule}` : ""}`);
  if (d.obligations) article("Obligations des parties", d.obligations);
  if (d.terminationClause) article("Résiliation", d.terminationClause);
  else article("Résiliation", "Chaque partie peut résilier le présent contrat avec un préavis de 30 jours par lettre recommandée avec accusé de réception.");

  // Signatures
  if (y > 700) { doc.addPage(); y = 50; }
  y += 20;
  doc.fillColor(DARK).font("Helvetica-Bold").fontSize(9).text("SIGNATURES", MARGIN, y);
  y += 16;
  const sw = (COL_W - 20) / 2;
  doc.rect(MARGIN, y, sw, 60).stroke("#E5E7EB");
  doc.rect(MARGIN + sw + 20, y, sw, 60).stroke("#E5E7EB");
  doc.fillColor(GRAY).font("Helvetica").fontSize(8)
    .text("Le prestataire", MARGIN + 4, y + 4)
    .text("Le client", MARGIN + sw + 24, y + 4);
  doc.text(`Fait le: ${new Date().toLocaleDateString("fr-FR")}`, MARGIN, y + 70, { width: COL_W, align: "right" });

  drawFooter(doc);
}

function generatePurchaseOrder(doc: PDFKit.PDFDocument, d: PurchaseOrderData) {
  drawHeader(doc, "BON DE COMMANDE", `N° ${d.orderNumber} • ${d.orderDate}`);

  doc.fillColor(DARK).font("Helvetica-Bold").fontSize(9)
    .text(`Commande n°: ${d.orderNumber}`, MARGIN + COL_W - 160, 28, { width: 160, align: "right" });
  doc.font("Helvetica").fillColor(GRAY).fontSize(8)
    .text(`Date: ${d.orderDate}`, MARGIN + COL_W - 160, 44, { width: 160, align: "right" });
  if (d.deliveryDate) {
    doc.text(`Livraison souhaitée: ${d.deliveryDate}`, MARGIN + COL_W - 160, 56, { width: 160, align: "right" });
  }

  let y = 110;
  const leftLines = [d.buyerName, d.buyerAddress, d.buyerCity, d.buyerEmail || ""].filter(Boolean);
  const rightLines = [d.vendorName, d.vendorAddress, d.vendorCity, d.vendorEmail || ""].filter(Boolean);
  y = twoColumns(doc, y, "Acheteur", leftLines, "Fournisseur", rightLines);

  y += 10;

  // Items table with reference column
  doc.rect(MARGIN, y, COL_W, 22).fill(BLUE);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(8);
  doc.text("Réf.", MARGIN + 6, y + 7, { width: 60 });
  doc.text("Désignation", MARGIN + 70, y + 7, { width: 200 });
  doc.text("Qté", MARGIN + 275, y + 7, { width: 40, align: "center" });
  doc.text("P.U. HT", MARGIN + 320, y + 7, { width: 65, align: "right" });
  doc.text("Total HT", MARGIN + 390, y + 7, { width: 105, align: "right" });
  y += 22;

  let totalHT = 0;
  d.items.forEach((item, idx) => {
    const ht = item.quantity * item.unitPrice;
    totalHT += ht;
    doc.rect(MARGIN, y, COL_W, 20).fill(idx % 2 === 0 ? WHITE : LIGHT);
    doc.fillColor(DARK).font("Helvetica").fontSize(8);
    doc.text((item as any).reference || "—", MARGIN + 6, y + 6, { width: 60 });
    doc.text(item.description || "—", MARGIN + 70, y + 6, { width: 200 });
    doc.text(String(item.quantity), MARGIN + 275, y + 6, { width: 40, align: "center" });
    doc.text(`${item.unitPrice.toFixed(2)} €`, MARGIN + 320, y + 6, { width: 65, align: "right" });
    doc.text(`${ht.toFixed(2)} €`, MARGIN + 390, y + 6, { width: 105, align: "right" });
    y += 20;
  });

  doc.rect(MARGIN, y, COL_W, 1).fill("#E5E7EB");
  y += 10;

  // Total
  const tx = MARGIN + COL_W - 200;
  doc.rect(tx, y, 200, 26).fill(BLUE);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(10)
    .text("TOTAL HT", tx + 8, y + 8)
    .text(`${totalHT.toFixed(2)} €`, tx + 8, y + 8, { width: 184, align: "right" });
  y += 40;

  if (d.deliveryTerms) {
    doc.fillColor(GRAY).font("Helvetica-Bold").fontSize(8).text("CONDITIONS DE LIVRAISON", MARGIN, y);
    doc.font("Helvetica").fillColor(DARK).fontSize(9).text(d.deliveryTerms, MARGIN, y + 12, { width: COL_W });
    y += 12 + doc.heightOfString(d.deliveryTerms, { width: COL_W }) + 10;
  }
  if (d.notes) {
    doc.fillColor(GRAY).font("Helvetica-Bold").fontSize(8).text("NOTES", MARGIN, y);
    doc.font("Helvetica").fillColor(DARK).fontSize(9).text(d.notes, MARGIN, y + 12, { width: COL_W });
    y += 12 + doc.heightOfString(d.notes, { width: COL_W }) + 10;
  }

  // Signatures
  y += 10;
  doc.rect(MARGIN, y, COL_W, 50).stroke("#E5E7EB");
  doc.fillColor(GRAY).font("Helvetica").fontSize(8)
    .text("Bon pour accord – Signature acheteur:", MARGIN + 4, y + 4);

  drawFooter(doc);
}

function generateLetter(doc: PDFKit.PDFDocument, d: LetterData) {
  // Classic French business letter layout (no colored header)
  let y = 50;

  // Sender top-left
  doc.fillColor(DARK).font("Helvetica-Bold").fontSize(10).text(d.senderName, MARGIN, y);
  doc.font("Helvetica").fontSize(9)
    .text(d.senderAddress, MARGIN, y + 14)
    .text(d.senderCity, MARGIN, y + 27);

  // Recipient top-right
  doc.font("Helvetica-Bold").fontSize(10).text(d.recipientName, PAGE_W - MARGIN - 200, y, { width: 200, align: "right" });
  doc.font("Helvetica").fontSize(9)
    .text(d.recipientAddress, PAGE_W - MARGIN - 200, y + 14, { width: 200, align: "right" })
    .text(d.recipientCity, PAGE_W - MARGIN - 200, y + 27, { width: 200, align: "right" });

  // Place and date
  y += 70;
  doc.text(`${d.city}, le ${d.date}`, MARGIN, y, { width: COL_W, align: "right" });

  // Horizontal rule
  y += 20;
  doc.rect(MARGIN, y, COL_W, 1).fill(BLUE);
  y += 12;

  // Subject
  doc.fillColor(DARK).font("Helvetica-Bold").fontSize(10)
    .text(`Objet : ${d.subject}`, MARGIN, y);
  y += 28;

  // Body
  doc.font("Helvetica").fontSize(10).fillColor(DARK)
    .text(d.body, MARGIN, y, { width: COL_W, lineGap: 4 });
  y += doc.heightOfString(d.body, { width: COL_W, lineGap: 4 }) + 30;

  // Closing
  doc.text(d.closing, MARGIN, y);
  y += 20;

  // Signature area
  y += 40;
  doc.fillColor(DARK).font("Helvetica-Bold").fontSize(9).text(d.senderName, MARGIN, y);
  doc.rect(MARGIN, y + 14, 180, 1).fill("#E5E7EB");

  drawFooter(doc);
}

// ─── Generic structured document renderer ─────────────────────────────────────

function renderSectionBar(doc: PDFKit.PDFDocument, title: string, y: number): number {
  doc.rect(MARGIN, y, COL_W, 20).fill(LIGHT);
  doc.fillColor(BLUE).font("Helvetica-Bold").fontSize(8.5)
    .text(title.toUpperCase(), MARGIN + 8, y + 6);
  return y + 24;
}

function generateStructuredDoc(doc: PDFKit.PDFDocument, d: GenericDocData) {
  drawHeader(doc, d.title, d.subtitle);
  let y = 108;

  // Parties
  if (d.parties && d.parties.length >= 2) {
    y = twoColumns(
      doc, y,
      d.parties[0].label, d.parties[0].lines.filter(Boolean),
      d.parties[1].label, d.parties[1].lines.filter(Boolean)
    );
    y += 10;
  } else if (d.parties && d.parties.length === 1) {
    const p = d.parties[0];
    doc.fillColor(GRAY).font("Helvetica-Bold").fontSize(8).text(p.label.toUpperCase(), MARGIN, y);
    p.lines.filter(Boolean).forEach((l, i) =>
      doc.fillColor(DARK).font("Helvetica").fontSize(9).text(l, MARGIN, y + 14 + i * 13)
    );
    y += 14 + p.lines.filter(Boolean).length * 13 + 16;
  }

  for (const section of d.sections) {
    if (y > 740) { doc.addPage(); y = 50; }
    y = renderSectionBar(doc, section.title, y);

    if (section.type === "text") {
      if (section.content) {
        doc.fillColor(DARK).font("Helvetica").fontSize(9)
          .text(section.content, MARGIN, y, { width: COL_W, lineGap: 2.5 });
        y += doc.heightOfString(section.content, { width: COL_W, lineGap: 2.5 }) + 14;
      }
    } else if (section.type === "keyval") {
      for (const pair of section.pairs) {
        if (!pair.value) continue;
        if (y > 750) { doc.addPage(); y = 50; }
        doc.fillColor(GRAY).font("Helvetica-Bold").fontSize(8.5)
          .text(`${pair.label} :`, MARGIN, y, { width: 180, continued: true });
        doc.fillColor(DARK).font("Helvetica").fontSize(9)
          .text(` ${pair.value}`, { width: COL_W - 185 });
        y += 16;
      }
      y += 4;
    } else if (section.type === "grid") {
      const cellW = (COL_W - 10) / 2;
      let colIndex = 0;
      let rowStart = y;
      section.items.forEach((item, i) => {
        const x = MARGIN + colIndex * (cellW + 10);
        doc.fillColor(GRAY).font("Helvetica-Bold").fontSize(7.5).text(item.label.toUpperCase(), x, rowStart);
        doc.fillColor(DARK).font("Helvetica").fontSize(9).text(item.value || "—", x, rowStart + 10, { width: cellW });
        colIndex++;
        if (colIndex === 2 || i === section.items.length - 1) {
          rowStart += 30;
          colIndex = 0;
        }
      });
      y = rowStart + 6;
    } else if (section.type === "table") {
      const colW2 = COL_W / section.headers.length;
      doc.rect(MARGIN, y, COL_W, 18).fill(BLUE);
      doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(7.5);
      section.headers.forEach((h, i) => doc.text(h, MARGIN + i * colW2 + 4, y + 5, { width: colW2 - 8 }));
      y += 18;
      section.rows.forEach((row, ri) => {
        if (y > 750) { doc.addPage(); y = 50; }
        doc.rect(MARGIN, y, COL_W, 18).fill(ri % 2 === 0 ? WHITE : LIGHT);
        doc.fillColor(DARK).font("Helvetica").fontSize(8);
        row.forEach((cell, i) => doc.text(cell || "—", MARGIN + i * colW2 + 4, y + 4, { width: colW2 - 8 }));
        y += 18;
      });
      doc.rect(MARGIN, y, COL_W, 1).fill("#E5E7EB");
      y += 12;
    }
  }

  if (d.signatures && d.signatures.length > 0) {
    if (y > 700) { doc.addPage(); y = 50; }
    y += 16;
    y = renderSectionBar(doc, "Signatures", y);
    const sigW = (COL_W - 20 * (d.signatures.length - 1)) / d.signatures.length;
    d.signatures.forEach((sig, i) => {
      const xSig = MARGIN + i * (sigW + 20);
      doc.rect(xSig, y, sigW, 55).stroke("#E5E7EB");
      doc.fillColor(GRAY).font("Helvetica").fontSize(8).text(sig.label, xSig + 4, y + 4, { width: sigW - 8 });
    });
    y += 70;
    doc.fillColor(GRAY).font("Helvetica").fontSize(8)
      .text(`Fait le : ${new Date().toLocaleDateString("fr-FR")}`, MARGIN, y, { width: COL_W, align: "right" });
  }

  drawFooter(doc);
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { planType: true },
    });

    if (!user || user.planType !== "BUSINESS") {
      return NextResponse.json({ error: "Fonctionnalité réservée au plan Business" }, { status: 403 });
    }

    const body: GenerateRequest = await req.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Generate PDF
    const doc = new PDFDocument({ size: "A4", margin: MARGIN, autoFirstPage: true });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      switch (type) {
        case "facture":
          generateInvoice(doc, data as InvoiceData);
          break;
        case "devis":
          generateQuote(doc, data as QuoteData);
          break;
        case "contrat":
          generateContract(doc, data as ContractData);
          break;
        case "bon-de-commande":
          generatePurchaseOrder(doc, data as PurchaseOrderData);
          break;
        case "lettre":
          generateLetter(doc, data as LetterData);
          break;
        default:
          if (data && "sections" in (data as object)) {
            generateStructuredDoc(doc, data as GenericDocData);
          } else {
            doc.end();
            reject(new Error("Type de document inconnu"));
            return;
          }
          break;
      }

      doc.end();
    });

    const filenameParts: Record<string, string> = {
      facture: "Facture", devis: "Devis", contrat: "Contrat",
      "bon-de-commande": "BonDeCommande", lettre: "Lettre",
      ordonnance: "Ordonnance", "certificat-medical": "CertificatMedical",
      "compte-rendu-consultation": "CompteRenduConsultation", "fiche-patient": "FichePatient",
      "bilan-comptable": "BilanComptable", "declaration-fiscale": "DeclarationFiscale",
      "rapport-financier": "RapportFinancier", "acte-juridique": "ActeJuridique",
      "mise-en-demeure": "MiseEnDemeure", procuration: "Procuration",
      bail: "Bail", "compromis-de-vente": "CompromisDeVente",
      "mandat-immobilier": "MandatImmobilier", "cahier-des-charges": "CahierDesCharges",
      nda: "NDA", "rapport-technique": "RapportTechnique",
      "contrat-de-travail": "ContratDeTravail", "fiche-de-paie": "FicheDePaie",
      avenant: "Avenant", "convention-de-stage": "ConventionDeStage",
      "attestation-de-formation": "AttestationFormation", "programme-de-formation": "ProgrammeFormation",
      "bon-de-livraison": "BonDeLivraison", "note-de-credit": "NoteDeCredit",
      "brief-creatif": "BriefCreatif", "cession-droits": "CessionDroits",
      "compte-rendu-reunion": "CompteRenduReunion", rapport: "Rapport", attestation: "Attestation",
    };
    const filename = `${filenameParts[type]}_${Date.now()}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error("Generate PDF error:", error);
    return NextResponse.json({ error: "Erreur de génération du PDF" }, { status: 500 });
  }
}
