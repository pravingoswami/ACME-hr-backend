import { prisma } from "./prisma";
import { SAMPLE_EMPLOYEES } from "../data/employee.seed";

export async function seedEmployees() {
  const count = await prisma.employee.count();

  if (count > 0) {
    return;
  }

  await prisma.employee.createMany({
    data: SAMPLE_EMPLOYEES.map((employee) => ({
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
    })),
  });

  console.log(`Seeded ${SAMPLE_EMPLOYEES.length} sample employees`);
}
