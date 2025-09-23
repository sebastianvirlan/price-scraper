import * as cheerio from "cheerio";
import type { IEstateParser } from "./IEstateParser.js";
import type { IProperty } from "./Types/IProperty.js";
import { Property } from "./Types/Property.js";

import * as fs from "fs";
import { openInBrowser } from "../EstateScrapper.js";

const IGNORED_FILE = "ignored.json";

const ignoredIds: Set<string> = new Set(
  fs.existsSync(IGNORED_FILE)
    ? JSON.parse(fs.readFileSync(IGNORED_FILE, "utf-8"))
    : []
);

export class RightMoveParser implements IEstateParser {
  parsePLP(html: string): IProperty[] {
    const $ = cheerio.load(html);
    const properties: IProperty[] = [];

    $('[data-testid="results-list"] .propertyCard-details').each(
      (_, element) => {
        const $el = $(element);
        const priceAnchor = $el.find('[data-testid="property-price"]');

        const relativeUrl = priceAnchor.attr("href")?.trim();
        if (!relativeUrl) return;

        const listingUrl = `https://www.rightmove.co.uk${relativeUrl}`;

        const fromAnchor = $el.find('a[id^="prop"]').attr("id");
        const m1 = fromAnchor?.match(/^prop(\d+)$/);
        if (!m1 || !m1[1]) return;

        openInBrowser(listingUrl)

        properties.push(
          new Property(
            m1[1],
            $el.find('[data-testid="property-address"]').text(),
            "RightMove",
            priceAnchor.text(),
            listingUrl
          )
        );
      }
    );

    return properties;
  }

  parse(property: IProperty, html: string): IProperty {
    const $ = cheerio.load(html);
    const scriptContent = $("script")
      .filter((_, el) => !!$(el).html()?.includes("window.PAGE_MODEL ="))
      .first()
      .html();

    if (!scriptContent) {
      console.error("Could not find script with PAGE_MODEL");
      process.exit(1);
    }
    if (scriptContent.includes("window.PAGE_MODEL")) {
      const regex = /window\.PAGE_MODEL\s*=\s*([\s\S]*?)window\.adInfo\s*=/;
      const match = scriptContent.match(regex);

      if (match && match[1]) {
        const pageModel = JSON.parse(match[1]);
        const groundRent =
          pageModel?.propertyData?.livingCosts?.annualGroundRent;
        const serviceCharge =
          pageModel?.propertyData?.livingCosts?.annualServiceCharge;

        if (groundRent) property.setGroundRent(groundRent);

        if (serviceCharge) property.setServiceCharge(serviceCharge);
      } else {
        console.log("Error matching PageModel");
      }
    }

    return property;
  }

  isInStock(html: string, size: string): void {}
}
