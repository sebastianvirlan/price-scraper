import type { Page } from "playwright";
import type { IProduct } from "./Types/IProduct.js";

export interface IProductParser {
  parse(data: any, brand: string, size?: string): IProduct;
  fetchApiData?<T>(productSku: string): Promise<any>;
  postBrowserAction?<T>(page: Page): Promise<void>;
}