const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export interface PayPeriod {
  month: string;
  year: number;
  monthIndex: number;
  label: string;
  start: Date;
  end: Date;
}

export function parsePayPeriod(month: string): PayPeriod {
  const match = MONTH_PATTERN.exec(month);
  if (!match) {
    throw new Error("Invalid month format. Use YYYY-MM (e.g. 2026-06).");
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));
  const label = start.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return { month, year, monthIndex, label, start, end };
}

export function salarySlipFilename(employeeCode: string, month: string): string {
  return `salary-slip-${employeeCode}-${month}.pdf`;
}

export function bulkSalarySlipZipFilename(month: string): string {
  return `salary-slips-${month}.zip`;
}
