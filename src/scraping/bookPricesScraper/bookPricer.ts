import {axiosGet} from "../../utils";
import {BookGoodRead} from "../../entity/bookGoodRead";

/**
 * Interface for the store prices
 */
export interface StorePrices {

    storeTag: string;

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
export class BookPricer {

    private storePricesImpl:StorePrices;
    constructor(private storePrices:StorePrices) {
        this.storePricesImpl = storePrices;
    }

    /**
     * Returns the book price list
     * @param bookList list of books to get the prices for
     */
    public async getBookPriceList(bookList:Array<BookGoodRead>){

        const storeSearchResults = await Promise.all(bookList.map(bookData => this.storePricesImpl.getStoreSearchResult(bookData)));

        const urls = storeSearchResults.map((searchResponse, index) => {
            const bookName = bookList[index].title;
            return this.storePricesImpl.getStoreBookUrl(searchResponse.data, bookName);
        })

        const bookPages= await Promise.all(urls.map(url => axiosGet(url)));

        return bookPages.map((page,index) => this.storePricesImpl.getStoreBookData(page.data,urls[index]));

    }
}