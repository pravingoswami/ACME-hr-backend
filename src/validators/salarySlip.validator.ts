import { z } from "zod";
import { employeeStatusValues } from "../types/enums";

const payMonthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format (e.g. 2026-06)");

export const salarySlipQuerySchema = z.object({
  month: payMonthSchema,
});

export type SalarySlipQuery = z.infer<typeof salarySlipQuerySchema>;

export const bulkSalarySlipSchema = z.object({
  month: payMonthSchema,
  employeeIds: z.array(z.string().uuid()).optional(),
  department: z.string().trim().min(1).optional(),
  status: z.enum(employeeStatusValues).optional(),
});

export type BulkSalarySlipInput = z.infer<typeof bulkSalarySlipSchema>;
