import { DEPARTMENTS, JOB_GRADES } from "./reference.seed";

export type EmployeeSeedStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE";

export interface EmployeeSeedData {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  hireDate: string;
  salary: number;
  status: EmployeeSeedStatus;
}

export const EMPLOYEE_SEED_TARGET = 10_000;

const FIRST_NAMES = [
  "James", "Sarah", "Michael", "Emily", "David", "Lisa", "Robert", "Jennifer",
  "William", "Amanda", "Christopher", "Jessica", "Daniel", "Ashley", "Matthew",
  "Nicole", "Andrew", "Stephanie", "Joshua", "Melissa", "Ryan", "Laura",
  "Kevin", "Rachel", "Brian", "Anna", "Mark", "Sophia", "Jason", "Olivia",
  "Eric", "Emma", "Thomas", "Mia", "Paul", "Isabella", "Steven", "Charlotte",
  "Richard", "Amelia", "Charles", "Harper", "Joseph", "Evelyn", "Anthony",
  "Abigail", "Donald", "Elizabeth", "Kenneth", "Sofia",
];

const LAST_NAMES = [
  "Wilson", "Chen", "Brown", "Davis", "Martinez", "Anderson", "Taylor", "Thomas",
  "Jackson", "White", "Harris", "Clark", "Lewis", "Walker", "Hall", "Allen",
  "Young", "King", "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Nelson",
  "Baker", "Gonzalez", "Perez", "Roberts", "Turner", "Phillips", "Campbell",
  "Parker", "Evans", "Edwards", "Collins", "Stewart", "Morris", "Rogers", "Reed",
];

const POSITIONS_BY_DEPT: Record<string, string[]> = {
  Engineering: ["Software Engineer", "Senior Software Engineer", "Frontend Developer", "Backend Developer", "DevOps Engineer", "QA Engineer", "Tech Lead"],
  "Human Resources": ["HR Specialist", "Recruiter", "Training Coordinator", "HR Business Partner"],
  Finance: ["Financial Analyst", "Accountant", "Payroll Manager", "Controller"],
  Marketing: ["Marketing Manager", "Content Strategist", "Social Media Specialist", "Brand Manager"],
  Sales: ["Sales Manager", "Account Executive", "Business Development Rep", "Sales Associate"],
  Operations: ["Operations Manager", "Logistics Coordinator", "Facilities Manager", "Process Analyst"],
  "Information Technology": ["IT Support Specialist", "Systems Administrator", "Network Engineer", "Security Analyst"],
  Legal: ["Legal Counsel", "Compliance Officer", "Paralegal"],
  Product: ["Product Manager", "Product Designer", "Product Analyst"],
  "Customer Success": ["Customer Success Manager", "Support Specialist", "Implementation Consultant"],
  "Research & Development": ["Research Scientist", "Lab Technician", "R&D Engineer"],
  Executive: ["Director", "VP", "Chief of Staff"],
};

const STATUSES: EmployeeSeedStatus[] = ["ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "ON_LEAVE", "INACTIVE"];

function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length];
}

function salaryForGrade(level: number): number {
  const grade = JOB_GRADES.find((g) => g.level === level) ?? JOB_GRADES[2];
  const range = Number(grade.maxSalary) - Number(grade.minSalary);
  const offset = (level * 137) % Math.max(range, 1);
  return Number(grade.minSalary) + offset;
}

function hireDateForIndex(index: number): string {
  const year = 2015 + (index % 11);
  const month = (index % 12) + 1;
  const day = (index % 27) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function phoneForIndex(index: number): string {
  return `+1-555-${String(index).padStart(5, "0")}`;
}

export function generateEmployeeSeedData(count: number, startIndex = 1): EmployeeSeedData[] {
  return Array.from({ length: count }, (_, offset) => {
    const index = startIndex + offset;
    const firstName = pick(FIRST_NAMES, index);
    const lastName = pick(LAST_NAMES, index * 3 + Math.floor(index / LAST_NAMES.length));
    const department = pick(DEPARTMENTS, index).name;
    const positions = POSITIONS_BY_DEPT[department] ?? ["Staff"];
    const position = pick(positions, index);
    const gradeLevel = (index % JOB_GRADES.length) + 1;

    return {
      employeeCode: `EMP${String(index).padStart(5, "0")}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index}@acme.com`,
      phone: phoneForIndex(index),
      department,
      position,
      hireDate: hireDateForIndex(index),
      salary: salaryForGrade(gradeLevel),
      status: pick(STATUSES, index),
    };
  });
}

/** @deprecated Use generateEmployeeSeedData(EMPLOYEE_SEED_TARGET) instead */
export const SAMPLE_EMPLOYEES = generateEmployeeSeedData(25);
