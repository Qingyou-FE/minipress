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
      api.modifyBundlerChain((rspackChain, { target }) => {
        const isSSR = target === "node";

        routeService.init();
        rspackChain.plugin("plugin-dynamic-routes").use(
          new RspackVirtualModulePlugin({
            "minipress-routes": routeService.generateRoutesCode(isSSR),
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
    const files = fastGlob
      .sync(["**/*.{js,jsx,ts,tsx,md,mdx}"], {
        absolute: true,
        cwd: this.#root,
        ignore: ["**/node_modules/**"],
      })
      .sort();

    files.map((file) => {
      const fileRelativePath = normalizePath(path.relative(this.#root, file));
      const routePath = this.normalizeRoutePath(fileRelativePath);
      this.#routeData.push({
        routePath,
        absolutePath: file,
      });
    });
  }

  getRouteMeta(): RouteMeta[] {
    return this.#routeData;
  }

  normalizeRoutePath(path: string) {
    const routePath = path.replace(/\.(.*)?$/, "").replace(/index$/, "");
    return routePath.startsWith("/") ? routePath : `/${routePath}`;
  }

  generateRoutesCode(isStaticImport: boolean) {
    return `
      import React from 'react';
      ${
        isStaticImport
          ? ""
          : `import { lazyWithPreload } from "react-lazy-with-preload";`
      }

      ${this.#routeData
        .map((route, index) =>
          isStaticImport
            ? `import Route${index} from '${route.absolutePath}'`
            : `const Route${index} = lazyWithPreload(() => import('${route.absolutePath}'))`
        )
        .join("\n")}


      export const routes = [
        ${this.#routeData
          .map((route, index) => {
            return `{ path: '${route.routePath}', element: React.createElement(Route${index}), preload: () => import('${route.absolutePath}') }`;
          })
          .join(",\n")}
      ]
    `;
  }
}
