import {AsyncPricer} from "../bookPricerImplementations";
import { BookGoodRead } from "../../../entity/bookGoodRead";
import {ThaliaPrices} from "../thaliaPrices";
import {Container} from "typedi";
import {StorePrices, StoreTag} from "../priceInterfaces";
import {
    alreadyInUserListbook,
    newBook,
    newBookWithStorePrices,
    newStoreBook,
    notRealNewBook,  testBooks
} from "../../../testdata/testbooks";

// Mock the dependencies
let mockStorePrices :jest.Mocked<StorePrices>
        jest.mock("../thaliaPrices");
        jest.mock("../../../entity/bookGoodRead")
        jest.mock("axios");
        mockStorePrices = new ThaliaPrices() as jest.Mocked<StorePrices>;
describe("BookPricer", () => {
    let bookPricer: AsyncPricer;

    beforeEach(() => {
        // Create an instance of BookPricer with the mock StorePrices
        bookPricer = new AsyncPricer();
        mockStorePrices.contentFetcher = {
            fetchContent: jest.fn().mockResolvedValueOnce("").mockResolvedValueOnce("bookpage1")
        }
        Container.set(ThaliaPrices,mockStorePrices)
    });

    afterEach(() => {
        // Restore the original implementations
        //jest.clearAllMocks();
    });

    describe('getBookPricesListForAllStores', () => {
        it('should call getBookPriceList with the correct values', async () => {
            // Create mock book list
            const bookList: BookGoodRead[] = [
                alreadyInUserListbook,
                notRealNewBook,
                newBook
            ];
            const dbBookList: BookGoodRead[] = [
                testBooks[2],
                testBooks[0],
            ]

            mockStorePrices.getStoreBookData.mockReturnValueOnce(newStoreBook)

            const actualBookList = await bookPricer.scrapeBookPricesListForAllStores(bookList, dbBookList);

            //should not contain store items with unkown tag
            dbBookList[1].storeItems = dbBookList[1].storeItems.filter( storeItem => storeItem.storeTag === StoreTag.Thalia)
            const expectedBookList = dbBookList.concat([newBookWithStorePrices])
            // Assert that getBookPriceList was called with the correct values
            expect(
                actualBookList.map(book => book.storeItems.map(storeItem => storeItem.storeID))
            ).toEqual(
                expectedBookList.map(book => book.storeItems.map(storeItem => storeItem.storeID))
            )
        });
    });
    // it("should get the book price list", async () => {
    //     // Mock the return values of the mocked functions
    //     jest.clearAllMocks()
    //     const mockSearchResults =
    //         [ {data:"<href:https://example.com/book" },
    //             {data:"<href:https://example.com/book2"}];
    //     const mockBookUrls = ["https://example.com/book", "https://example.com/book2"];
    //     let book1 = new BookGoodRead()
    //     let book2 = new BookGoodRead()
    //     book1.title = "Book 1"
    //     book2.title = "Book 2"
    //     book1.storeItems = []
    //     book2.storeItems = []
    //
    //     let book1WithPrice = new BookGoodRead()
    //     let book2WithPrice = new BookGoodRead()
    //     book1WithPrice.title = "Book 1"
    //     book2WithPrice.title = "Book 2"
    //     book1WithPrice.storeItems = [storeItems[0]]
    //     book2WithPrice.storeItems = [storeItems[1]]
    //     const bookWithPrices =[ book1WithPrice,book2WithPrice]
    //     // Mock the getStoreSearchResult function
    //     mockStorePrices.getStoreSearchResult.mockResolvedValueOnce(mockSearchResults[0]).mockResolvedValueOnce(mockSearchResults[1]);
    //
    //     // Mock the getStoreBookUrl function
    //     mockStorePrices.getStoreBookUrl.mockReturnValueOnce(mockBookUrls[0]).mockReturnValueOnce(mockBookUrls[1]);
    //
    //     // Mock the axiosGet function
    //     (axiosGet as jest.Mock).mockResolvedValueOnce({ data: "bookpage1"}).mockResolvedValueOnce({ data: "bookpage2" });
    //
    //     mockStorePrices.getStoreBookData.mockReturnValueOnce(storeItems[0]).mockReturnValueOnce(storeItems[1])
    //
    //
    //     // Create a mock book list
    //     // Call the getBookPriceList method
    //     let mockBookList = [book1,book2]
    //     const bookPriceList = await bookPricer.updateStorePricesForBooks(mockBookList,StoreTag.Thalia);
    //
    //     // Assert that the mocked functions were called with the correct parameters
    //     expect(mockStorePrices.getStoreSearchResult).toHaveBeenCalledTimes(2);
    //     expect(mockStorePrices.getStoreSearchResult).toHaveBeenCalledWith(mockBookList[0]);
    //     expect(mockStorePrices.getStoreSearchResult).toHaveBeenCalledWith(mockBookList[1]);
    //
    //     expect(mockStorePrices.getStoreBookUrl).toHaveBeenCalledTimes(2);
    //     expect(mockStorePrices.getStoreBookUrl).toHaveBeenCalledWith(mockSearchResults[0].data, mockBookList[0].title);
    //     expect(mockStorePrices.getStoreBookUrl).toHaveBeenCalledWith(mockSearchResults[1].data, mockBookList[1].title);
    //
    //     expect(axiosGet).toHaveBeenCalledTimes(2);
    //     expect(axiosGet).toHaveBeenCalledWith(mockBookUrls[0]);
    //     expect(axiosGet).toHaveBeenCalledWith(mockBookUrls[1]);
    //
    //     expect(mockStorePrices.getStoreBookData).toHaveBeenCalledTimes(2)
    //     expect(mockStorePrices.getStoreBookData).toHaveBeenCalledWith("bookpage1",mockBookUrls[0])
    //     expect(mockStorePrices.getStoreBookData).toHaveBeenCalledWith("bookpage2",mockBookUrls[1])
    //     // Assert the returned book price list
    //     expect(bookPriceList).toEqual([bookWithPrices[0], bookWithPrices[1]]);
    // });
});