import path from "node:path";
import { fileURLToPath } from "node:url";

export const OUTPUT_DIR = "dist";
export const PUBLIC_DIR = "public";

export const MDX_REGEXP = /\.mdx?$/;

export const DEFAULT_TITLE = "Minipress";
export const MINIPRESS_TEMP_DIR = ".minipress";
export const DEFAULT_CONFIG_NAME = "minipress.config";
export const DEFAULT_CONFIG_EXTENSIONS = [
  ".js",
  ".ts",
  ".mjs",
  ".mts",
  ".cjs",
  ".cts",
];

export const CONFIG_FILES = [
  "i18n.json",
  "_meta.json",
  "minipress.config.js",
  "minipress.config.ts",
];

export const PACKAGE_ROOT = path.join(
  path.dirname(fileURLToPath(new URL(import.meta.url))),
  "../.."
);

export const CLIENT_ENTRY = path.join(
  PACKAGE_ROOT,
  "dist",
  "runtime",
  "clientEntry.js"
);

export const SERVER_ENTRY = path.join(
  PACKAGE_ROOT,
  "dist",
  "runtime",
  "serverEntry.js"
);

export const isProduction = () => process.env.NODE_ENV === "production";
