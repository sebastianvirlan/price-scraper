import type { IProduct } from "./Types/IProduct.js";

export interface IProductParser {
  parse(html: string, brand: string, size?: string): IProduct;
}