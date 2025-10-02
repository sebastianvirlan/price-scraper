import { firefox, type Browser } from "playwright";
import type { IProductParser } from "./parsers/IProductParser";
import { extractDomain } from "./util/extractDomain";

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

  static async parse(product: { url: string, productSku?: string, size?: string, type?: string, timeout?: number } ) {
    if(!this._websiteParsers)
      throw new Error(`No parsers available. Call PriceScraper.setWebsiteParsers first`)

    const domain = extractDomain(product.url);
    const parser = this._websiteParsers[domain];

    if (!parser) throw new Error(`Domain ${domain} not supported!`);

    if(product.type === 'API' && product.productSku && parser.parser.fetchApiData) {
      const productData = await parser.parser.fetchApiData(product.productSku)
      return parser.parser.parse(productData, parser.brand, product.size)
    } else {
      const browser = await this.init();
      const context = await browser.newContext(); // create fresh context
      const page = await context.newPage();

      try {
        await page.goto(product.url, { waitUntil: 'domcontentloaded', timeout: product.timeout ?? 0 }); // waits until network activity stops
        await parser.parser.postBrowserAction?.(page)
        const content = await page.content();
        return parser.parser.parse(content, parser.brand, product.size)
      } catch (e: any) {
        console.log(e);
        await context.close();
      } finally {
        await context.close();
      }
    }
  }
}
