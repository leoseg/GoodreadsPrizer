import {BookStoreItem} from "../entity/bookStoreItem";
import {Repository} from "typeorm";
import {AppDataSource} from "../db/postgresConfig";


export class BookStoreItemController{
    private bookStoreItemRepository:Repository<BookStoreItem> = AppDataSource.getRepository(BookStoreItem)

    /**
     * Get all the BookStoreItem entries
     */
    async all(){
        return this.bookStoreItemRepository.find()
    }

    /**
     * Insert a BookStoreItem entry
     * @param bookStoreItem
     */
    async insert(bookStoreItem:BookStoreItem){
        return this.bookStoreItemRepository.save(bookStoreItem)
    }

    /**
     * Insert many BookStoreItem entries
     * @param bookStoreItems
     */
    async insertMany(bookStoreItems:BookStoreItem[]){
        return this.bookStoreItemRepository.save(bookStoreItems)
    }

    /**
     * Find a BookStoreItem entry by its name and author and storeTag
     * @param bookName the name of the book
     * @param author the author of the book
     * @param storeTag the storeTag of the book
     */
    async findByStoreTagAndBookNameAuthor(bookName:string,author:string,storeTag?:string,){
        if(storeTag === undefined){
            return this.bookStoreItemRepository.find({ where: { title: bookName, author: author } })
        }else{
            return this.bookStoreItemRepository.find({ where: { storeTag: storeTag, title: bookName, author: author } })
        }
    }

    /**
     * Find all BookStoreItems in the list of books with the storeTag
     * @param bookList the list of books
     * @param storeTag the storeTag
     */
    async findByListOfBooks(bookList:Array<Array<string>>,storeTag?:string):Promise<Array<BookStoreItem>>{
        const bookStoreItems = await Promise.all(bookList.map(bookData => this.findByStoreTagAndBookNameAuthor(bookData[0],bookData[1],storeTag)))
        return bookStoreItems.flat()
    }
}