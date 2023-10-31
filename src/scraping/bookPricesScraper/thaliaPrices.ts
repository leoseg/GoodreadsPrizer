import * as cheerio from 'cheerio';
import {axiosGet} from "../../utils";
import {BookStoreItem} from "../../entity/bookStoreItem";
import {BookGoodRead} from "../../entity/bookGoodRead";
import {Service} from "typedi";
import {StorePrices, StoreTag} from "./priceInterfaces";

/**
 * Implementation of the StorePrices interface for the Thalia store
 */
@Service(StoreTag.Thalia)
export class ThaliaPrices implements StorePrices{

    storeTag: StoreTag = StoreTag.Thalia
    searchUrl = "https://www.thalia.de/suche?sq=";
    storeItemMapping: Map<string,string> = new Map<string,string>([
        ["Gebundenes Buch","price"],
        ["eBook","priceEbook"],
        ["Taschenbuch","pricePaperback"]
        ]);
    storeBaseUrl: string = "https://www.thalia.de"

    async getStoreSearchResult(bookData: BookGoodRead): Promise<any> {
        const url = this.searchUrl + this.getStoreSearchParams(bookData)
        return axiosGet(url);
    }

    getStoreSearchParams(bookData: BookGoodRead): string {
        let author_param =bookData.author.split(',').reverse().join('+');
        return bookData.title.split(" ").join("+") + "+" + author_param;
    }

    getStoreBookUrl(searchResponseData: any,bookName:string):string{
        const $ = cheerio.load(searchResponseData);
        let link;
        $('.tm-produktliste__eintrag.artikel').each(function() {
            const productName = $(this).find('dl-product').attr('name');
            if (productName && productName.includes(bookName)) {
                link = $(this).find('a.element-link-toplevel.tm-produkt-link').attr('href');
                return false; // breaks out of the .each() loop since we've found the link
            }
        });
        if(link){
            return this.storeBaseUrl+link;
        }else{
            throw new Error("No book found in scraped page.");
        }

    }

    getStoreBookData(searchResponseData:any,url:string) :BookStoreItem{
        const $ = cheerio.load(searchResponseData);
        let bookData : BookStoreItem = new BookStoreItem();
        let self = this
        $(".element-struktur-kachel-standard.hauptformat").each(function() {
            const caption = $(this).attr('caption');
            if (caption && self.storeItemMapping.has(caption)) {
                const mappedValue = self.storeItemMapping.get(caption) as "price" | "priceEbook" | "pricePaperback";
                if(mappedValue) {
                    bookData[mappedValue] = $(this).find('strong.element-text-small-strong').text().replace(/\s+/g, ' ').trim()
                }
            }
        });
        bookData.storeID = url.split("/").pop() as string
        bookData.url = url
        bookData.storeTag = this.storeTag
        return bookData
    }

}


