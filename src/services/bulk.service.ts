import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { createAuditLog } from "./audit.service";
import { AuditAction } from "../types/enums";
import { BulkAdjustmentInput } from "../validators/bulk.validator";

function buildBulkWhere(filters: BulkAdjustmentInput["filters"]): Prisma.EmployeeWhereInput {
  const where: Prisma.EmployeeWhereInput = { salary: { not: null } };

  if (filters.department) {
    where.department = filters.department;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.countryId) {
    where.countryId = filters.countryId;
  }

  if (filters.departmentId) {
    where.departmentId = filters.departmentId;
  }

  return where;
}

function applyAdjustment(currentSalary: number, adjustment: BulkAdjustmentInput["adjustment"]): number {
  if (adjustment.type === "PERCENT") {
    return Math.round(currentSalary * (1 + adjustment.value / 100) * 100) / 100;
  }
  return Math.round((currentSalary + adjustment.value) * 100) / 100;
}

const BULK_APPLY_BATCH_SIZE = 25;
const BULK_TRANSACTION_OPTIONS = {
  maxWait: 10_000,
  timeout: 60_000,
} as const;

async function applyAdjustmentToEmployee(
  tx: Prisma.TransactionClient,
  emp: { id: string; salary: Prisma.Decimal | null },
  adjustment: BulkAdjustmentInput["adjustment"],
  userId: string,
  effectiveFrom: Date,
): Promise<void> {
  const current = Number(emp.salary);
  const newSalary = applyAdjustment(current, adjustment);

  await tx.employee.update({
    where: { id: emp.id },
    data: { salary: newSalary },
  });

  const currentRecord = await tx.salaryRecord.findFirst({
    where: { employeeId: emp.id, isCurrent: true },
  });

  if (currentRecord) {
    await tx.salaryRecord.update({
      where: { id: currentRecord.id },
      data: { isCurrent: false, effectiveTo: effectiveFrom },
    });
  }

  const record = await tx.salaryRecord.create({
    data: {
      employeeId: emp.id,
      baseSalary: newSalary,
      bonus: currentRecord ? Number(currentRecord.bonus) : 0,
      allowances: currentRecord ? Number(currentRecord.allowances) : 0,
      currencyCode: currentRecord?.currencyCode ?? "USD",
      effectiveFrom,
      isCurrent: true,
    },
  });

  await tx.salaryRevision.create({
    data: {
      salaryRecordId: record.id,
      employeeId: emp.id,
      changedById: userId,
      fieldName: "baseSalary",
      oldValue: String(current),
      newValue: String(newSalary),
    },
  });
}

export async function previewBulkAdjustment(input: BulkAdjustmentInput) {
  const where = buildBulkWhere(input.filters);

  const employees = await prisma.employee.findMany({
    where,
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      salary: true,
    },
    take: 1000,
  });

  const sample = employees.slice(0, 5).map((emp) => {
    const current = Number(emp.salary);
    const updated = applyAdjustment(current, input.adjustment);
    return {
      id: emp.id,
      employeeCode: emp.employeeCode,
      name: `${emp.firstName} ${emp.lastName}`,
      currentSalary: current,
      newSalary: updated,
    };
  });

  return {
    affectedCount: employees.length,
    sample,
  };
}

export async function applyBulkAdjustment(input: BulkAdjustmentInput, userId: string) {
  const where = buildBulkWhere(input.filters);

  const employees = await prisma.employee.findMany({
    where,
    select: { id: true, salary: true, employeeCode: true },
  });

  const effectiveFrom = new Date();
  let updatedCount = 0;

  for (let i = 0; i < employees.length; i += BULK_APPLY_BATCH_SIZE) {
    const batch = employees.slice(i, i + BULK_APPLY_BATCH_SIZE);

    const batchCount = await prisma.$transaction(
      async (tx) => {
        for (const emp of batch) {
          await applyAdjustmentToEmployee(tx, emp, input.adjustment, userId, effectiveFrom);
        }
        return batch.length;
      },
      BULK_TRANSACTION_OPTIONS,
    );

    updatedCount += batchCount;
  }

  await createAuditLog({
    userId,
    action: AuditAction.BULK_ADJUST,
    entityType: "bulk_operation",
    entityId: userId,
    metadata: {
      filters: input.filters,
      adjustment: input.adjustment,
      affectedCount: updatedCount,
    },
  });

  return { affectedCount: updatedCount };
}
