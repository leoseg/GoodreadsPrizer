import {BookGoodRead} from "../../entity/bookGoodRead";
import {BookStoreItem} from "../../entity/bookStoreItem";

export enum StoreTag {
    Thalia = "Thalia",
}

/**
 * Interface for the store prices
 */
export interface StorePrices {

    storeTag: StoreTag;

    searchUrl: string;

    storeItemMapping: Map<string, string>

    storeBaseUrl: string

    /**
     * Returns the html response of the search result page
     * @param bookData book data to search for
     */
    getStoreSearchResult(bookData: BookGoodRead): Promise<any>;

    /**
     * Returns the url of the book page
     * @param searchResponseData html response of the search result page
     * @param bookName name of the book to search for
     */
    getStoreBookUrl(searchResponseData: any, bookName: string): string;

    /**
     * Returns the book data from the book page
     * @param searchResponseData html response of the book page
     * @param url url of the book page
     */
    getStoreBookData(searchResponseData: any, url: string): BookStoreItem;

    /**
     * Returns the search params for the store
     * @param bookData book data to search for
     */
    getStoreSearchParams(bookData: BookGoodRead): string;
}

export interface BookPricer{
    scrapeBookPricesListForAllStores(bookList:Array<BookGoodRead>,booksFromDB:Array<BookGoodRead>) : Promise<Array<BookGoodRead>>

    updateStorePriceForBook(book:BookGoodRead,storePricesTag:string):Promise<BookGoodRead>
}