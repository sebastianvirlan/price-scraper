import { firefox } from "playwright";
import { RightMoveParser } from "./EstateParsers/RightMoveParser.js";
import type { IEstateParser } from "./EstateParsers/IEstateParser.js";
import { exec } from "child_process";

const WEBSITE_PARSERS: Record<
  string,
  { parser: IEstateParser; brand: string }
> = {
  "https://www.rightmove.co.uk": {
    parser: new RightMoveParser(),
    brand: "RightMove",
  },
};

export class EstateScraper {
  static async parse(url: string) {
    const urlObj = new URL(url);
    const domain = urlObj.origin;

    const website = WEBSITE_PARSERS[domain];
    if (!website) throw new Error(`Domain ${domain} not supported!`);

    const browser = await firefox.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.waitForLoadState("networkidle");


    const content = await page.content();

    const properties = website.parser.parsePLP(content, website.brand);

    for(const property of properties) {
      await page.goto(property.getUrl(), {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      const propertyContent = await page.content();
      website.parser.parse(property, propertyContent)
    }

    await browser.close();

    return properties;
  }
}

export function openInBrowser(url: string) {
  exec(`open "${url}"`);
}