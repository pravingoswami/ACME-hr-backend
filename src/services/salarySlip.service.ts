import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { buildSalarySlipPdf, SalarySlipPdfData } from "../utils/pdf/salarySlipPdf";
import { parsePayPeriod, salarySlipFilename } from "../utils/salarySlipPeriod";
import { BulkSalarySlipInput } from "../validators/salarySlip.validator";
import { createAuditLog } from "./audit.service";
import { AuditAction } from "../types/enums";

const COMPANY_NAME = "ACME Corporation";

interface EmployeeWithSalary {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  hireDate: Date;
  status: string;
  salary: Prisma.Decimal | null;
}

function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value == null) {
    return 0;
  }
  return Number(value);
}

async function getSalaryForPeriod(employeeId: string, periodStart: Date, periodEnd: Date) {
  const record = await prisma.salaryRecord.findFirst({
    where: {
      employeeId,
      effectiveFrom: { lte: periodEnd },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: periodStart } }],
    },
    orderBy: { effectiveFrom: "desc" },
  });

  return record;
}

async function buildSlipPdfForEmployee(
  employee: EmployeeWithSalary,
  month: string,
): Promise<{ filename: string; buffer: Buffer }> {
  const period = parsePayPeriod(month);
  const salaryRecord = await getSalaryForPeriod(employee.id, period.start, period.end);

  const baseSalary = salaryRecord
    ? toNumber(salaryRecord.baseSalary)
    : toNumber(employee.salary);
  const bonus = salaryRecord ? toNumber(salaryRecord.bonus) : 0;
  const allowances = salaryRecord ? toNumber(salaryRecord.allowances) : 0;
  const currencyCode = salaryRecord?.currencyCode ?? "USD";
  const grossPay = baseSalary + bonus + allowances;

  const pdfData: SalarySlipPdfData = {
    companyName: COMPANY_NAME,
    payPeriodLabel: period.label,
    generatedAt: new Date(),
    employee: {
      code: employee.employeeCode,
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      hireDate: employee.hireDate,
      status: employee.status,
    },
    earnings: {
      baseSalary,
      bonus,
      allowances,
      grossPay,
      netPay: grossPay,
      currencyCode,
    },
  };

  const buffer = await buildSalarySlipPdf(pdfData);
  return {
    filename: salarySlipFilename(employee.employeeCode, month),
    buffer,
  };
}

export async function generateEmployeeSalarySlip(employeeId: string, month: string) {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });

  if (!employee) {
    throw new Error("Employee not found");
  }

  return buildSlipPdfForEmployee(employee, month);
}

export async function generateBulkSalarySlips(
  input: BulkSalarySlipInput,
  userId: string,
): Promise<{ employeeCount: number; month: string; employees: EmployeeWithSalary[] }> {
  parsePayPeriod(input.month);

  const where: Prisma.EmployeeWhereInput = {};

  if (input.employeeIds?.length) {
    where.id = { in: input.employeeIds };
  }

  if (input.department) {
    where.department = { equals: input.department, mode: "insensitive" };
  }

  if (input.status) {
    where.status = input.status;
  }

  const employees = await prisma.employee.findMany({
    where,
    orderBy: { employeeCode: "asc" },
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      email: true,
      department: true,
      position: true,
      hireDate: true,
      status: true,
      salary: true,
    },
  });

  if (employees.length === 0) {
    throw new Error("No employees matched the bulk salary slip criteria");
  }

  await createAuditLog({
    userId,
    action: AuditAction.EXPORT,
    entityType: "salary_slip_bulk",
    entityId: input.month,
    metadata: {
      month: input.month,
      employeeCount: employees.length,
      department: input.department ?? null,
      status: input.status,
      employeeIds: input.employeeIds ?? null,
    },
  });

  return {
    employeeCount: employees.length,
    month: input.month,
    employees,
  };
}

export async function appendEmployeeSlipsToArchive(
  employees: EmployeeWithSalary[],
  month: string,
  append: (buffer: Buffer, filename: string) => void,
): Promise<void> {
  for (const employee of employees) {
    const slip = await buildSlipPdfForEmployee(employee, month);
    append(slip.buffer, slip.filename);
  }
}
