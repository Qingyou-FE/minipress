import type { RsbuildPlugin } from "@rsbuild/core";

export type PluginExampleOptions = {
  foo?: string;
  bar?: boolean;
};

export const pluginDynamicRoutes = (
  options: PluginExampleOptions = {}
): RsbuildPlugin => ({
  name: "plugin-dynamic-routes",

  setup() {
    console.log("Hello Rsbuild!", options);
  },
});
