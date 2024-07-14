import path from "node:path";
import chokidar from "chokidar";
import { CONFIG_FILES, MINIPRESS_TEMP_DIR } from "./constant";
import { createRsbuildConfig, loadUserConfig } from "./config";
import type { RsbuildConfig } from "@rsbuild/core";

interface DevServer {
  close: () => Promise<void>;
}

interface RestartEvent {
  name: string;
  filepath: string;
}

export async function createDevServer(
  root: string = process.cwd(),
  extraConfig: RsbuildConfig = {},
  restartServer?: (event: RestartEvent) => Promise<void>
): Promise<DevServer> {
  const config = await loadUserConfig(root);

  const { createRsbuild, mergeRsbuildConfig } = await import("@rsbuild/core");
  const { rsbuildConfig = {}, rsbuildPlugins = [] } = config;

  const defaultConfig = await createRsbuildConfig(config, false);

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
    [`${root}/**/{${CONFIG_FILES.join(",")}}`, config.root || "", `${root}/${MINIPRESS_TEMP_DIR}`],
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
        await restartServer({
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
