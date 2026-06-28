import { EmployeeStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { createAuditLog } from "./audit.service";
import { ensureSalaryRecordForEmployee } from "./salary.service";
import { AuditAction } from "../types/enums";
import { buildPaginationMeta, PaginatedResult, PaginationParams } from "../utils/pagination";
import {
  CreateEmployeeInput,
  EmployeeListQuery,
  UpdateEmployeeInput,
} from "../validators/employee.validator";
import { buildEmployeeOrderBy, buildEmployeeSearchWhere } from "../utils/employeeSearch";

const employeeSelect = {
  id: true,
  employeeCode: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  department: true,
  position: true,
  hireDate: true,
  salary: true,
  status: true,
  countryId: true,
  departmentId: true,
  jobGradeId: true,
  createdAt: true,
  updatedAt: true,
  countryRef: { select: { id: true, code: true, name: true, currencyCode: true } },
  departmentRef: { select: { id: true, code: true, name: true } },
  jobGradeRef: { select: { id: true, name: true, level: true } },
} satisfies Prisma.EmployeeSelect;

export type SafeEmployee = Prisma.EmployeeGetPayload<{ select: typeof employeeSelect }>;

function parseHireDate(value: string): Date {
  return new Date(value);
}

export async function getEmployeesPaginated(
  pagination: PaginationParams,
  query: EmployeeListQuery = {},
): Promise<PaginatedResult<SafeEmployee>> {
  const where = buildEmployeeSearchWhere(query);
  const orderBy = buildEmployeeOrderBy(query);

  const [total, items] = await Promise.all([
    prisma.employee.count({ where }),
    prisma.employee.findMany({
      where,
      select: employeeSelect,
      orderBy,
      skip: pagination.skip,
      take: pagination.limit,
    }),
  ]);

  return {
    items,
    pagination: buildPaginationMeta(total, pagination.page, pagination.limit),
  };
}

export async function getEmployeeById(id: string): Promise<SafeEmployee> {
  const employee = await prisma.employee.findUnique({
    where: { id },
    select: employeeSelect,
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
}

export async function createEmployee(
  input: CreateEmployeeInput,
  actorId?: string,
): Promise<SafeEmployee> {
  const existingCode = await prisma.employee.findUnique({
    where: { employeeCode: input.employeeCode },
  });

  if (existingCode) {
    throw new Error("Employee code already in use");
  }

  const existingEmail = await prisma.employee.findUnique({
    where: { email: input.email },
  });

  if (existingEmail) {
    throw new Error("Email already in use");
  }

  const employee = await prisma.employee.create({
    data: {
      employeeCode: input.employeeCode,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      department: input.department,
      position: input.position,
      hireDate: parseHireDate(input.hireDate),
      salary: input.salary,
      status: input.status ?? EmployeeStatus.ACTIVE,
      countryId: input.countryId,
      departmentId: input.departmentId,
      jobGradeId: input.jobGradeId,
    },
    select: employeeSelect,
  });

  if (input.salary) {
    await ensureSalaryRecordForEmployee(employee.id, input.salary);
  }

  if (actorId) {
    await createAuditLog({
      userId: actorId,
      action: AuditAction.CREATE,
      entityType: "employee",
      entityId: employee.id,
      metadata: { employeeCode: employee.employeeCode },
    });
  }

  return employee;
}

export async function updateEmployee(
  id: string,
  input: UpdateEmployeeInput,
  actorId?: string,
): Promise<SafeEmployee> {
  await getEmployeeById(id);

  if (input.employeeCode) {
    const existing = await prisma.employee.findFirst({
      where: { employeeCode: input.employeeCode, NOT: { id } },
    });

    if (existing) {
      throw new Error("Employee code already in use");
    }
  }

  if (input.email) {
    const existing = await prisma.employee.findFirst({
      where: { email: input.email, NOT: { id } },
    });

    if (existing) {
      throw new Error("Email already in use");
    }
  }

  const data: Prisma.EmployeeUpdateInput = {
    employeeCode: input.employeeCode,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    department: input.department,
    position: input.position,
    salary: input.salary,
    status: input.status,
    countryRef: input.countryId === null ? { disconnect: true } : input.countryId ? { connect: { id: input.countryId } } : undefined,
    departmentRef: input.departmentId === null ? { disconnect: true } : input.departmentId ? { connect: { id: input.departmentId } } : undefined,
    jobGradeRef: input.jobGradeId === null ? { disconnect: true } : input.jobGradeId ? { connect: { id: input.jobGradeId } } : undefined,
  };

  if (input.hireDate) {
    data.hireDate = parseHireDate(input.hireDate);
  }

  const employee = await prisma.employee.update({
    where: { id },
    data,
    select: employeeSelect,
  });

  if (actorId) {
    await createAuditLog({
      userId: actorId,
      action: AuditAction.UPDATE,
      entityType: "employee",
      entityId: employee.id,
      metadata: { employeeCode: employee.employeeCode },
    });
  }

  return employee;
}

export async function deleteEmployee(id: string, actorId?: string): Promise<void> {
  const employee = await getEmployeeById(id);
  await prisma.employee.delete({ where: { id } });

  if (actorId) {
    await createAuditLog({
      userId: actorId,
      action: AuditAction.DELETE,
      entityType: "employee",
      entityId: id,
      metadata: { employeeCode: employee.employeeCode },
    });
  }
}

export async function deactivateEmployee(id: string, actorId?: string): Promise<SafeEmployee> {
  return updateEmployee(id, { status: EmployeeStatus.INACTIVE }, actorId);
}
