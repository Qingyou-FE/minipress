import path from "node:path";
import crypto from "node:crypto";
import { defineConfig, moduleTools } from "@modern-js/module-tools";

const COMMON_EXTERNALS = ["minipress-routes"];

export default defineConfig({
  plugins: [moduleTools()],
  testing: {
    transformer: "ts-jest",
  },
  buildConfig: [
    {
      input: {
        bundle: "./src/index.ts",
      },
      copy: {
        patterns: [
          {
            from: "./.theme-entry.js",
            to: "./index.js",
            context: __dirname,
          },
          {
            from: "./.theme-entry.d.ts",
            to: "./index.d.ts",
            context: __dirname,
          },
        ],
      },
      outDir: "dist",
      sourceMap: true,
      format: "esm",
      externals: COMMON_EXTERNALS,
      asset: {
        svgr: true,
      },
      style: {
        modules: {
          localsConvention: "camelCase",
          generateScopedName(name, filename) {
            const relative = path
              .relative(__dirname, filename)
              .replace(/\\/g, "/");
            const hash = crypto
              .createHash("sha256")
              .update(relative)
              .digest("hex")
              .slice(0, 5);
            return `${name}_${hash}`;
          },
        },
      },
    },
  ],
});
