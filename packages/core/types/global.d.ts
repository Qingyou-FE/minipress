import type { RsbuildConfig } from "@rsbuild/core";
import type { LocaleSpecificConfig } from "@minipress/shared";

export interface RouteConfig {
  /**
   * Exclude files from being converted to routes
   */
  exclude?: string[];
  /**
   * use links without .html files
   */
  cleanUrls?: boolean;
}

export interface UserConfig<ThemeConfig = DefaultThemeConfig>
  extends LocaleSpecificConfig<ThemeConfig> {
  /**
   * Base path of the site.
   */
  base?: string;
  /**
   * Output directory
   */
  outDir?: string;
  /**
   * I18n config of the site.
   */
  locales?: LocaleConfig<ThemeConfig>;
  /**
   * Custom theme directory
   */
  themeDir?: string;
  /**
   * The custom config of vite-plugin-route
   */
  routeConfig?: RouteConfig;
  /**
   * Rsbuild Configuration
   */
  rsbuildConfig?: RsbuildConfig;
  /**
   * Add some extra rsbuild plugins
   */
  rsbuildPlugins?: RsbuildPlugin[];
}

export async function createDevServer(
  root: string,
  extraConfig?: RsbuildConfig,
  restartServer?: (event: { name: string; filepath: string }) => Promise<void>
): Promise<ServerInstance>;
