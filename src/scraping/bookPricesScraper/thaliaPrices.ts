import axios from "axios";
import {userAgents} from "../goodreadsBooksScraper/scrapeBooksConfigs";
import * as cheerio from 'cheerio';
import {StorePrices} from "./bookPricer";
class ThaliaPrices implements StorePrices{

    storeTag: string = "Thalia"
    searchUrl = "https://www.thalia.de/suche?sq=";
    async getStoreSearchResult(bookData: Array<string>): Promise<any> {
        const url = this.searchUrl + this.getStoreSearchParams(bookData)
        return axios.get(url,
            {
                headers : {"User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)]}
            })
            .then(response => {
                return response.data
            })
            .catch(error => {
                console.log(error)
            })
    }


    getStoreSearchParams(bookData: Array<string>): string {
        const [author, title, isbn, isbn13] = bookData;
        if(isbn13 != ""){
            return isbn13
        }
        if(isbn != ""){
            return isbn
        }
        let author_param =author.split(',').reverse().join('+');
        return title + "+" + author_param;
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
            return link;
        }else{
            throw new Error("No book found in scraped page.");
        }

    }


    getStoreBookData(searchResponseData:any){
        const $ = cheerio.load(searchResponseData);
        let bookData : {[index: string]:any} = {}

        $(".element-struktur-kachel-standard.hauptformat").each(function() {
            const caption = $(this).attr('caption');
            if(caption && bookData.hasOwnProperty(caption.replace(/\s/g, ''))){
                bookData[caption] = $(this).find('strong.element-text-small-strong').text().trim();
            }
        });

        return bookData
    }

}


