import * as cheerio from "cheerio";
import type { IProductParser } from "./IProductParser.js";
import type { IProduct } from "./Types/IProduct.js";
import { Product } from "./Types/Products.js";

export class DIYParser implements IProductParser {
  parse(html: string, brand: string, size: string): IProduct {
    const $ = cheerio.load(html);
    const title = $('#product-info h1[data-testid="product-name"]')
      .text()
      .trim();
    const price = $('#product-info span[data-testid="primary-price"] span[data-testid="product-price"]')
      .text()
      .trim();
    const inStock = this.isInStock(html);

    const product = new Product(title, price, brand, inStock);
    product.setSize(size)

    
    return product
  }

  isInStock(html: string): boolean {
    const $ = cheerio.load(html);
    const script = $('script.sp-browserkit-manifest').html()
    if(script)
      return !script.includes('"availability":"https://schema.org/OutOfStock"');

    return false
  }
}