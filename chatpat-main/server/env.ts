import dotenv from "dotenv";
import { existsSync } from "fs";
import path from "path";

const cwd = process.cwd();
const localEnvPath = path.resolve(cwd, ".local", ".env");
const rootEnvPath = path.resolve(cwd, ".env");

const envPath = existsSync(localEnvPath)
	? localEnvPath
	: rootEnvPath;

if (existsSync(envPath)) {
	dotenv.config({ path: envPath });
} else {
	dotenv.config();
}