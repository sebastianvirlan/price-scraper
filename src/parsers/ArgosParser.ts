import * as cheerio from "cheerio";
import type { IProductParser } from "./IProductParser.js";
import type { IProduct } from "./Types/IProduct.js";
import { Product } from "./Types/Products.js";

export class ArgosParser implements IProductParser {
  parse(html: string, brand: string, size: string): IProduct {
    const $ = cheerio.load(html);
    const title = $('[data-test="product-title"]')
      .text()
      .trim();
    const price = $('li[data-test="product-price-primary"]')
      .text()
      .trim();

    const product = new Product(title, price, brand, true);
    product.setSize(size)

    return product
  }
}