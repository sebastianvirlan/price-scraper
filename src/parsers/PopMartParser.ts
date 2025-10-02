import * as cheerio from "cheerio";
import type { IProductParser } from "./IProductParser.js";
import type { IProduct } from "./Types/IProduct.js";
import { Product } from "./Types/Products.js";
import type { Page } from "playwright";

export class PopMartParser implements IProductParser {
  parse(html: string, brand: string, size: string): IProduct {
    let inStock = false
    const $ = cheerio.load(html);
    const title = $('div[class*="topContainer"] h1').text().trim()
    const sizes = $('div[class*="index_sizeContainer"] div[class*="index_sizeInfoItem"]')
    const price = $('div[class*="index_price"]').text()
    sizes.each((_, el) => {
      const $el = $(el)
      const elSize = $el.find('div[class*="index_sizeInfoTitle"]')
      if(elSize.text() === size) {
        if (elSize.attr('class') && elSize.attr('class')?.includes('disabledSizeTitle')) {
          // console.log('Element has the disabledSizeTitle class');
        } else {
          // console.log('Element does NOT have the disabledSizeTitle class');
          inStock = true
        }
      }
    })
    const product = new Product(title, price, brand, inStock);
    product.setSize(size)

    return product;
  }

  async postBrowserAction<T>(page: Page): Promise<void> {
    const countryElement = page.locator('div[class*="index_ipInConutry"]');
    await countryElement.click();

    const policyAcceptElement = page.locator('div[class*="policy_acceptBtn"]');
    await policyAcceptElement.click();

    const sizeElement = page.locator('div[class*="index_sizeInfoItem"]');
    await sizeElement.nth(1).click();
  }
}
