import path from "node:path";
import { removeLeadingSlash, removeTrailingSlash } from "@minipress/shared";
import { PLUGIN_REACT_NAME, pluginReact } from "@rsbuild/plugin-react";
import {
  CLIENT_ENTRY,
  isProduction,
  MDX_REGEXP,
  MINIPRESS_TEMP_DIR,
  OUTPUT_DIR,
  PACKAGE_ROOT,
  PUBLIC_DIR,
  SERVER_ENTRY,
} from "../common/constants";

import type { RsbuildConfig } from "@rsbuild/core";
import type { UserConfig } from "../../../types/global";

export async function createInternalBuildConfig(
  root: string,
  config: UserConfig,
  enableSSG: boolean,
  runtimeTempDir: string
): Promise<RsbuildConfig> {
  const cwd = process.cwd();

  const base = config?.base ?? "";
  const csrOutDir = config?.outDir ?? OUTPUT_DIR;
  const ssrOutDir = path.join(csrOutDir, "ssr");
  const CUSTOM_THEME_DIR = path.join(
    process.cwd(),
    MINIPRESS_TEMP_DIR,
    "theme"
  );

  const DEFAULT_THEME = require.resolve("@rspress/theme-default");

  // In production, we need to add assetPrefix in asset path
  const assetPrefix = isProduction()
    ? removeTrailingSlash(config?.rsbuildConfig?.output?.assetPrefix ?? base)
    : "";

  // Using latest browserslist in development to improve build performance
  const ssrBrowserslist = ["node >= 14"];
  const webBrowserslist = isProduction()
    ? ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"]
    : [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version",
      ];

  function isPluginIncluded(config: UserConfig, pluginName: string): boolean {
    return config.rsbuildPlugins?.some((plugin) => plugin.name === pluginName);
  }

  return {
    plugins: [
      ...(isPluginIncluded(config, PLUGIN_REACT_NAME) ? [] : [pluginReact()]),
    ],
    server: {
      port:
        !isProduction() && process.env.PORT
          ? Number(process.env.PORT)
          : undefined,
      printUrls: ({ urls }) => {
        return urls.map((url) => `${url}/${removeLeadingSlash(base)}`);
      },
      publicDir: {
        name: path.join(root, PUBLIC_DIR),
      },
    },
    dev: {
      progressBar: false,
    },
    html: {
      template: path.join(PACKAGE_ROOT, "index.html"),
    },
    output: {
      assetPrefix,
      distPath: {
        // just for rsbuild preview
        root: csrOutDir,
      },
    },
    source: {
      alias: {
        "@theme": [CUSTOM_THEME_DIR, DEFAULT_THEME],
        "@rspress/core": PACKAGE_ROOT,
      },
      include: [
        PACKAGE_ROOT,
        path.join(cwd, "node_modules", MINIPRESS_TEMP_DIR),
      ],
      define: {
        "process.env.TEST": JSON.stringify(process.env.TEST),
      },
    },
    performance: {
      chunkSplit: {
        override: {
          cacheGroups: {
            // extract all CSS into a single file
            // ensure CSS in async chunks can be loaded for SSG
            styles: {
              name: "styles",
              minSize: 0,
              chunks: "all",
              test: /\.(?:css|less|sass|scss)$/,
              priority: 99,
            },
          },
        },
      },
    },
    tools: {
      bundlerChain(chain, { CHAIN_ID, target }) {
        const isServer = target === "node";
        const jsModuleRule = chain.module.rule(CHAIN_ID.RULE.JS);

        const swcLoaderOptions = jsModuleRule
          .use(CHAIN_ID.USE.SWC)
          .get("options");

        chain.module
          .rule("MDX")
          .type("javascript/auto")
          .test(MDX_REGEXP)
          .resolve.merge({
            conditionNames: jsModuleRule.resolve.conditionNames.values(),
            mainFields: jsModuleRule.resolve.mainFields.values(),
          })
          .end()
          .oneOf("MDXCompile")
          .use("builtin:swc-loader")
          .loader("builtin:swc-loader")
          .options(swcLoaderOptions)
          .end()
          .use("mdx-loader")
          .loader(require.resolve("../loader.cjs"))
          .options({
            root,
            config,
          })
          .end();

        if (chain.plugins.has(CHAIN_ID.PLUGIN.REACT_FAST_REFRESH)) {
          chain.plugin(CHAIN_ID.PLUGIN.REACT_FAST_REFRESH).tap((options) => {
            options[0] ??= {};
            options[0].include = [/\.([cm]js|[jt]sx?|flow)$/i, MDX_REGEXP];
            return options;
          });
        }

        chain.resolve.extensions.prepend(".md").prepend(".mdx").prepend(".mjs");

        chain.module
          .rule("css-virtual-module")
          .test(/\.rspress[\\/]runtime[\\/]virtual-global-styles/)
          .merge({ sideEffects: true });

        if (isServer) {
          chain.output.filename("main.cjs");
        }
      },
    },
    environments: {
      web: {
        source: {
          entry: {
            index: CLIENT_ENTRY,
          },
          define: {
            "process.env.__SSR__": JSON.stringify(false),
          },
        },
        output: {
          target: "web",
          overrideBrowserslist: webBrowserslist,
          distPath: {
            root: csrOutDir,
          },
        },
      },
      ...(enableSSG
        ? {
            node: {
              source: {
                entry: {
                  index: SERVER_ENTRY,
                },
                define: {
                  "process.env.__SSR__": JSON.stringify(true),
                },
              },
              performance: {
                printFileSize: false,
              },
              output: {
                target: "node",
                overrideBrowserslist: ssrBrowserslist,
                distPath: {
                  root: ssrOutDir,
                },
                minify: false,
              },
            },
          }
        : {}),
    },
  };
}
