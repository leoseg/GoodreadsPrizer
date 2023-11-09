import { Container } from "typedi";
import { Repository } from "typeorm";
import { GoodReadsUser } from "../../entity/goodReadsUser";
import { AppDataSource } from "../../db/postgresConfig";
import { BookGoodRead } from "../../entity/bookGoodRead";
import { BookPricer } from "../../scraping/bookPricesScraper/priceInterfaces";
import { getBookList } from "../../scraping/goodreadsBooksScraper/scrapeBooks";
import { BookService } from "../bookService";
import {testBooks, users, newBook, notRealNewBook, newStoreBook, storeItems, newBookWithStorePrices,alreadyInUserListbook} from "../../testdata/testbooks";
import {AsyncPricer} from "../../scraping/bookPricesScraper/bookPricerImplementations";

// Mock the getBookList function
jest.mock("../../scraping/goodreadsBooksScraper/scrapeBooks", () => ({
    getBookList: jest.fn(),
}));
jest.mock("../../scraping/bookPricesScraper/priceInterfaces")
const mockBookListWithPrices = [
            testBooks[2],
            testBooks[0],
            newBookWithStorePrices
        ];
// Mock the BookPricer class
let mockPricer : BookPricer = {
            scrapeBookPricesListForAllStores: jest.fn().mockResolvedValueOnce(
                mockBookListWithPrices
            ),
            updateStorePriceForBook: jest.fn(),
            }
            Container.set(AsyncPricer,mockPricer );
describe("BookService", () => {
    let bookService: BookService;
    let bookGoodReadRepository: Repository<BookGoodRead>
    let userRepository: Repository<GoodReadsUser>



    beforeAll(async () => {
        await AppDataSource.initialize().then(() => console.log("Database initialized")).catch(
            (err) => console.log(err)
        )
        bookGoodReadRepository = AppDataSource.getRepository(BookGoodRead);
        userRepository = AppDataSource.getRepository(GoodReadsUser);


        //clear before tests
        await userRepository.query('TRUNCATE TABLE good_reads_user CASCADE;')
        await userRepository.query('TRUNCATE TABLE book_good_read CASCADE;')
        await userRepository.query('TRUNCATE TABLE book_store_item CASCADE;')
        await userRepository.save(users)

    });

    //
    // afterEach(() => {
    //     // Reset the mock implementation before each test
    //     jest.clearAllMocks();
    //
    // });

    describe("updateBookPricesForUser", () => {
        it("should update book prices for a user", async () => {
            // Mock the getBookList function
            const mockBookList = [
                alreadyInUserListbook,
                notRealNewBook,
                newBook
            ];

            (getBookList as jest.Mock).mockResolvedValueOnce(mockBookList);

            bookService = Container.get(BookService);

            // Create a mock user
            var user = users[0]
            // Call the updateBookPricesForUser function
            await bookService.updateBookPricesForUser(user);

            // Assert that the necessary functions were called with the correct arguments
            expect(getBookList).toHaveBeenCalledWith(user);

            // expect that the user has the upated booklist with the from goodread
            const updatedUser = await userRepository.findOne({
                where: { id: user.id }, relations: ["booksGoodRead"]})
            expect(updatedUser!.booksGoodRead.map(book => book.isbn).sort()).toEqual(mockBookList.map(book => book.isbn).sort())
            // expect that each of the goodreads book already their has their user list updated with the new user
            const notUpdatedUser = await userRepository.findOne({
                where: { id: users[1].id }, relations: ["booksGoodRead"]})
            expect(notUpdatedUser!.booksGoodRead.map(book => book.isbn).sort()).toEqual([testBooks[1].isbn,testBooks[2].isbn].sort())
            // expect that each of the new books has a store item
            const allBooksGoodRead =( await bookGoodReadRepository.find({relations:["storeItems"]})).sort()
            expect(allBooksGoodRead[3].storeItems.map(storeItem => storeItem.storeID)).toEqual([newStoreBook.storeID])
            expect(allBooksGoodRead[0].storeItems.map(storeItem => storeItem.storeID).sort()).toEqual(
                [storeItems[0].storeID,storeItems[1].storeID].sort()
                )
            expect(allBooksGoodRead[1].storeItems.map(storeItem => storeItem.storeID).sort()).toEqual(
                [storeItems[2].storeID,storeItems[3].storeID].sort()
            )
            expect(allBooksGoodRead[2].storeItems.map(storeItem => storeItem.storeID).sort()).toEqual(
                [storeItems[4].storeID]
            )
        });
    });

    describe("getBookstoreEntriesForUser", () => {
        it("should get all BookStoreItem entries for a user", async () => {
            bookService = Container.get(BookService);
            const user = users[1];
            var testBooksEntities = testBooks.map((entry) => {
                return bookGoodReadRepository.create(entry)
            })
            var expectedBookStoreItems = testBooksEntities[1].storeItems.concat(testBooksEntities[2].storeItems)
            expectedBookStoreItems = expectedBookStoreItems.map((entry,index) => {
                index = index === 0?  1 : index
                entry.bookGoodRead = new BookGoodRead()
                entry.bookGoodRead.isbn13 = testBooksEntities[index].isbn13
                entry.bookGoodRead.isbn = testBooksEntities[index].isbn
                entry.bookGoodRead.title = testBooksEntities[index].title
                entry.bookGoodRead.author = testBooksEntities[index].author
                entry.bookGoodRead.numPages = testBooksEntities[index].numPages
                entry.bookGoodRead.url = testBooksEntities[index].url
                entry.bookGoodRead.position = testBooksEntities[index].position
                return entry})

            const actualBookStoreItems = await bookService.getBookstoreEntriesForUser(user);
            expect(actualBookStoreItems).toEqual(expectedBookStoreItems);
        });
    });
});