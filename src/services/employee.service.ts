import { EmployeeStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { buildPaginationMeta, PaginatedResult, PaginationParams } from "../utils/pagination";
import { CreateEmployeeInput, UpdateEmployeeInput } from "../validators/employee.validator";

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
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EmployeeSelect;

export type SafeEmployee = Prisma.EmployeeGetPayload<{ select: typeof employeeSelect }>;

function parseHireDate(value: string): Date {
  return new Date(value);
}

export async function getEmployeesPaginated(
  params: PaginationParams,
): Promise<PaginatedResult<SafeEmployee>> {
  const [total, items] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.findMany({
      select: employeeSelect,
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.limit,
    }),
  ]);

  return {
    items,
    pagination: buildPaginationMeta(total, params.page, params.limit),
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

export async function createEmployee(input: CreateEmployeeInput): Promise<SafeEmployee> {
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

  return prisma.employee.create({
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
    },
    select: employeeSelect,
  });
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput): Promise<SafeEmployee> {
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
  };

  if (input.hireDate) {
    data.hireDate = parseHireDate(input.hireDate);
  }

  return prisma.employee.update({
    where: { id },
    data,
    select: employeeSelect,
  });
}

export async function deleteEmployee(id: string): Promise<void> {
  await getEmployeeById(id);
  await prisma.employee.delete({ where: { id } });
}
