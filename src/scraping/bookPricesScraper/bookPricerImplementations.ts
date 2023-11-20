import {BookGoodRead} from "../../entity/bookGoodRead";
import {BookStoreItem} from "../../entity/bookStoreItem";
import {Container, Service} from "typedi";
import {BookPricer, StorePrices, StoreTag} from "./priceInterfaces";
import "reflect-metadata";
import { ThaliaPrices } from "./thaliaPrices";
import {RabbitMQ} from "../../messagequeues/rabbitmq";



/**
 * Class for the book pricer gets prices from a store, store type is defined by the storePricesImpl attribute
 */
@Service()
export class AsyncPricer implements BookPricer{


    protected tagImplMap = {
       Thalia : ThaliaPrices
    }


    /**
     * Returns the list of all prices not already in the bookList
     * @param bookList list of books to get the prices for
     * @param booksFromDB books from the database to compare if prices already there
     */
    public async scrapeBookPricesListForAllStores(bookList:Array<BookGoodRead>,booksFromDB:Array<BookGoodRead>) : Promise<Array<BookGoodRead>>{
        const tags = Object.values(StoreTag);
        const authorTitleMap = new Map();
        booksFromDB.forEach(obj => {
          obj.storeItems.filter((storeItem)=>storeItem.url !== "Not found" ).forEach(
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
    // /**
    //  * Updates the given book list with store prices
    //  * @param bookList list of books to update the prices for
    //  * @param storePricesTag tag of the store to update the prices for
    //  */
    // public async updateStorePricesForBooks(bookList:Array<BookGoodRead>, storePricesTag:string){
    //     const storePricesImpl : StorePrices = Container.get(storePricesTag)
    //     const storeSearchUrls = await Promise.all(bookList.map(async (bookData) => storePricesImpl.getStoreSearchUrl(bookData)));
    //
    //     const urls = storeSearchResults.map((searchResponse, index) => {
    //         const bookName = bookList[index].title;
    //         return storePricesImpl.getStoreBookUrl(searchResponse.data, bookName);
    //     })
    //
    //     const bookPages= await Promise.all(urls.map(async (url) => axiosGet(url)));
    //
    //     return Promise.all(bookPages.map(async (page,index) => {
    //         let bookItem : BookStoreItem = storePricesImpl.getStoreBookData(page.data,urls[index])
    //         bookList[index].storeItems.push(bookItem)
    //         return bookList[index]
    //     }));
    // }

    /**
     * Updates the given book with store prices
     * @param book book to update the prices for
     * @param storePricesTag tag of the store to update the prices for
     */
    public async updateStorePriceForBook(book: BookGoodRead, storePricesTag:string){
        const storePricesImpl : StorePrices = Container.get(this.tagImplMap[storePricesTag])
        const storeSearchUrl = await storePricesImpl.getStoreSearchUrl(book);
        const storeSearchContent = await storePricesImpl.contentFetcher.fetchContent(storeSearchUrl);
        const url = storePricesImpl.getStoreBookUrl(storeSearchContent, book.title,book.author);
        if(url === ""){
            const bookItem = new BookStoreItem()
            bookItem.storeTag = storePricesTag
            bookItem.price = " "
            bookItem.priceEbook = " "
            bookItem.pricePaperback = " "
            bookItem.storeID = "Not found"
            bookItem.url = "Not found"
            book.storeItems.push(bookItem)
            return book
        }
        const bookPage = await storePricesImpl.contentFetcher.fetchContent(url);
        let bookItem : BookStoreItem = storePricesImpl.getStoreBookData(bookPage,url)
        book.storeItems.push(bookItem)
        return book
    }
}

/**
 * Class that extends async pricer but sends books for processing to rabbitmq queue
 * where they get consumed from workers and then returned
 */
@Service()
export class AsyncPricerRabbit extends AsyncPricer{

    private rabbitMQService: RabbitMQ= Container.get(RabbitMQ)
    public async updateStorePriceForBook(book: BookGoodRead, storePricesTag:string){

        const message = {
            book: {
                title: book.title,
                author: book.author
            },
            storePricesTag: storePricesTag
        }
        const result : string = await this.rabbitMQService.sendRPCMessage(JSON.stringify(message));
        const resultJson : any = JSON.parse(result)
        const bookItem = new BookStoreItem()
        bookItem.storeTag = storePricesTag
        bookItem.price = " "
        bookItem.priceEbook = " "
        bookItem.pricePaperback = " "
        bookItem.storeID = "Not found"
        bookItem.url = "Not found"
        if(resultJson.errorCode == 1){
            book.storeItems.push(bookItem)
        }
        if(resultJson.errorCode == 2){
            console.log("Error occurred during rabbitmq message processing, returning book without new storebook")
            book.storeItems.push(bookItem)
        }else if(resultJson.errorCode == 0){
            resultJson.delete("errorCode")
            const bookStoreItem : BookStoreItem =  JSON.parse(result)
            book.storeItems.push(bookStoreItem);
        }
        return book

    }

}