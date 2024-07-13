import fs from "fs-extra";
import path from "node:path";
import chokidar from "chokidar";
import { createRsbuildConfig, loadUserConfig } from "./config";
import { CONFIG_FILES, MINIPRESS_TEMP_DIR } from "./common/constants";

import type { RsbuildConfig } from "@rsbuild/core";

interface ServerInstance {
  close: () => Promise<void>;
}

interface RestartServerEvent {
  name: string;
  filepath: string;
}

export async function createDevServer(
  root: string = process.cwd(),
  extraConfig: RsbuildConfig = {},
  restartServer?: (event: RestartServerEvent) => Promise<void>
): Promise<ServerInstance> {
  const config = await loadUserConfig(root);

  const { createRsbuild, mergeRsbuildConfig } = await import("@rsbuild/core");

  const defaultConfig = await createRsbuildConfig(config, false);

  const { rsbuildConfig = {}, rsbuildPlugins = [] } = config;

  const rsbuild = await createRsbuild({
    rsbuildConfig: mergeRsbuildConfig(
      defaultConfig,
      rsbuildConfig,
      extraConfig
    ),
  });

  rsbuild.addPlugins(rsbuildPlugins);

  const { server } = await rsbuild.startDevServer({
    getPortSilently: true,
  });

  const cliWatcher = chokidar.watch(
    [`${root}/**/{${CONFIG_FILES.join(",")}}`, config.root],
    {
      ignoreInitial: true,
      ignored: ["**/node_modules/**", "**/.git/**", "**/.DS_Store/**"],
    }
  );

  cliWatcher.on("all", async (eventName, filepath) => {
    if (
      eventName === "add" ||
      eventName === "unlink" ||
      (eventName === "change" && CONFIG_FILES.includes(path.basename(filepath)))
    ) {
      if (restartServer) {
        return await restartServer({
          name: eventName,
          filepath,
        });
      }
    }
  });

  return {
    async close() {
      await server.close();
      await cliWatcher.close();
    },
  };
}
