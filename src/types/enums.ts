export const Role = {
  HR_MANAGER: "HR_MANAGER",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const EmployeeStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ON_LEAVE: "ON_LEAVE",
} as const;

export type EmployeeStatus = (typeof EmployeeStatus)[keyof typeof EmployeeStatus];

export const employeeStatusValues = [
  EmployeeStatus.ACTIVE,
  EmployeeStatus.INACTIVE,
  EmployeeStatus.ON_LEAVE,
] as const;

export const JobStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export const AuditAction = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  BULK_ADJUST: "BULK_ADJUST",
  IMPORT: "IMPORT",
  EXPORT: "EXPORT",
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

export const auditActionValues = [
  AuditAction.CREATE,
  AuditAction.UPDATE,
  AuditAction.DELETE,
  AuditAction.BULK_ADJUST,
  AuditAction.IMPORT,
  AuditAction.EXPORT,
] as const;
