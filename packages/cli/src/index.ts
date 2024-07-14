import chalk from "chalk";
import path from "node:path";
import { cac } from "cac";
import { logger } from "rslog";
import { createDevServer } from "@minipress/core";

const VERSION = require("../package.json").version;
const cli = cac("minipress").version(VERSION).help();

logger.greet(`💥 Minipress v${VERSION}\n`);

cli.option("-c,--config [config]", "Specify the path to the config file");

cli
  .command("[root]", "start dev server")
  .alias("dev")
  .option("--host   [host]", "hostname")
  .option("--port   [port]", "port number")
  .action(
    async (
      root,
      options?: { port?: number; host?: string; config?: string }
    ) => {
      const cwd = process.cwd();

      let devServer: Awaited<ReturnType<typeof createDevServer>>;
      let restartPromise: Promise<void> | undefined;

      process.env.NODE_ENV = "development";

      const startDevServer = async () => {
        const { port, host } = options || {};
        devServer = await createDevServer(
          root,
          { server: { port, host } },
          async (event) => {
            if (!restartPromise) {
              logger.greet(
                `\n✨ ${event.name} ${chalk.green(
                  path.relative(cwd, event.filepath)
                )}, dev server will restart...\n`
              );

              restartPromise = (async () => {
                await devServer.close();
                await startDevServer();
              })().finally(() => {
                restartPromise = undefined;
              });
            }

            return restartPromise;
          }
        );
      };

      await startDevServer();

      const exitProcess = async () => {
        try {
          await devServer.close();
        } finally {
          process.exit(0);
        }
      };

      process.on("SIGINT", exitProcess);
      process.on("SIGTERM", exitProcess);
    }
  );

cli.parse();
