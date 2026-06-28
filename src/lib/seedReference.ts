import { prisma } from "../lib/prisma";
import { COUNTRIES, DEPARTMENTS, JOB_GRADES } from "../data/reference.seed";

export async function seedReferenceData() {
  for (const country of COUNTRIES) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: { name: country.name, currencyCode: country.currencyCode },
      create: country,
    });
  }

  for (const dept of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: { name: dept.name },
      create: dept,
    });
  }

  for (const grade of JOB_GRADES) {
    await prisma.jobGrade.upsert({
      where: { level: grade.level },
      update: {
        name: grade.name,
        minSalary: grade.minSalary,
        maxSalary: grade.maxSalary,
      },
      create: grade,
    });
  }

  console.log("Reference data seeded (countries, departments, job grades)");
}
