import { Prisma } from "@prisma/client";
import { EmployeeListQuery } from "../validators/employee.validator";

function buildNameFilter(name: string): Prisma.EmployeeWhereInput {
  const tokens = name.trim().split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return {};
  }

  if (tokens.length === 1) {
    const term = tokens[0];
    return {
      OR: [
        { firstName: { startsWith: term, mode: "insensitive" } },
        { lastName: { startsWith: term, mode: "insensitive" } },
        { firstName: { contains: term, mode: "insensitive" } },
        { lastName: { contains: term, mode: "insensitive" } },
      ],
    };
  }

  const [first, ...rest] = tokens;
  const last = rest[rest.length - 1];

  return {
    AND: [
      {
        OR: [
          { firstName: { startsWith: first, mode: "insensitive" } },
          { firstName: { contains: first, mode: "insensitive" } },
        ],
      },
      {
        OR: [
          { lastName: { startsWith: last, mode: "insensitive" } },
          { lastName: { contains: last, mode: "insensitive" } },
        ],
      },
    ],
  };
}

function buildCodeFilter(code: string): Prisma.EmployeeWhereInput {
  const term = code.trim().toUpperCase();
  return {
    employeeCode: { startsWith: term, mode: "insensitive" },
  };
}

function buildEmailFilter(email: string): Prisma.EmployeeWhereInput {
  const term = email.trim().toLowerCase();
  return {
    email: { startsWith: term, mode: "insensitive" },
  };
}

function buildUnifiedSearchFilter(search: string): Prisma.EmployeeWhereInput {
  const term = search.trim();

  if (!term) {
    return {};
  }

  if (term.includes("@")) {
    return buildEmailFilter(term);
  }

  if (/^emp[\d-]*$/i.test(term) || /^[A-Z0-9-]{2,}$/i.test(term)) {
    return buildCodeFilter(term);
  }

  const nameFilter = buildNameFilter(term);
  return {
    OR: [
      nameFilter,
      buildCodeFilter(term),
      { email: { contains: term, mode: "insensitive" } },
    ],
  };
}

function buildSalaryRangeFilter(
  salaryMin?: number,
  salaryMax?: number,
): Prisma.EmployeeWhereInput | undefined {
  if (salaryMin === undefined && salaryMax === undefined) {
    return undefined;
  }

  const salary: Prisma.DecimalNullableFilter = { not: null };

  if (salaryMin !== undefined) {
    salary.gte = salaryMin;
  }

  if (salaryMax !== undefined) {
    salary.lte = salaryMax;
  }

  return { salary };
}

export function buildEmployeeSearchWhere(query: EmployeeListQuery): Prisma.EmployeeWhereInput {
  const filters: Prisma.EmployeeWhereInput[] = [];

  if (query.search) {
    filters.push(buildUnifiedSearchFilter(query.search));
  }

  if (query.name) {
    filters.push(buildNameFilter(query.name));
  }

  if (query.code) {
    filters.push(buildCodeFilter(query.code));
  }

  if (query.email) {
    filters.push(buildEmailFilter(query.email));
  }

  const salaryFilter = buildSalaryRangeFilter(query.salaryMin, query.salaryMax);
  if (salaryFilter) {
    filters.push(salaryFilter);
  }

  if (query.department) {
    filters.push({ department: query.department });
  }

  if (query.status) {
    filters.push({ status: query.status });
  }

  if (query.countryId) {
    filters.push({ countryId: query.countryId });
  }

  if (query.departmentId) {
    filters.push({ departmentId: query.departmentId });
  }

  if (query.jobGradeId) {
    filters.push({ jobGradeId: query.jobGradeId });
  }

  if (filters.length === 0) {
    return {};
  }

  if (filters.length === 1) {
    return filters[0];
  }

  return { AND: filters };
}

export function buildEmployeeOrderBy(
  query: EmployeeListQuery,
): Prisma.EmployeeOrderByWithRelationInput {
  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "desc";
  return { [sortBy]: sortOrder };
}
