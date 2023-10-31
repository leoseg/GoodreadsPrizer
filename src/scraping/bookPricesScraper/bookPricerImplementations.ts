import {axiosGet} from "../../utils";
import {BookGoodRead} from "../../entity/bookGoodRead";
import {BookStoreItem} from "../../entity/bookStoreItem";
import {Container, Service} from "typedi";
import {BookPricer, StorePrices, StoreTag} from "./priceInterfaces";


/**
 * Class for the book pricer gets prices from a store, store type is defined by the storePricesImpl attribute
 */
@Service("AsyncPricer")
export class AsyncPricer implements BookPricer{


    /**
     * Returns the list of all prices not already in the bookList
     * @param bookList list of books to get the prices for
     * @param booksFromDB books from the database to compare if prices already there
     */
    public async scrapeBookPricesListForAllStores(bookList:Array<BookGoodRead>,booksFromDB:Array<BookGoodRead>) : Promise<Array<BookGoodRead>>{
        const tags = Object.values(StoreTag);
        const authorTitleMap = new Map();
        booksFromDB.forEach(obj => {
          obj.storeItems.forEach(
            storeItem => {
                const key = `${obj.author}-${obj.title}-${storeItem.storeTag}`;
                authorTitleMap.set(key, storeItem);
            }
          )
        });
        // If book has already a item for that store pushes this to the booklist else scrape from the score
        return Promise.all(bookList.map(
            async book => {
                await Promise.all(
                    tags.map(async tag => {
                        const bookFromDBItem = authorTitleMap.get(`${book.author}-${book.title}-${tag}`)
                        if(bookFromDBItem){
                            book.storeItems.push(bookFromDBItem)
                        }
                        else{
                            book = await this.updateStorePriceForBook(book,tag)
                        }
                        return book
                    })
                )
                return book}
        ))

    }
    /**
     * Updates the given book list with store prices
     * @param bookList list of books to update the prices for
     * @param storePricesTag tag of the store to update the prices for
     */
    public async updateStorePricesForBooks(bookList:Array<BookGoodRead>, storePricesTag:string){
        const storePricesImpl : StorePrices = Container.get(storePricesTag)
        const storeSearchResults = await Promise.all(bookList.map(async (bookData) => storePricesImpl.getStoreSearchResult(bookData)));

        const urls = storeSearchResults.map((searchResponse, index) => {
            const bookName = bookList[index].title;
            return storePricesImpl.getStoreBookUrl(searchResponse.data, bookName);
        })

        const bookPages= await Promise.all(urls.map(async (url) => axiosGet(url)));

        return Promise.all(bookPages.map(async (page,index) => {
            let bookItem : BookStoreItem = storePricesImpl.getStoreBookData(page.data,urls[index])
            bookList[index].storeItems.push(bookItem)
            return bookList[index]
        }));
    }

    /**
     * Updates the given book with store prices
     * @param book book to update the prices for
     * @param storePricesTag tag of the store to update the prices for
     */
    public async updateStorePriceForBook(book: BookGoodRead, storePricesTag:string){
        const storePricesImpl : StorePrices = Container.get(storePricesTag)
        const storeSearchResult = await storePricesImpl.getStoreSearchResult(book);

        const url = storePricesImpl.getStoreBookUrl(storeSearchResult.data, book.title);

        const bookPage = await axiosGet(url);

        let bookItem : BookStoreItem = storePricesImpl.getStoreBookData(bookPage.data,url)
        book.storeItems.push(bookItem)
        return book
    }




}