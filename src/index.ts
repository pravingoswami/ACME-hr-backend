import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { connectDatabaseWithRetry } from "./lib/connectDatabase";
import { DatabaseConfigurationError } from "./lib/databaseUrl";
import { prisma } from "./lib/prisma";
import { seedAdmin } from "./lib/seed";
import { seedEmployees } from "./lib/seedEmployees";
import { seedReferenceData } from "./lib/seedReference";
import routes from "./routes";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      data: { status: "ok", service: "ACME-hr-backend", database: "connected" },
    });
  } catch {
    res.status(503).json({
      success: false,
      data: { status: "degraded", service: "ACME-hr-backend", database: "disconnected" },
    });
  }
});

app.use("/api", routes);
app.use(errorHandler);

async function start() {
  try {
    await connectDatabaseWithRetry();
    console.log("Connected to PostgreSQL (Supabase)");
    await seedAdmin();
    await seedReferenceData();
    await seedEmployees();
  } catch (error) {
    if (error instanceof DatabaseConfigurationError) {
      console.error(error.message);
    } else {
      console.error("Failed to connect to PostgreSQL:", error);
    }
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`ACME HR Backend running on http://localhost:${port}`);
  });
}

start();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
