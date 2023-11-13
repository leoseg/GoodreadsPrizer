import {BookGoodRead} from "../../entity/bookGoodRead";
import {BookStoreItem} from "../../entity/bookStoreItem";
import {ContentFetcher} from "../contentFetcher";
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

    contentFetcher: ContentFetcher



    /**
     * Returns the store search url
     * @param bookData book data to search for
     */
    getStoreSearchUrl(bookData: BookGoodRead): string;

    /**
     * Returns the url of the book page
     * @param searchResponseData html response of the search result page
     * @param bookName name of the book to search for
     * @param bookAutor author of the book to search for
     */
    getStoreBookUrl(searchResponseData: any, bookName: string,bookAutor:string): string;

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

/**
 * Interface for the book pricer which calls the store scrapers services and updates the book prices
 */
export interface BookPricer{

    /**
     * Returns the list of all prices not already in the booksFromDB
     * @param bookList list of books to get the prices for
     * @param booksFromDB books from the database to compare if prices already there
     */
    scrapeBookPricesListForAllStores(bookList:Array<BookGoodRead>,booksFromDB:Array<BookGoodRead>) : Promise<Array<BookGoodRead>>

    /**
     * Updates the given book with store prices
     * @param book book to update the prices for
     * @param storePricesTag tag of the store to update the prices for
     */
    updateStorePriceForBook(book:BookGoodRead,storePricesTag:string):Promise<BookGoodRead>


}