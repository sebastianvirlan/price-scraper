import * as cheerio from "cheerio";
import type { IProductParser } from "./IProductParser.js";
import { Product } from "./Types/Products.js";
import type { IProduct } from "./Types/IProduct.js";

type VariantAvailability = {
  waist: string;
  length: string;
  available: boolean;
};

type LevisSwatch = {
  code: string;
  colorName: string;
  variantsAvailability: VariantAvailability[];
};

export class LevisParser implements IProductParser {
  parse(html: string, brand: string, size: string): IProduct {
    const $ = cheerio.load(html);

    const title = $("div.product-details__buy-box h1.product-title").text();
    const price = $("div.price-container").attr("data-cnstrc-item-price") ?? "";

    const id = $("div.product-details-page").attr("data-lsco-pdp-product-id");

    const extractSwatches = (js: string): LevisSwatch[] | undefined => {
      const match = js.match(/,"swatches":(\[.*?\])(?=,?"showLoading")/s);
      if (!match || !match[1]) return undefined;

      try {
        return JSON.parse(match[1]); // raw array as string
      } catch (e) {
        return [];
      }
    };

    let inStock = false;
    let swatch : LevisSwatch | undefined
    const splitSize = size.split("-");
    if (splitSize.length === 2) {
      const swatches = extractSwatches(html);
      if (swatches) {
        swatch = swatches.find(
          (swatch: any) => swatch.code === id
        );

        if (swatch) {
          const waist = splitSize[0];
          const length = splitSize[1];

          inStock =
            swatch.variantsAvailability.find(
              (size) => size.waist == waist && size.length == length
            )?.available ?? false;
        }
      }
    }

    const product = new Product(swatch ? `${title} ${swatch.colorName}` : title, price, brand, inStock);
    product.setSize(size);

    return product;
  }
}
