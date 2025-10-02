import type { IProductParser } from "./IProductParser.js";
import { Product } from "./Types/Products.js";
import type { IProduct } from "./Types/IProduct.js";
import axios from "axios";

export interface LeviProductResponse {
  data: {
    product: LeviProduct;
  };
}

export type LeviProduct = {
  name: string;
  code: string;
  colorName: string;
  price: {
    currencyIso: string;
    formattedValue: string;
    value: number;
  };
  variantOptions: LeviProductVariation[];
};

export type LeviProductVariation = {
  code: string;
  colorName: string | null;
  size: string;
  displaySizeDescription: string;
  priceData: {
    currencyIso: string;
    formattedValue: string;
    value: number;
  };
  stock?: {
    stockLevel: number;
    stockLevelStatus: "lowStock" | "inStock";
  };
};

export class LevisParser implements IProductParser {
  parse(productResponse: LeviProduct, brand: string, size: string): IProduct {
    const splitSize = size.split("-");
    const waist = splitSize[0];
    const length = splitSize[1];

    const product = new Product(
      `${productResponse.name} ${productResponse.colorName}`,
      productResponse.price.formattedValue,
      brand,
      productResponse.variantOptions.some(variant => variant.displaySizeDescription === `${waist}W X ${length}L` && variant.stock?.stockLevelStatus === 'inStock')
    );
    product.setSize(size);

    return product;
  }

  async fetchApiData(productSku: string): Promise<LeviProduct> {
    try {
      const response = await axios.post<LeviProductResponse>(
        "https://www.levi.com/nextgen-webhooks/?operationName=product&locale=GB-en_GB",
        {
          operationName: "product",
          variables: {
            code: productSku,
          },
          query: `
          query product($code: String!) {
            product(code: $code) {
              name
              code
              colorName
              price {
                currencyIso
                formattedValue
                value
              }
              variantOptions {
                code
                colorName
                displaySizeDescription
                priceData {
                  currencyIso
                  formattedValue
                  value
                }
                stock {
                  stockLevel
                  stockLevelStatus
                }
              }
            }
          }
        `,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-client": "LMA",
            "x-operationname": "product",
            "x-sessionid": "dummy",
            "User-Agent": "LeviStraussEurope/8.13.1/AppiOS26.0",
            "x-locale": "en_GB",
            "x-country": "GB",
          },
        }
      );

      return response.data.data.product
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      throw error;
    }
  }
}
