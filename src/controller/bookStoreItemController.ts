import {BookStoreItem} from "../entity/bookStoreItem";
import {Repository} from "typeorm";
import {AppDataSource} from "../db/postgresConfig";


export class BookStoreItemController{
    private bookStoreItemRepository:Repository<BookStoreItem> = AppDataSource.getRepository(BookStoreItem)


    /**
     * Insert a BookStoreItem entry
     * @param bookStoreItems
     */
    async saveMany(bookStoreItems:BookStoreItem[]){
        return this.bookStoreItemRepository.save(bookStoreItems,)
    }

    /**
     * Get all the BookStoreItem entries for a user
     * @param userId id of the user
     * @param storeTag the storeTag to filter for a specific store
     */
    async getBookstoreEntriesForUser(userId: number, storeTag?: string) {
        const query = this.bookStoreItemRepository
            .createQueryBuilder("entry")
            .innerJoin("entry.bookGoodRead", "book")
            .innerJoin("book.users", "user")
            .where("user.id = :userId", { userId });

        // If a tag is provided, filter by it
        if (storeTag) {
            query.andWhere("entry.tag = :storeTag", { storeTag });
        }

        return await query.getMany();
    }

    //
    // /**
    //  * Find a BookStoreItem entry by its name and author and storeTag
    //  * @param bookName the name of the book
    //  * @param author the author of the book
    //  * @param storeTag the storeTag of the book
    //  */
    // async findByStoreTagAndBookNameAuthor(bookName:string,author:string,storeTag?:string,){
    //     if(storeTag === undefined){
    //         return this.bookStoreItemRepository.find({ where: { title: bookName, author: author } })
    //     }else{
    //         return this.bookStoreItemRepository.find({ where: { storeTag: storeTag, title: bookName, author: author } })
    //     }
    // }
    //
    // /**
    //  * Find all BookStoreItems in the list of books with the storeTag
    //  * @param bookList the list of books
    //  * @param storeTag the storeTag
    //  */
    // async findByListOfBooks(bookList:Array<Array<string>>,storeTag?:string):Promise<Array<BookStoreItem>>{
    //     const bookStoreItems = await Promise.all(bookList.map(bookData => this.findByStoreTagAndBookNameAuthor(bookData[0],bookData[1],storeTag)))
    //     return bookStoreItems.flat()
    // }
}