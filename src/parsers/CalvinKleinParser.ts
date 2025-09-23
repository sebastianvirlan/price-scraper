import * as cheerio from "cheerio";
import type { IProductParser } from "./IProductParser.js";
import type { IProduct } from "./Types/IProduct.js";
import { Product } from "./Types/Products.js";

export class CalvinKleinParser implements IProductParser {
  parse(html: string, brand: string, size: string): IProduct {
    const $ = cheerio.load(html);
    const title = $('[data-testid="ProductHeader-ProductName-typography-h1"]')
      .text()
      .trim();
    const price = $('[data-testid="ProductHeaderPrice-PriceText"]')
      .text()
      .trim();
    const inStock = this.isInStock(html, size);

    const product = new Product(title, price, brand, inStock);
    product.setSize(size)

    return product
  }

  isInStock(html: string, size: string): boolean {
    const $ = cheerio.load(html);
    const jsonText = $("#__NEXT_DATA__").html();
    const pageIdentifier = $('meta[name="pageIdentifier"]').attr('content');

    if(!pageIdentifier) return false
  
    try {
      const data = JSON.parse(jsonText || "");
      const variant = data.props.pageProps.initialState.api.queries[
        `getProduct({"identifier":"${pageIdentifier}","usePriorPriceApi":true})`
      ].data.data.variants.find((variant: any) => variant.size == size);
      if (variant) return variant.stockAvailability;
      else return false;
    } catch (err) {
      console.error("Failed to parse __NEXT_DATA__ JSON:", err);
      return false
    }
  }
}