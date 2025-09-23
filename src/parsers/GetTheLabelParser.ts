import * as cheerio from "cheerio"
import type { IProductParser } from "./IProductParser.js"
import type { IProduct } from "./Types/IProduct.js"
import { Product } from "./Types/Products.js"

export class GetTheLabelParser implements IProductParser {
  parse(html: string, brand: string, size: string): IProduct {
    const $ = cheerio.load(html)
    const details = $("div.details")

    const title = details.find('h1[itemprop="name"]').text().trim()
    const price = details
      .find('span.price-now[itemprop="price"]')
      .text()
      .trim()
    const inStock = this.isInStock($, size)

    const product = new Product(title, price, brand, inStock)
    product.setSize(size)

    return product
  }

  isInStock($: cheerio.CheerioAPI, size: string): boolean {
    const details = $("div.attributes div.options label.icon")

    let inStock = false

    details.each((_, el) => {
      const $el = $(el)
      const labelSize = $el.find("span").text().trim()

      if (labelSize === size) {
        const input = $el.find("input")
        const disabled = input.is("[disabled]")
        const stock = input.attr("data-stock")
        if (!disabled && stock !== "0") {
          inStock = true
        }
      }
    })

    return inStock
  }
}
