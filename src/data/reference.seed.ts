export const COUNTRIES = [
  { code: "US", name: "United States", currencyCode: "USD" },
  { code: "IN", name: "India", currencyCode: "INR" },
  { code: "GB", name: "United Kingdom", currencyCode: "GBP" },
  { code: "DE", name: "Germany", currencyCode: "EUR" },
  { code: "CA", name: "Canada", currencyCode: "CAD" },
  { code: "AU", name: "Australia", currencyCode: "AUD" },
  { code: "SG", name: "Singapore", currencyCode: "SGD" },
  { code: "JP", name: "Japan", currencyCode: "JPY" },
  { code: "FR", name: "France", currencyCode: "EUR" },
  { code: "BR", name: "Brazil", currencyCode: "BRL" },
] as const;

export const DEPARTMENTS = [
  { code: "ENG", name: "Engineering" },
  { code: "HR", name: "Human Resources" },
  { code: "FIN", name: "Finance" },
  { code: "MKT", name: "Marketing" },
  { code: "SLS", name: "Sales" },
  { code: "OPS", name: "Operations" },
  { code: "IT", name: "Information Technology" },
  { code: "LEG", name: "Legal" },
  { code: "PRD", name: "Product" },
  { code: "CS", name: "Customer Success" },
  { code: "RND", name: "Research & Development" },
  { code: "EXE", name: "Executive" },
] as const;

export const JOB_GRADES = [
  { name: "L1", level: 1, minSalary: 35000, maxSalary: 55000 },
  { name: "L2", level: 2, minSalary: 55000, maxSalary: 75000 },
  { name: "L3", level: 3, minSalary: 75000, maxSalary: 95000 },
  { name: "L4", level: 4, minSalary: 95000, maxSalary: 120000 },
  { name: "L5", level: 5, minSalary: 120000, maxSalary: 150000 },
  { name: "L6", level: 6, minSalary: 150000, maxSalary: 200000 },
  { name: "L7", level: 7, minSalary: 200000, maxSalary: 280000 },
  { name: "L8", level: 8, minSalary: 280000, maxSalary: 450000 },
] as const;
