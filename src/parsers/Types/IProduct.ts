export interface IProduct {
  getProductTitle: () => string;
  getPrice: () => string;
  getBrand: () => string;
  getSize: () => string | undefined;
  getInStock: () => boolean | undefined;
}