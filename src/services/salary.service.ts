import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { createAuditLog } from "./audit.service";
import { AuditAction } from "../types/enums";
import { UpdateSalaryInput } from "../validators/salary.validator";

export async function getSalaryHistory(employeeId: string) {
  return prisma.salaryRecord.findMany({
    where: { employeeId },
    orderBy: { effectiveFrom: "desc" },
    include: {
      revisions: {
        orderBy: { changedAt: "desc" },
        include: {
          changedBy: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      },
    },
  });
}

export async function updateEmployeeSalary(
  employeeId: string,
  input: UpdateSalaryInput,
  changedById: string,
) {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const effectiveFrom = new Date(input.effectiveFrom);
  const currentRecord = await prisma.salaryRecord.findFirst({
    where: { employeeId, isCurrent: true },
  });

  const result = await prisma.$transaction(async (tx) => {
    if (currentRecord) {
      await tx.salaryRecord.update({
        where: { id: currentRecord.id },
        data: {
          isCurrent: false,
          effectiveTo: effectiveFrom,
        },
      });
    }

    const newRecord = await tx.salaryRecord.create({
      data: {
        employeeId,
        baseSalary: input.baseSalary,
        bonus: input.bonus ?? 0,
        allowances: input.allowances ?? 0,
        currencyCode: input.currencyCode ?? "USD",
        effectiveFrom,
        isCurrent: true,
      },
    });

    const revisionFields: Array<{ field: string; oldVal: string; newVal: string }> = [];

    if (currentRecord) {
      if (Number(currentRecord.baseSalary) !== input.baseSalary) {
        revisionFields.push({
          field: "baseSalary",
          oldVal: String(currentRecord.baseSalary),
          newVal: String(input.baseSalary),
        });
      }
      if (Number(currentRecord.bonus) !== (input.bonus ?? 0)) {
        revisionFields.push({
          field: "bonus",
          oldVal: String(currentRecord.bonus),
          newVal: String(input.bonus ?? 0),
        });
      }
      if (Number(currentRecord.allowances) !== (input.allowances ?? 0)) {
        revisionFields.push({
          field: "allowances",
          oldVal: String(currentRecord.allowances),
          newVal: String(input.allowances ?? 0),
        });
      }
    } else {
      revisionFields.push({
        field: "baseSalary",
        oldVal: employee.salary ? String(employee.salary) : "0",
        newVal: String(input.baseSalary),
      });
    }

    for (const rev of revisionFields) {
      await tx.salaryRevision.create({
        data: {
          salaryRecordId: newRecord.id,
          employeeId,
          changedById,
          fieldName: rev.field,
          oldValue: rev.oldVal,
          newValue: rev.newVal,
        },
      });
    }

    await tx.employee.update({
      where: { id: employeeId },
      data: { salary: input.baseSalary },
    });

    return newRecord;
  });

  await createAuditLog({
    userId: changedById,
    action: AuditAction.UPDATE,
    entityType: "salary_record",
    entityId: result.id,
    metadata: {
      employeeId,
      employeeCode: employee.employeeCode,
      baseSalary: input.baseSalary,
      effectiveFrom: input.effectiveFrom,
    },
  });

  return result;
}

export async function ensureSalaryRecordForEmployee(employeeId: string, baseSalary: number) {
  const existing = await prisma.salaryRecord.findFirst({
    where: { employeeId, isCurrent: true },
  });

  if (existing) {
    return existing;
  }

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) {
    return null;
  }

  return prisma.salaryRecord.create({
    data: {
      employeeId,
      baseSalary,
      effectiveFrom: employee.hireDate,
      isCurrent: true,
    },
  });
}
