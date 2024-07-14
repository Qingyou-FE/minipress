import type { RsbuildPlugin } from "@rsbuild/core";

export type PluginExampleOptions = {
  foo?: string;
  bar?: boolean;
};

const PLUGIN_DYNAMIC_ROUTES = "plugin-dynamic-routes";

export const pluginDynamicRoutes = (
  options: PluginExampleOptions = {}
): RsbuildPlugin => ({
  name: PLUGIN_DYNAMIC_ROUTES,

  setup() {
    console.log("Hello Rsbuild!", options);
  },
});
