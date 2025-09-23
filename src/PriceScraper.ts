import { firefox, type Browser } from "playwright";
import type { IProductParser } from "./parsers/IProductParser";

export type Parsers = Record<string, { parser: IProductParser; brand: string } >

export class PriceScraper {
  private static browser: Browser | null = null;
  private static _websiteParsers: Parsers

  static async init() {
    if (!this.browser) {
      this.browser = await firefox.launch({ headless: true });
    }
    return this.browser;
  }

  static async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  static setWebsiteParsers(websiteParsers: Parsers) {
    this._websiteParsers = websiteParsers
  }

  static async parse(url: string, size?: string) {
    if(!this._websiteParsers)
      throw new Error(`Call PriceScraper.setWebsiteParsers first`)

    const urlObj = new URL(url);
    const domain = urlObj.origin;

    const website = this._websiteParsers[domain];
    if (!website) throw new Error(`Domain ${domain} not supported!`);

    const browser = await this.init();
    const context = await browser.newContext(); // create fresh context

    const page = await context.newPage();

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      const content = await page.content();

      // await browser.close();

      return website
        ? website.parser.parse(content, website.brand, size)
        : undefined;
    } catch (e: any) {
      console.log(e);
      await context.close();
    } finally {
      await context.close();
    }
  }
}
