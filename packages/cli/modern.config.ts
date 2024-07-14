import { moduleTools, defineConfig } from "@modern-js/module-tools";

export default defineConfig({
  plugins: [moduleTools()],
  buildConfig: {
    target: "esnext",
    format: "esm",
    dts: {
        enableTscBuild: true
    }
  }
});
