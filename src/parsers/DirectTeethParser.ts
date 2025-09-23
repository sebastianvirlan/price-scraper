import * as cheerio from "cheerio";
import type { IProductParser } from "./IProductParser.js";
import type { IProduct } from "./Types/IProduct.js";
import { Product } from "./Types/Products.js";

export class DirectTeethParser implements IProductParser {
  parse(html: string, brand: string, size: string): IProduct {
    const $ = cheerio.load(html);
    const title = $('div.entry-summary h1.product_title.entry-title')
      .text()
      .trim();
    const price = $('div.entry-summary p.price ins span.woocommerce-Price-amount.amount')
      .text()
      .trim();

    const product = new Product(title, price, brand);
    product.setSize(size)

    return product
  }
}