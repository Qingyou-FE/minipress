export type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string];

export interface LocaleSpecificConfig<ThemeConfig> {
  /**
   * Language of the site.
   */
  lang?: string;
  /**
   * Title of the site.
   */
  title?: string;
  /**
   * Head tags.
   */
  head?: HeadConfig[];
  /**
   * Description of the site.
   */
  description?: string;
  /**
   * Theme config.
   */
  themeConfig?: ThemeConfig;
}

declare function removeLeadingSlash(url: string): string;
declare function removeTrailingSlash(url: string): string;
