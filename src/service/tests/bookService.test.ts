import { Container } from "typedi";
import { Repository } from "typeorm";
import { User } from "../../entity/user";
import { AppDataSource } from "../../db/postgresConfig";
import { BookGoodRead } from "../../entity/bookGoodRead";
import {BookPricer} from "../../scraping/bookPricesScraper/bookPricer";
import { getBookList } from "../../scraping/goodreadsBooksScraper/scrapeBooks";
import { BookStoreItem } from "../../entity/bookStoreItem";
import { BookService } from "../bookService";
import {testBooks, users, newBook,notRealNewBook,newStoreBook} from "./testdata";
import {alreadyInUserListbook} from "../../scraping/goodreadsBooksScraper/tests/scrapeBooks.test";


// Mock the getBookList function
jest.mock("../../scraping/goodreadsBooksScraper/scrapeBooks", () => ({
    getBookList: jest.fn(),
}));


// Mock the BookPricer class
let mockPricer = new BookPricer() as jest.Mocked<BookPricer>;
Container.set(BookPricer,mockPricer );
describe("BookService", () => {
    let bookService: BookService = new BookService();
    let bookGoodReadRepository: Repository<BookGoodRead>
    let userRepository: Repository<User>
    let bookStoreItemRepository: Repository<BookStoreItem>


    beforeAll(async () => {
        await AppDataSource.initialize().then(() => console.log("Database initialized")).catch(
            (err) => console.log(err)
        )
        bookGoodReadRepository = AppDataSource.getRepository(BookGoodRead);
        userRepository = AppDataSource.getRepository(User);
        bookStoreItemRepository = AppDataSource.getRepository(BookStoreItem);

        //clear before tests
        bookGoodReadRepository.clear()
        bookStoreItemRepository.clear()
        userRepository.clear()

        await userRepository.save(users)
        await bookGoodReadRepository.save(testBooks)
        const userst = await userRepository.find({relations:["booksGoodRead"]})
        console.log(userst)
    });


    beforeEach(() => {
        // Reset the mock implementation before each test
        jest.clearAllMocks();

    });

    describe("updateBookPricesForUser", () => {
        it("should update book prices for a user", async () => {
            // Mock the getBookList function
            const mockBookList = [
                alreadyInUserListbook,
                notRealNewBook,
                newBook
            ];
            (getBookList as jest.Mock).mockResolvedValueOnce(mockBookList);

            // Mock the bookPricer.getBookPricesListForAllStores function
            const mockBookListWithPrices = [
                newStoreBook
            ];
            (mockPricer.getBookPricesListForAllStores as jest.Mock).mockResolvedValueOnce(
                mockBookListWithPrices
            );

            // Create a mock user
            var user = users[0]
            // Call the updateBookPricesForUser function
            await bookService.updateBookPricesForUser(user);

            // Assert that the necessary functions were called with the correct arguments
            expect(getBookList).toHaveBeenCalledWith(user.goodreadsID, user.goodreadsName);
            expect(bookGoodReadRepository.upsert).toHaveBeenCalledWith(mockBookList, ["uniqueIndex"]);

            // expect that the user has the upated booklist with the from goodread
            const updatedUser = await userRepository.findOne({
                where: { id: user.id }, relations: ["booksGoodRead"]})
            expect(updatedUser!.booksGoodRead.map(book => book.isbn)).toEqual(mockBookList.map(book => book.isbn))
            // expect that each of the goodreads book already their has their user list updated with the new user
            const allBooksGoodRead = await bookGoodReadRepository.find({relations:["users"]})
            expect(allBooksGoodRead[0].users).toEqual([users[0]])
            expect(allBooksGoodRead[1].users).toEqual([users[1]])
            expect(allBooksGoodRead[2].users).toEqual([users[1],users[0]])
            // expect that the new books are related to the user
            expect(allBooksGoodRead[3].users).toEqual([users[0]])
            // expect that each of the new books has a store item
            expect(allBooksGoodRead[3].storeItems).toEqual([newStoreBook])
            // expect that that only for the new books new store item were scrapped, not for the old ones
            expect(bookStoreItemRepository.save).toHaveBeenCalledWith([newStoreBook]);
        });
    });

    describe("getBookstoreEntriesForUser", () => {
        it("should get all BookStoreItem entries for a user", async () => {
            const user = users[1];
            const expectedBookStoreItems = testBooks[1].storeItems.concat(testBooks[2].storeItems)
            const actualBookStoreItems = await bookService.getBookstoreEntriesForUser(user);
            expect(actualBookStoreItems).toEqual(expectedBookStoreItems);
        });
    });
});