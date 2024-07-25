import type { RsbuildPlugin } from "@rsbuild/core";

export type PluginMdxOptions = {
  foo?: string;
  bar?: boolean;
};

export const PluginMdx = (options: PluginMdxOptions = {}): RsbuildPlugin => ({
  name: "plugin-mdx",

  setup() {
    console.log("Hello Rsbuild!", options);
  },
});
