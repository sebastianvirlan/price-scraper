import axios from "axios";
import { table } from "table";
import { EstateScraper } from "./EstateScrapper.js";
import config from './config.json' with { type: 'json' }

const main = async () => {
  const products = [
    { url: 'https://www.rightmove.co.uk/property-for-sale/find.html?searchLocation=Manchester%2C+Greater+Manchester&useLocationIdentifier=true&locationIdentifier=REGION%5E904&radius=0.0&minPrice=120000&maxPrice=350000&minBedrooms=2&maxBedrooms=3&propertyTypes=detached%2Csemi-detached%2Cterraced&_includeSSTC=on', currentPrice: 85.00, size: 'One Size' },
  ]

  const data = [
    ['DATE', 'WEBSITE', 'PROPERTY', 'PRICE', 'GROUND RENT', 'SERVICE CHARGE', 'URL' ]
  ]

  for(const product of products) {
    const properties = await EstateScraper.parse(product.url);
    if(!properties) return

    for(const property of properties) {
      data.push([
        new Date().toLocaleString(),
        property.getWebsite(),
        property.getPropertyTitle(),
        property.getPrice(),
        property.getGroundRent() ? `£${property.getGroundRent()}` : '-',
        property.getServiceCharge() ? `£${property.getServiceCharge()}` : '-',
        property.getUrl()
      ])

      if (parseFloat(property.getPrice().replace(/[£$,]/g, '')) < product.currentPrice) {
        console.log(`💸 New Property: ${property.getPropertyTitle()} is now ${property.getPrice()}`, `sending notification to Sebastian's iPhone`)
        await sendPushoverNotification(`💸 Price drop`, `${property.getPropertyTitle()} is now ${property.getPrice()}`, product.url);
      }
    }
  }

  console.log(table(data))
  console.log('\n')
};

main();


async function sendPushoverNotification(title: string, message: string, link: string) {
  await axios.post('https://api.pushover.net/1/messages.json', {
    token: config.pushOver.token,
    user: config.pushOver.user,
    url: link,
    url_title: title,
    title,
    message,
  });
}