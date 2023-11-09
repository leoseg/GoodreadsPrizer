import * as cheerio from 'cheerio';
import {BookStoreItem} from "../../entity/bookStoreItem";
import {BookGoodRead} from "../../entity/bookGoodRead";
import {Container, Service} from "typedi";
import {StorePrices, StoreTag} from "./priceInterfaces";
import {ContentFetcher, PuppeteerFetcher} from "../contentFetcher";
import {findBestMatch,compareTwoStrings} from "string-similarity";
import {normalizeString} from "../scrappingUtils";
/**
 * Implementation of the StorePrices interface for the Thalia store
 */
@Service()
export class ThaliaPrices implements StorePrices{

    storeTag: StoreTag = StoreTag.Thalia
    searchUrl = "https://www.thalia.de/suche?sq=";
    storeItemMapping: Map<string,string> = new Map<string,string>([
        ["Gebundenes Buch","price"],
        ["eBook","priceEbook"],
        ["Taschenbuch","pricePaperback"]
        ]);
    storeBaseUrl: string = "https://www.thalia.de"
    contentFetcher: ContentFetcher = Container.get(PuppeteerFetcher)

    getStoreSearchUrl(bookData: BookGoodRead): string {
        return this.searchUrl + this.getStoreSearchParams(bookData)
    }

    getStoreSearchParams(bookData: BookGoodRead): string {
        let author_param =bookData.author.split(',').reverse().join('+');
        return bookData.title.split(" ").join("+") + "+" + author_param;
    }

    getStoreBookUrl(searchResponseData: any,bookName:string,bookAutor:string):string{
        const $ = cheerio.load(searchResponseData);
        let products: any = []
        $('.tm-produktliste__eintrag.artikel').each(function() {
            const productName = $(this).find('dl-product').attr('name');
            const productAuthor = $(this).find('.tm-artikeldetails__autor').text().trim()
            if(productName && productAuthor){
                const link = $(this).find('a.element-link-toplevel.tm-produkt-link').attr('href');
                const product = {
                    name: normalizeString(productName),
                    author: normalizeString(productAuthor),
                    link: link
                }
                products.push(product)
            }
        });
        const authorThaliaFormat = normalizeString(bookAutor.split(",").reverse().join(" ").trim())
        const normalizedTitel = normalizeString(bookName)
        products = products.filter(
            product=> {
                return compareTwoStrings(product.author,authorThaliaFormat) >= 0.8;
            }
        )
        if(products.length === 0 ){
            console.log("No book found for "+bookName)
            return ""
        }
        //find best match
        const matches = findBestMatch(normalizedTitel,products.map(element => element.name))
        if(matches.bestMatch.rating >= 0.8){
            return this.storeBaseUrl+products[matches.bestMatchIndex].link;
        }else if(matches.bestMatch.target.includes(normalizedTitel) || normalizedTitel.includes(matches.bestMatch.target)){
            return this.storeBaseUrl+products[matches.bestMatchIndex].link;
        }else{
            console.log("No book found for "+bookName)
            return ""
        }
    }

    getStoreBookData(searchResponseData:any,url:string) :BookStoreItem{
        const $ = cheerio.load(searchResponseData);
        let bookData : BookStoreItem = new BookStoreItem();
        let self = this
        const elements = $(".element-struktur-kachel-standard.hauptformat")
        elements.each(function() {
            const caption = $(this).attr('caption');
            if (caption && self.storeItemMapping.has(caption)) {
                const mappedValue = self.storeItemMapping.get(caption) as "price" | "priceEbook" | "pricePaperback";
                if(mappedValue) {
                    bookData[mappedValue] = $(this).find('strong.element-text-small-strong').text().replace(/\s+/g, ' ').trim()
                }
            }
        });
        if(elements.length === 0){
            bookData.price = $('.preis .element-headline-medium').first().text().trim();
        }
        bookData.storeID = url.split("/").pop() as string
        bookData.url = url
        bookData.storeTag = this.storeTag
        return bookData
    }


}


