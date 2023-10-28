import {axiosGet} from "../../utils";
import {BookGoodRead} from "../../entity/bookGoodRead";
import {BookStoreItem} from "../../entity/bookStoreItem";
import {Container, Service} from "typedi";


export enum StoreTag {
    Thalia = "Thalia",
}

/**
 * Interface for the store prices
 */
export interface StorePrices {

    storeTag: StoreTag;

    searchUrl: string;

    storeItemMapping: Map<string,string>

    storeBaseUrl: string
    /**
     * Returns the html response of the search result page
     * @param bookData book data to search for
     */
    getStoreSearchResult(bookData:BookGoodRead):Promise<any>;

    /**
     * Returns the url of the book page
     * @param searchResponseData html response of the search result page
     * @param bookName name of the book to search for
     */
    getStoreBookUrl(searchResponseData:any,bookName:string):string;

    /**
     * Returns the book data from the book page
     * @param searchResponseData html response of the book page
     * @param url url of the book page
     */
    getStoreBookData(searchResponseData:any,url:string):any;

    /**
     * Returns the search params for the store
     * @param bookData book data to search for
     */
    getStoreSearchParams(bookData:BookGoodRead):string;
}

/**
 * Class for the book pricer gets prices from a store, store type is defined by the storePricesImpl attribute
 */
@Service()
export class BookPricer {


    /**
     * Returns the list of all prices if not allready present scrapes them
     * @param bookList list of books to get the prices for
     */
    public async getBookPricesListForAllStores(bookList:Array<BookGoodRead>) : Promise<Array<BookStoreItem>>{
        const values = Object.values(StoreTag);
        const prices:Array<Array<BookStoreItem>>   =await Promise.all(values.map(async value => {
            return await this.getBookPriceList(bookList.filter(
                book => book.storeItems.filter(storeItem => storeItem.storeTag === value).length === 0
            ),Container.get(value));
        }))
        return prices.flat().concat(bookList.flatMap(book => book.storeItems));
    }
    /**
     * Get the book price list
     * @param bookList list of books to get the prices for
     * @param storePricesImpl storePrices implementation
     */
    public async getBookPriceList(bookList:Array<BookGoodRead>,storePricesImpl:StorePrices){

        const storeSearchResults = await Promise.all(bookList.map(bookData => storePricesImpl.getStoreSearchResult(bookData)));

        const urls = storeSearchResults.map((searchResponse, index) => {
            const bookName = bookList[index].title;
            return storePricesImpl.getStoreBookUrl(searchResponse.data, bookName);
        })

        const bookPages= await Promise.all(urls.map(url => axiosGet(url)));

        return bookPages.map((page,index) => {
            let bookItem : BookStoreItem = storePricesImpl.getStoreBookData(page.data,urls[index])
            bookItem.bookGoodRead = bookList[index]
            return bookItem
        });
    }




}