export const VERSION = require("../../package.json").version;

export const CONFIG_FILES = [
  "rspress.config.ts",
  "rspress.config.js",
  "_meta.json",
  "i18n.json",
];

export async function loadConfigFile() {
  return {};
}
