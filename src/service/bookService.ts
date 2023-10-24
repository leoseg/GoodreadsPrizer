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

    private userRepository:Repository<User> = AppDataSource.getRepository(User)
    private bookGoodReadRepository:Repository<BookGoodRead> = AppDataSource.getRepository(BookGoodRead)
    private bookStoreItemRepository:Repository<BookStoreItem> = AppDataSource.getRepository(BookStoreItem)
    private bookPricer: BookPricer = Container.get(BookPricer)

    /**
     * Update the book prices for a user
     * @param userID id of the user to update the book prices for
     */
    async updateBookPricesForUser(userID:number){
        const user = await this.userRepository.findOne({
            where: { id: userID },relations:["booksGoodRead"]
        });
        if (user) {
            var bookList = await getBookList(user.goodreadsID,user.goodreadsName)
            bookList = bookList.map(book => {book.users.push(user); return book})
            await this.bookGoodReadRepository.upsert(bookList,["uniqueIndex"])
            const bookListWithPrices = await this.bookPricer.getBookPricesListForAllStores(
                await this.bookGoodReadRepository.find(
                {relations:["bookStoreItems"]},
            ))
            await this.bookStoreItemRepository.save(bookListWithPrices)
        }
    }

    /**
     * Get all the BookStoreItem entries for a user
     * @param userID id of the user to get the book entries for
     * @param storeTag tag of the store to filter by
     */
    async getBookstoreEntriesForUser(userID:number,storeTag?:string){
        const query = this.bookStoreItemRepository
            .createQueryBuilder("entry")
            .innerJoin("entry.bookGoodRead", "book")
            .innerJoin("book.users", "user")
            .where("user.id = :userId", { userID });

        // If a tag is provided, filter by it
        if (storeTag) {
            query.andWhere("entry.tag = :storeTag", { storeTag });
        }
        return await query.getMany();
    }

}