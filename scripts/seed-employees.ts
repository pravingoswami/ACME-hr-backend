import { prisma } from "../src/lib/prisma";
import { seedReferenceData } from "../src/lib/seedReference";
import { seedEmployees } from "../src/lib/seedEmployees";
import { EMPLOYEE_SEED_TARGET } from "../src/data/employee.seed";

async function main() {
  const target = Number(process.env.SEED_EMPLOYEE_COUNT ?? EMPLOYEE_SEED_TARGET);

  await seedReferenceData();
  const count = await seedEmployees(target);
  console.log(`Done. Employee count: ${count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
