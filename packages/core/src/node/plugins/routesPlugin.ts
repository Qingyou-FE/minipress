import path from "node:path";
import fastGlob from "fast-glob";
import { RspackVirtualModulePlugin } from "rspack-plugin-virtual-module";
import { normalizePath } from "../toolkit";
import type { RsbuildPlugin } from "@rsbuild/core";

interface RouteMeta {
  routePath: string;
  absolutePath: string;
}

const PLUGIN_DYNAMIC_ROUTES = "plugin-dynamic-routes";

export const pluginDynamicRoutes = (root: string): RsbuildPlugin => {
  const routeService = new RouteService(root);

  return {
    name: PLUGIN_DYNAMIC_ROUTES,

    setup(api) {
      routeService.init();

      api.modifyBundlerChain((rspackChain, { target }) => {
        const isSSR = target === "node";

        rspackChain.plugin(PLUGIN_DYNAMIC_ROUTES).use(
          new RspackVirtualModulePlugin({
            "minipress-routes": routeService.generateRoutesData(isSSR),
          })
        );
      });
    },
  };
};

class RouteService {
  #root: string;
  #routeData: RouteMeta[] = [];

  constructor(root: string) {
    this.#root = root;
  }

  init() {
    const files = fastGlob.sync(["**/*.{js,jsx,ts,tsx,md,mdx}"], {
      absolute: true,
      cwd: this.#root,
      ignore: ["**/node_modules/**"],
    });

    this.#routeData = files.sort().map((file) => {
      return {
        absolutePath: file,
        routePath: this.normalizeRoutePath(
          normalizePath(path.relative(this.#root, file))
        ),
      };
    });
  }

  getRouteMeta(): RouteMeta[] {
    return this.#routeData;
  }

  normalizeRoutePath(path: string) {
    return `/${path.replace(/\.(.*)?$/, "").replace(/\/?index$/, "")}`;
  }

  generateRoutesData(isStaticImport: boolean) {
    const routeImports = this.#routeData
      .map((route, index) =>
        isStaticImport
          ? `import Route${index} from '${route.absolutePath}'`
          : `const Route${index} = lazyWithPreload(() => import('${route.absolutePath}'))`
      )
      .join("\n");

    const routeElements = this.#routeData
      .map(
        (route, index) =>
          `{ path: '${route.routePath}', element: React.createElement(Route${index}), preload: () => import('${route.absolutePath}') }`
      )
      .join(",\n");

    return `
      import React from 'react';
      ${
        isStaticImport
          ? ""
          : `import { lazyWithPreload } from "react-lazy-with-preload";`
      }

      ${routeImports}

      export const routes = [${routeElements}];
    `;
  }
}
