import type { IProduct } from "./IProduct.js"

export class Product implements IProduct {
  private _price: string
  private _title: string
  private _brand: string
  private _size?: string
  private _inStock: boolean | undefined

  constructor(title: string, price: string, brand: string, inStock?: boolean | undefined) {
    this._title = title
    this._price = price
    this._brand = brand
    this._inStock = inStock
  }

  getProductTitle() {
    return this._title
  }

  setSize(size: string) {
    this._size = size
  }

  getSize() {
    return this._size
  }

  getPrice() {
    return this._price
  }

  getBrand() {
    return this._brand
  }

  getInStock() {
    return this._inStock
  }
}