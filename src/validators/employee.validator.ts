import { z } from "zod";
import { employeeStatusValues } from "../types/enums";

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
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
