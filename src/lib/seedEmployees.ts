import { prisma } from "./prisma";
import { EMPLOYEE_SEED_TARGET, generateEmployeeSeedData } from "../data/employee.seed";

const BATCH_SIZE = 100;

export async function seedEmployees(targetCount = EMPLOYEE_SEED_TARGET) {
  const existingCount = await prisma.employee.count();

  if (existingCount >= targetCount) {
    console.log(`Employees already at ${existingCount} (target ${targetCount}), skipping seed`);
    return existingCount;
  }

  const toCreate = targetCount - existingCount;
  const startIndex = existingCount + 1;
  const employees = generateEmployeeSeedData(toCreate, startIndex);

  const departments = await prisma.department.findMany();
  const countries = await prisma.country.findMany();
  const jobGrades = await prisma.jobGrade.findMany();

  const deptByName = new Map(departments.map((d) => [d.name, d.id]));
  const countryIds = countries.map((c) => c.id);
  const gradeIds = jobGrades.map((g) => g.id);

  for (let i = 0; i < employees.length; i += BATCH_SIZE) {
    const batch = employees.slice(i, i + BATCH_SIZE);

    await prisma.employee.createMany({
      data: batch.map((employee, batchIndex) => {
        const globalIndex = startIndex + i + batchIndex;
        return {
          employeeCode: employee.employeeCode,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone,
          department: employee.department,
          position: employee.position,
          hireDate: new Date(employee.hireDate),
          salary: employee.salary,
          status: employee.status,
          departmentId: deptByName.get(employee.department),
          countryId: countryIds.length ? countryIds[globalIndex % countryIds.length] : undefined,
          jobGradeId: gradeIds.length ? gradeIds[globalIndex % gradeIds.length] : undefined,
        };
      }),
      skipDuplicates: true,
    });
  }

  const finalCount = await prisma.employee.count();
  console.log(`Seeded employees: ${toCreate} added, ${finalCount} total (target ${targetCount})`);
  return finalCount;
}
