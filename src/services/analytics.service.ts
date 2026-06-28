import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export interface AnalyticsFilters {
  department?: string;
  status?: string;
}

function buildEmployeeWhere(filters: AnalyticsFilters): Prisma.EmployeeWhereInput {
  const where: Prisma.EmployeeWhereInput = {};

  if (filters.department) {
    where.department = filters.department;
  }

  if (filters.status) {
    where.status = filters.status as Prisma.EnumEmployeeStatusFilter["equals"];
  }

  return where;
}

export async function getAnalyticsSummary(filters: AnalyticsFilters) {
  const where = buildEmployeeWhere(filters);

  const [headcount, aggregates] = await Promise.all([
    prisma.employee.count({ where }),
    prisma.employee.aggregate({
      where: { ...where, salary: { not: null } },
      _avg: { salary: true },
      _min: { salary: true },
      _max: { salary: true },
      _sum: { salary: true },
    }),
  ]);

  const salaries = await prisma.employee.findMany({
    where: { ...where, salary: { not: null } },
    select: { salary: true },
    orderBy: { salary: "asc" },
  });

  const values = salaries.map((row) => Number(row.salary));
  const medianTotalComp = values.length ? computeMedian(values) : 0;

  return {
    headcount,
    avgTotalComp: aggregates._avg.salary ? Number(aggregates._avg.salary) : 0,
    medianTotalComp,
    minTotalComp: aggregates._min.salary ? Number(aggregates._min.salary) : 0,
    maxTotalComp: aggregates._max.salary ? Number(aggregates._max.salary) : 0,
    totalPayroll: aggregates._sum.salary ? Number(aggregates._sum.salary) : 0,
  };
}

export async function getAnalyticsByDepartment(filters: AnalyticsFilters) {
  const where = buildEmployeeWhere(filters);

  const rows = await prisma.employee.groupBy({
    by: ["department"],
    where: { ...where, salary: { not: null } },
    _count: { _all: true },
    _avg: { salary: true },
    _sum: { salary: true },
    orderBy: { department: "asc" },
  });

  return rows.map((row) => ({
    department: row.department,
    headcount: row._count._all,
    avgSalary: row._avg.salary ? Number(row._avg.salary) : 0,
    totalPayroll: row._sum.salary ? Number(row._sum.salary) : 0,
  }));
}

export async function getAnalyticsByStatus(filters: AnalyticsFilters) {
  const where = buildEmployeeWhere(filters);

  const rows = await prisma.employee.groupBy({
    by: ["status"],
    where,
    _count: { _all: true },
    orderBy: { status: "asc" },
  });

  return rows.map((row) => ({
    status: row.status,
    headcount: row._count._all,
  }));
}

export async function getPayRange(filters: AnalyticsFilters) {
  const where = buildEmployeeWhere(filters);

  const salaries = await prisma.employee.findMany({
    where: { ...where, salary: { not: null } },
    select: { salary: true },
    orderBy: { salary: "asc" },
  });

  const values = salaries.map((row) => Number(row.salary));

  if (!values.length) {
    return { p25: 0, p50: 0, p75: 0, p90: 0, count: 0 };
  }

  return {
    p25: percentile(values, 25),
    p50: percentile(values, 50),
    p75: percentile(values, 75),
    p90: percentile(values, 90),
    count: values.length,
  };
}

function computeMedian(values: number[]): number {
  const mid = Math.floor(values.length / 2);
  if (values.length % 2 === 0) {
    return (values[mid - 1] + values[mid]) / 2;
  }
  return values[mid];
}

function percentile(values: number[], p: number): number {
  const index = Math.ceil((p / 100) * values.length) - 1;
  return values[Math.max(0, Math.min(index, values.length - 1))];
}
