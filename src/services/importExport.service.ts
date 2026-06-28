import fs from "fs/promises";
import path from "path";
import { JobStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { createAuditLog } from "./audit.service";
import { AuditAction } from "../types/enums";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function createImportJob(userId: string, fileName: string, fileBuffer: Buffer) {
  await ensureUploadDir();
  const fileKey = `import-${Date.now()}-${fileName}`;
  const filePath = path.join(UPLOAD_DIR, fileKey);
  await fs.writeFile(filePath, fileBuffer);

  return prisma.importJob.create({
    data: {
      userId,
      fileKey,
      status: JobStatus.PENDING,
    },
  });
}

export async function processImportJob(jobId: string, userId: string) {
  const job = await prisma.importJob.findUnique({ where: { id: jobId } });

  if (!job) {
    throw new Error("Import job not found");
  }

  if (job.userId !== userId) {
    throw new Error("You do not have permission to perform this action");
  }

  await prisma.importJob.update({
    where: { id: jobId },
    data: { status: JobStatus.PROCESSING },
  });

  try {
    const filePath = path.join(UPLOAD_DIR, job.fileKey);
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.trim().split("\n");

    if (lines.length < 2) {
      throw new Error("CSV file must contain a header row and at least one data row");
    }

    const errors: string[] = [];
    let successCount = 0;

    for (let i = 1; i < lines.length; i += 1) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (cols.length < 4) {
        errors.push(`Row ${i + 1}: insufficient columns`);
        continue;
      }

      const [employeeCode, firstName, lastName, email] = cols;

      try {
        await prisma.employee.upsert({
          where: { employeeCode },
          update: { firstName, lastName, email },
          create: {
            employeeCode,
            firstName,
            lastName,
            email,
            department: cols[4] ?? "General",
            position: cols[5] ?? "Staff",
            hireDate: new Date(),
            status: "ACTIVE",
          },
        });
        successCount += 1;
      } catch {
        errors.push(`Row ${i + 1}: failed to import ${employeeCode}`);
      }
    }

    const updated = await prisma.importJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.COMPLETED,
        rowCount: successCount,
        errorReport: errors.length ? { errors } : undefined,
      },
    });

    await createAuditLog({
      userId,
      action: AuditAction.IMPORT,
      entityType: "import_job",
      entityId: jobId,
      metadata: { rowCount: successCount, failed: errors.length },
    });

    return updated;
  } catch (error) {
    await prisma.importJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.FAILED,
        errorReport: { message: error instanceof Error ? error.message : "Import failed" },
      },
    });
    throw error;
  }
}

export async function getImportJobStatus(jobId: string) {
  const job = await prisma.importJob.findUnique({ where: { id: jobId } });
  if (!job) {
    throw new Error("Import job not found");
  }
  return job;
}

export async function createExportJob(
  userId: string,
  filters?: Record<string, unknown>,
) {
  await ensureUploadDir();

  const employees = await prisma.employee.findMany({
    orderBy: { employeeCode: "asc" },
  });

  const header = "employeeCode,firstName,lastName,email,department,position,salary,status\n";
  const rows = employees
    .map(
      (e) =>
        `${e.employeeCode},${e.firstName},${e.lastName},${e.email},${e.department},${e.position},${e.salary ?? ""},${e.status}`,
    )
    .join("\n");

  const fileKey = `export-${Date.now()}.csv`;
  const filePath = path.join(UPLOAD_DIR, fileKey);
  await fs.writeFile(filePath, header + rows);

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const job = await prisma.exportJob.create({
    data: {
      userId,
      fileKey,
      status: JobStatus.COMPLETED,
      rowCount: employees.length,
      filters: filters as object | undefined,
      expiresAt,
    },
  });

  await createAuditLog({
    userId,
    action: AuditAction.EXPORT,
    entityType: "export_job",
    entityId: job.id,
    metadata: { rowCount: employees.length },
  });

  return job;
}

export async function getExportDownload(jobId: string) {
  const job = await prisma.exportJob.findUnique({ where: { id: jobId } });

  if (!job) {
    throw new Error("Export job not found");
  }

  if (job.status !== JobStatus.COMPLETED) {
    throw new Error("Export is not ready yet");
  }

  if (job.expiresAt && job.expiresAt < new Date()) {
    throw new Error("Export download link has expired");
  }

  const filePath = path.join(UPLOAD_DIR, job.fileKey);
  const exists = await fs.access(filePath).then(() => true).catch(() => false);

  if (!exists) {
    throw new Error("Export file not found");
  }

  return {
    filePath,
    fileName: job.fileKey,
    expiresAt: job.expiresAt,
  };
}
