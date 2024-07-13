import fs from "fs-extra";
import path from "node:path";
import { MINIPRESS_TEMP_DIR } from "../common/constants";
import { createInternalBuildConfig } from "./createRsbuildConfig";

import type { RsbuildInstance, RsbuildConfig } from "@rsbuild/core";
import type { UserConfig } from "../../../types/global";

export async function initRsbuild(
  root: string,
  config: UserConfig,
  enableSSG: boolean,
  extraRsbuildConfig?: RsbuildConfig
): Promise<RsbuildInstance> {
  const cwd = process.cwd();
  const userDocRoot = path.resolve(root || config?.root || cwd);
  const runtimeTempDir = path.join(
    cwd,
    "node_modules",
    MINIPRESS_TEMP_DIR,
    "runtime"
  );

  await fs.ensureDir(runtimeTempDir);

  const { createRsbuild, mergeRsbuildConfig } = await import("@rsbuild/core");

  const defaultConfig = await createInternalBuildConfig(
    userDocRoot,
    config,
    enableSSG,
    runtimeTempDir
  );

  const { rsbuildConfig = {}, rsbuildPlugins = [] } = config;

  const rsbuild = await createRsbuild({
    rsbuildConfig: mergeRsbuildConfig(
      defaultConfig,
      rsbuildConfig,
      extraRsbuildConfig || {}
    ),
  });

  rsbuild.addPlugins(rsbuildPlugins);

  return rsbuild;
}
