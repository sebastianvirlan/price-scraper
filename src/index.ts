import axios from "axios";
import { PriceScraper } from "./PriceScraper.js";
import { table } from "table";
import { ArgosParser } from "./parsers/ArgosParser.js";
import { CalvinKleinParser } from "./parsers/CalvinKleinParser.js";
import { DirectTeethParser } from "./parsers/DirectTeethParser.js";
import { DIYParser } from "./parsers/DIYParser.js";
import { GetTheLabelParser } from "./parsers/GetTheLabelParser.js";
import { HouseOfFraserParser } from "./parsers/HouseOfFraserParser.js";
import type { IProductParser } from "./parsers/IProductParser.js";
import { LevisParser } from "./parsers/LevisParser.js";
import { TommyHilfigerParser } from "./parsers/TommyHilfigerParser.js";
import config from './config.json' with { type: 'json' }
import { PopMartParser } from "./parsers/PopMartParser.js";

const main = async () => {

  const WEBSITE_PARSERS: Record<
    string,
    { parser: IProductParser; brand: string }
  > = {
    "https://uk.tommy.com": {
      parser: new TommyHilfigerParser(),
      brand: "Tommy Hilfiger",
    },
    "https://www.calvinklein.co.uk": {
      parser: new CalvinKleinParser(),
      brand: "Calvin Klein",
    },
    "https://www.argos.co.uk": {
      parser: new ArgosParser(),
      brand: "Argos",
    },
    "https://www.getthelabel.com": {
      parser: new GetTheLabelParser(),
      brand: "GetTheLabel",
    },
    "https://www.houseoffraser.co.uk": {
      parser: new HouseOfFraserParser(),
      brand: "GetTheLabel",
    },
    "https://www.levi.com": {
      parser: new LevisParser(),
      brand: "Levi's"
    },
    "https://www.directteethwhitening.io": {
      parser: new DirectTeethParser(),
      brand: "Direct Teeth Whitening"
    },
    "https://www.diy.com": {
      parser: new DIYParser(),
      brand: "B and Q"
    },
    "https://www.popmart.com": {
      parser: new PopMartParser(),
      brand: "PopMart"
    }
  };

  const data = [
    ['DATE', 'SELLER', 'PRODUCT TITLE', 'PRODUCT SIZE', 'IN STOCK', 'INITIAL PRICE', 'CURRENT PRICE' ]
  ]

  PriceScraper.setWebsiteParsers(WEBSITE_PARSERS)

  for(const product of config.products) {
    const currentHour = new Date().getHours()

    if(!product.hours?.includes(currentHour)) {
      if(!config.hours.includes(currentHour)) { continue }
    }

    const parsedProduct = await PriceScraper.parse(product)

    if(!parsedProduct) return
    data.push([
      new Date().toLocaleString(),
      parsedProduct.getBrand(),
      parsedProduct.getProductTitle(),
      parsedProduct.getSize() ?? '-',
      ({ true: 'Y', false: 'N' }[String(parsedProduct.getInStock())] ?? 'UNKNOWN'),
      `£${product.currentPrice}`,
      parsedProduct.getPrice(),
    ])

    if (!product.disabledNotification && parsedProduct.getInStock() && parseFloat(parsedProduct.getPrice().replace(/[£$,]/g, '')) < product.currentPrice) {
      console.log(`💸 Price drop: ${parsedProduct.getProductTitle()} is now ${parsedProduct.getPrice()}`, `sending notification to Sebastian's iPhone`)
      await sendPushoverNotification(`💸 Price drop`, `${parsedProduct.getProductTitle()} is now ${parsedProduct.getPrice()}. Stock: ${parsedProduct.getInStock() ? 'Yes' : 'No'}`, product.url);
    }
  }

  await PriceScraper.close();

  console.log(table(data))
  console.log('\n')
}

main();


export async function sendPushoverNotification(title: string, message: string, link: string) {
  await axios.post('https://api.pushover.net/1/messages.json', {
    token: config.pushOver.token,
    user: config.pushOver.user,
    url: link,
    url_title: title,
    title,
    message,
  });
}