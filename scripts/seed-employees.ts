import { prisma } from "../src/lib/prisma";
import { seedEmployees } from "../src/lib/seedEmployees";

async function main() {
  await seedEmployees();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
