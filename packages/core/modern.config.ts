import { defineConfig, moduleTools } from "@modern-js/module-tools";

export default defineConfig({
  plugins: [moduleTools()],
  testing: {
    transformer: "ts-jest",
  },
  buildConfig: [
    {
      input: ["src/node/index.ts"],
      buildType: "bundle",
      format: "esm",
      target: "es2020",
      outDir: "dist/node",
      sourceMap: true,
      externals: [],
      banner: {
        js: 'import { createRequire } from "module";\nconst { url } = import.meta;\nconst require = createRequire(url);',
      },
    },
    {
      sourceDir: "src/runtime",
      buildType: "bundleless",
      target: "es2020",
      format: "esm",
      outDir: "dist/runtime",
      tsconfig: "./src/runtime/tsconfig.json",
    },
  ],
});
