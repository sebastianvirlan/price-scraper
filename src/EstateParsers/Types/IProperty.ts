export interface IProperty {
  getID: () => string;
  getWebsite: () => string;
  getPropertyTitle: () => string;
  getPrice: () => string;
  getUrl: () => string;
  getGroundRent: () => string | undefined;
  setGroundRent: (groundRent: string) => string;
  getServiceCharge: () => string | undefined;
  setServiceCharge: (serviceCharge: string) => string;
}