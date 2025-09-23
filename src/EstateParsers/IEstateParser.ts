import type { IProperty } from "./Types/IProperty.js";

export interface IEstateParser {
  parsePLP(html: string, name: string): IProperty[];
  parse(property: IProperty, html: string): IProperty;
}