import { prisma } from "../lib/prisma";

export async function getCountries() {
  return prisma.country.findMany({ orderBy: { name: "asc" } });
}

export async function getDepartments() {
  return prisma.department.findMany({ orderBy: { name: "asc" } });
}

export async function getJobGrades() {
  return prisma.jobGrade.findMany({ orderBy: { level: "asc" } });
}
