import { moduleTools, defineConfig } from "@modern-js/module-tools";

export default defineConfig({
  plugins: [moduleTools()],
  buildConfig: [
    {
      input: ["src/index.ts"],
      target: "esnext",
      format: "esm",
      buildType: "bundle",
      dts: false,
      autoExtension: true,
    },
    {
      input: ["src/index.ts"],
      target: "esnext",
      format: "cjs",
      buildType: "bundle",
    },
  ],
});