import axios from "axios";

export interface StorePrices {

    searchUrl: string;

    getStoreSearchResult(bookData:Array<string>):Promise<any>;

    getStoreBookUrl(searchResponseData:any,bookName:string):string;

    getStoreBookData(searchResponseData:any):any;

    getStoreSearchParams(bookData:Array<string>):string;
}


export class BookPricer {

    private storePricesImpl:StorePrices;
    constructor(private storePrices:StorePrices) {
        this.storePricesImpl = storePrices;
    }

    public async getBookPriceList(bookList:Array<Array<string>>){

        const storeSearchResults = await Promise.all(bookList.map(bookData => this.storePricesImpl.getStoreSearchResult(bookData)));

        const urls = storeSearchResults.map((searchResponseData, index) => {
            const bookName = bookList[index][0];
            return this.storePricesImpl.getStoreBookUrl(searchResponseData, bookName);
        })

        const bookPages= await Promise.all(urls.map(url => axios.get(url)));

        return bookPages.map(page => this.storePricesImpl.getStoreBookData(page.data));

    }
}