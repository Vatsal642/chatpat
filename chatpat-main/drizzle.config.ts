import dotenv from "dotenv";
import { existsSync } from "fs";
import path from "path";

const localEnvPath = path.resolve(process.cwd(), ".local", ".env");
const rootEnvPath = path.resolve(process.cwd(), ".env");
const envPath = existsSync(localEnvPath) ? localEnvPath : rootEnvPath;
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
