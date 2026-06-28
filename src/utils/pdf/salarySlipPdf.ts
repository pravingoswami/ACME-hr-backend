import PDFDocument from "pdfkit";

export interface SalarySlipPdfData {
  companyName: string;
  payPeriodLabel: string;
  generatedAt: Date;
  employee: {
    code: string;
    name: string;
    email: string;
    department: string;
    position: string;
    hireDate: Date;
    status: string;
  };
  earnings: {
    baseSalary: number;
    bonus: number;
    allowances: number;
    grossPay: number;
    netPay: number;
    currencyCode: string;
  };
}

function formatMoney(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function buildSalarySlipPdf(data: SalarySlipPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const { earnings } = data;
    const currency = earnings.currencyCode;

    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .text(data.companyName, { align: "center" })
      .moveDown(0.3);

    doc
      .font("Helvetica")
      .fontSize(14)
      .fillColor("#444444")
      .text("Salary Slip", { align: "center" })
      .moveDown(0.2);

    doc
      .fontSize(11)
      .text(`Pay period: ${data.payPeriodLabel}`, { align: "center" })
      .text(`Generated: ${formatDate(data.generatedAt)}`, { align: "center" })
      .moveDown(1.2);

    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(12).text("Employee Details");
    doc.moveDown(0.4);

    const detailRows: Array<[string, string]> = [
      ["Employee Code", data.employee.code],
      ["Name", data.employee.name],
      ["Email", data.employee.email],
      ["Department", data.employee.department],
      ["Position", data.employee.position],
      ["Hire Date", formatDate(data.employee.hireDate)],
      ["Status", data.employee.status],
    ];

    doc.font("Helvetica").fontSize(10);
    for (const [label, value] of detailRows) {
      doc.font("Helvetica-Bold").text(`${label}: `, { continued: true });
      doc.font("Helvetica").text(value);
    }

    doc.moveDown(1);

    const tableTop = doc.y;
    const colLabelX = 50;
    const colAmountX = 420;
    const rowHeight = 24;

    doc.font("Helvetica-Bold").fontSize(12).text("Earnings", colLabelX, tableTop);
    doc.moveDown(0.5);

    const earningsRows: Array<[string, number]> = [
      ["Base Salary", earnings.baseSalary],
      ["Bonus", earnings.bonus],
      ["Allowances", earnings.allowances],
    ];

    let currentY = doc.y;
    doc.font("Helvetica").fontSize(10);

    for (const [label, amount] of earningsRows) {
      doc.text(label, colLabelX, currentY);
      doc.text(formatMoney(amount, currency), colAmountX, currentY, {
        width: 125,
        align: "right",
      });
      currentY += rowHeight;
    }

    doc
      .moveTo(colLabelX, currentY)
      .lineTo(545, currentY)
      .strokeColor("#cccccc")
      .stroke();

    currentY += 8;
    doc.font("Helvetica-Bold");
    doc.text("Gross Pay", colLabelX, currentY);
    doc.text(formatMoney(earnings.grossPay, currency), colAmountX, currentY, {
      width: 125,
      align: "right",
    });

    currentY += rowHeight;
    doc.fillColor("#006600");
    doc.text("Net Pay", colLabelX, currentY);
    doc.text(formatMoney(earnings.netPay, currency), colAmountX, currentY, {
      width: 125,
      align: "right",
    });

    doc.fillColor("#666666").font("Helvetica").fontSize(9);
    doc.text(
      "This is a system-generated salary slip. For queries, contact HR.",
      50,
      760,
      { align: "center", width: 495 },
    );

    doc.end();
  });
}
