import {Container,  Service} from "typedi";
import {Repository} from "typeorm";
import {User} from "../entity/user";
import {AppDataSource} from "../db/postgresConfig";
import {BookGoodRead} from "../entity/bookGoodRead";
import {BookPricer} from "../scraping/bookPricesScraper/bookPricer";
import {getBookList} from "../scraping/goodreadsBooksScraper/scrapeBooks";
import {BookStoreItem} from "../entity/bookStoreItem";



@Service()
export class BookService{


    private bookGoodReadRepository:Repository<BookGoodRead> = AppDataSource.getRepository(BookGoodRead)
    private userRepository:Repository<User> = AppDataSource.getRepository(User)
    private bookPricer: BookPricer = Container.get(BookPricer)
    private bookStoreItemRepository:Repository<BookStoreItem> = AppDataSource.getRepository(BookStoreItem);


    /**
     * Update the book prices for a user
     * @param user of the user to update the book prices for
     */
    async updateBookPricesForUser(user:User){
        // const user = await this.userRepository.findOne({
        //     where: { id: userID },relations:["booksGoodRead"]
        // });
        var bookList = await getBookList(user)
        // await this.bookGoodReadRepository.save(bookList)
        // overwrite the old booklist
        user.booksGoodRead = bookList
        await this.userRepository.update(user.id, {booksGoodRead: bookList})
        const bookListWithPrices = await this.bookPricer.getBookPricesListForAllStores(
            await this.bookGoodReadRepository.find(
            {where: { users: { id: user.id } },
                relations:["bookStoreItems"]
                },
        ))
        await this.bookStoreItemRepository.save(bookListWithPrices)
    }

    /**
     * Get all the BookStoreItem entries for a user
     * @param user user to get the book entries for
     * @param storeTag tag of the store to filter by
     */
    async getBookstoreEntriesForUser(user:User,storeTag?:string){
        // const userWithBooks =  await this.userRepository.findOne(
        //     {where: { id: user.id } ,relations:["storeItems"]}
        // )
        // if(storeTag){
        //     return userWithBooks?.storeItems.filter(book => book.storeTag === storeTag)
        // }
        // return userWithBooks?.storeItems
        const query = this.bookStoreItemRepository
            .createQueryBuilder("entry")
            .innerJoin("entry.bookGoodRead", "book")
            .innerJoin("book.users", "user")
            .where("user.id = :userID", { userID :user.id });

        // If a tag is provided, filter by it
        if (storeTag) {
            query.andWhere("entry.tag = :storeTag", { storeTag });
        }
        return await query.getMany();
    }

}