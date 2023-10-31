import {Container,  Service} from "typedi";
import {Repository} from "typeorm";
import {GoodReadsUser} from "../entity/goodReadsUser";
import {AppDataSource} from "../db/postgresConfig";
import {BookGoodRead} from "../entity/bookGoodRead";
import {getBookList} from "../scraping/goodreadsBooksScraper/scrapeBooks";
import {BookStoreItem} from "../entity/bookStoreItem";
import {BookPricer} from "../scraping/bookPricesScraper/priceInterfaces";
const config = require("../config")


@Service()
export class BookService{


    private bookGoodReadRepository:Repository<BookGoodRead> = AppDataSource.getRepository(BookGoodRead)
    private userRepository:Repository<GoodReadsUser> = AppDataSource.getRepository(GoodReadsUser)
    private bookPricer: BookPricer = Container.get(config.PRICEALGORITHM as string)
    private bookStoreItemRepository:Repository<BookStoreItem> = AppDataSource.getRepository(BookStoreItem);


    /**
     * Update the book prices for a user
     * @param user of the user to update the book prices for
     */
    async updateBookPricesForUser(user:GoodReadsUser){
        var bookList = await getBookList(user)
        // await this.bookGoodReadRepository.save(bookList)
        const orConditions = bookList.map(book => ({
            author: book.author,
            title: book.title,
        }));
        const booksFromDB = await this.bookGoodReadRepository.find(
            {where: orConditions,
                relations:["storeItems"]
            },
        )
        const bookListWithPrices = await this.bookPricer.scrapeBookPricesListForAllStores(
            bookList,booksFromDB
        )
        await this.updateBooksForUser(user,bookListWithPrices)
    }

    /**
     * Get all the BookStoreItem entries for a user
     * @param user user to get the book entries for
     * @param storeTag tag of the store to filter by
     */
    async getBookstoreEntriesForUser(user:GoodReadsUser, storeTag?:string) : Promise<Array<BookStoreItem>> {
        const query = this.bookStoreItemRepository
            .createQueryBuilder("entry")
            .select(["entry","book"])
            .innerJoin("entry.bookGoodRead", "book")
            .innerJoin("user_book", "ub", "ub.bookGoodReadAuthor = book.author AND ub.bookGoodReadTitle = book.title")
            .where("ub.goodReadsUserId = :userID", { userID: user.id });

        // If a tag is provided, filter by it
        if (storeTag) {
            query.andWhere("entry.storeTag = :storeTag", { storeTag });
        }
        var bookPrices = await query.getMany()
        return bookPrices.map((entry) => {
            return this.bookStoreItemRepository.create(entry)
        })
    }

    /**
     * Update the books for a user
     * @param user user to update the books for
     * @param bookList list of books to update the user with
     * @private
     */
    private async updateBooksForUser(user:GoodReadsUser,bookList:Array<BookGoodRead>){
        user.booksGoodRead = bookList
        await this.userRepository.save(user)
    }
}
