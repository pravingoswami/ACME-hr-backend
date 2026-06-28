import { z } from "zod";
import { employeeStatusValues } from "../types/enums";

export const employeeListQuerySchema = z
  .object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    search: z.string().trim().optional(),
    name: z.string().trim().optional(),
    code: z.string().trim().optional(),
    email: z.string().trim().optional(),
    salaryMin: z.coerce.number().nonnegative().optional(),
    salaryMax: z.coerce.number().nonnegative().optional(),
    department: z.string().optional(),
    status: z.enum(employeeStatusValues).optional(),
    countryId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
    jobGradeId: z.string().uuid().optional(),
    sortBy: z.enum(["employeeCode", "lastName", "hireDate", "createdAt", "salary"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  })
  .refine(
    (data) =>
      data.salaryMin === undefined ||
      data.salaryMax === undefined ||
      data.salaryMin <= data.salaryMax,
    {
      message: "salaryMin must be less than or equal to salaryMax",
      path: ["salaryMin"],
    },
  );

export type EmployeeListQuery = z.infer<typeof employeeListQuerySchema>;

export const createEmployeeSchema = z.object({
  employeeCode: z.string().min(1, "Employee code is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  hireDate: z.string().datetime({ message: "Invalid hire date" }).or(z.string().date()),
  salary: z.number().positive().optional(),
  status: z.enum(employeeStatusValues).optional(),
  countryId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  jobGradeId: z.string().uuid().optional(),
});

export const updateEmployeeSchema = z.object({
  employeeCode: z.string().min(1, "Employee code is required").optional(),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  department: z.string().min(1, "Department is required").optional(),
  position: z.string().min(1, "Position is required").optional(),
  hireDate: z.string().datetime().or(z.string().date()).optional(),
  salary: z.number().positive().optional(),
  status: z.enum(employeeStatusValues).optional(),
  countryId: z.string().uuid().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  jobGradeId: z.string().uuid().optional().nullable(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
