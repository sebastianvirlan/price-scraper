import * as cheerio from "cheerio"
import type { IProductParser } from "./IProductParser.js"
import type { IProduct } from "./Types/IProduct.js"
import { Product } from "./Types/Products.js"

export class HouseOfFraserParser implements IProductParser {
  parse(html: string, brand: string, size: string): IProduct {
    const $ = cheerio.load(html)
    const details = $("#productDetails")

    const title = details.find('div.title-container').text().trim().replace(/\s+/g, ' ')
    const price = details
      .find('span#lblSellingPrice')
      .text()
      .trim()
    const inStock = this.isInStock($, size)

    const product = new Product(title, price, brand, inStock)
    product.setSize(size)

    return product
  }

  isInStock($: cheerio.CheerioAPI, size: string): boolean {
    const details = $("ul#ulSizes li")

    let inStock = false

    details.each((_, el) => {
      const $el = $(el)
      const labelSize = $el.attr("data-text")

      if (labelSize === size) {
        const input = $el.find("input")
        // const disabled = input.is("[disabled]")
        const stock = input.attr("data-stock-qty")
        if (stock !== "0") {
          inStock = true
        }
      }
    })

    return inStock
  }
}
