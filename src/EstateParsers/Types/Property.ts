import type { IProperty } from "./IProperty.js"

export class Property implements IProperty {
  private _id: string
  private _website: string
  private _price: string
  private _url: string
  private _propertyTitle: string
  private _groundRent?: string | undefined
  private _serviceCharge?: string | undefined

  constructor(id: string, title: string, website: string, price: string, url: string, groundRent?: string | undefined, serviceCharge?: string | undefined) {
    this._id = id
    this._propertyTitle = title
    this._website = website
    this._price = price
    this._url = url
    this._groundRent = groundRent
    this._serviceCharge = serviceCharge
  }

  getID() {
    return this._id
  }

  getWebsite() {
    return this._website
  }

  getPropertyTitle() {
    return this._propertyTitle
  }

  getPrice() {
    return this._price
  }

  getUrl() {
    return this._url
  }

  getGroundRent() {
    return this._groundRent
  }

  setGroundRent(groundRent: string) {
    this._groundRent = groundRent
    return this._groundRent
  }

  getServiceCharge() {
    return this._serviceCharge
  }

  setServiceCharge(serviceCharge: string) {
    this._serviceCharge = serviceCharge
    return this._serviceCharge
  }
}