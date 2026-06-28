import { z } from "zod";
import { employeeStatusValues } from "../types/enums";

export const bulkAdjustmentSchema = z.object({
  filters: z.object({
    department: z.string().optional(),
    status: z.enum(employeeStatusValues).optional(),
    countryId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
  }),
  adjustment: z.discriminatedUnion("type", [
    z.object({ type: z.literal("PERCENT"), value: z.number() }),
    z.object({ type: z.literal("FLAT"), value: z.number() }),
  ]),
});

export type BulkAdjustmentInput = z.infer<typeof bulkAdjustmentSchema>;

export const exportRequestSchema = z.object({
  filters: z.record(z.unknown()).optional(),
});

export type ExportRequestInput = z.infer<typeof exportRequestSchema>;
