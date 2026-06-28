import { z } from "zod";
import { employeeStatusValues } from "../types/enums";

export const updateSalarySchema = z.object({
  baseSalary: z.number().positive("Base salary must be positive"),
  bonus: z.number().min(0).optional(),
  allowances: z.number().min(0).optional(),
  currencyCode: z.string().length(3).optional(),
  effectiveFrom: z.string().date(),
});

export type UpdateSalaryInput = z.infer<typeof updateSalarySchema>;

export const analyticsQuerySchema = z.object({
  department: z.string().optional(),
  status: z.enum(employeeStatusValues).optional(),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
