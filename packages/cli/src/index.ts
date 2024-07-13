import chalk from "chalk";
import color from "picocolors";
import chokidar from "chokidar";
import { cac } from "cac";
import { logger } from "rslog";
import { VERSION, CONFIG_FILES, loadConfigFile } from "./config";

logger.greet(`💥 Minipress v${VERSION}\n`);

const cli = cac("minipress").version(VERSION).help();

cli.option("-c,--config [config]", "Specify the path to the config file");

cli
  .command("[root]", "start dev server")
  .alias("dev")
  .option("--host   [host]", "hostname")
  .option("--port   [port]", "port number")
  .option("--config [port]", "custom config")
  .action(
    async (
      root,
      options?: { port?: number; host?: string; config?: string }
    ) => {
      process.env.NODE_ENV = "development";

      let isRestarting = false;
      let docDirectory: string;
      let cliWatcher: chokidar.FSWatcher;
      let devServer: Awaited<ReturnType<typeof dev>>;

      const cwd = process.cwd();

      const startDevServer = async () => {
        const { port, host } = options || {};
        const config = await loadConfigFile(options?.config);

        if (root) {
          // Support root in command, override config file
          config.root = path.join(cwd, root);
        } else if (config.root && !path.isAbsolute(config.root)) {
          // Support root relative to cwd
          config.root = path.join(cwd, config.root);
        }

        docDirectory = config.root || path.join(cwd, root ?? "docs");
        devServer = await dev({
          appDirectory: cwd,
          docDirectory,
          config,
          extraBuilderConfig: { server: { port, host } },
        });
        cliWatcher = chokidar.watch(
          [`${cwd}/**/{${CONFIG_FILES.join(",")}}`, docDirectory!],
          {
            ignoreInitial: true,
            ignored: ["**/node_modules/**", "**/.git/**", "**/.DS_Store/**"],
          }
        );
        cliWatcher.on("all", async (eventName, filepath) => {
          if (
            eventName === "add" ||
            eventName === "unlink" ||
            (eventName === "change" &&
              CONFIG_FILES.includes(path.basename(filepath)))
          ) {
            if (isRestarting) {
              return;
            }
            isRestarting = true;
            console.log(
              `\n✨ ${eventName} ${chalk.green(
                path.relative(cwd, filepath)
              )}, dev server will restart...\n`
            );
            await devServer.close();
            await cliWatcher.close();
            await startDevServer();
            isRestarting = false;
          }
        });
      };

      await startDevServer();

      const exitProcess = async () => {
        try {
          await devServer.close();
          await cliWatcher.close();
        } finally {
          process.exit(0);
        }
      };

      process.on("SIGINT", exitProcess);
      process.on("SIGTERM", exitProcess);
    }
  );

cli.parse();
