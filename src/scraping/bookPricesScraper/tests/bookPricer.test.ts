import { BookPricer ,StorePrices} from "../bookPricer";
import { BookGoodRead } from "../../../entity/bookGoodRead";
import axios from "axios";
import {ThaliaPrices} from "../thaliaPrices";
import {axiosGet} from "../../../utils";

// Mock the dependencies
jest.mock("../thaliaPrices");
jest.mock("../../../entity/bookGoodRead")
jest.mock("axios");
jest.mock("../../../utils");
let mockStorePrices = new ThaliaPrices() as jest.Mocked<StorePrices>;


describe("BookPricer", () => {
    let bookPricer: BookPricer;

    beforeEach(() => {
        // Create an instance of BookPricer with the mock StorePrices
        bookPricer = new BookPricer(mockStorePrices);
    });

    afterEach(() => {
        // Restore the original implementations
        jest.restoreAllMocks();
    });

    it("should get the book price list", async () => {
        // Mock the return values of the mocked functions
        const mockSearchResults =
            [ {data:"<href:https://example.com/book" },
                {data:"<href:https://example.com/book2"}];
        const mockBookUrls = ["https://example.com/book", "https://example.com/book2"];
        const mockPrices =[ {
            price: 10},{price: 20}]
        // Mock the getStoreSearchResult function
        mockStorePrices.getStoreSearchResult.mockResolvedValueOnce(mockSearchResults[0]).mockResolvedValueOnce(mockSearchResults[1]);

        // Mock the getStoreBookUrl function
        mockStorePrices.getStoreBookUrl.mockReturnValueOnce(mockBookUrls[0]).mockReturnValueOnce(mockBookUrls[1]);

        // Mock the axiosGet function
        (axiosGet as jest.Mock).mockResolvedValueOnce({ data: "bookpage1"}).mockResolvedValueOnce({ data: "bookpage2" });

        mockStorePrices.getStoreBookData.mockReturnValueOnce(mockPrices[0]).mockReturnValueOnce(mockPrices[1])

        let book1 = new BookGoodRead()
        let book2 = new BookGoodRead()
        book1.title = "Book 1"
        book2.title = "Book 2"
        // Create a mock book list
        // Call the getBookPriceList method
        let mockBookList = [book1,book2]
        const bookPriceList = await bookPricer.getBookPriceList(mockBookList);

        // Assert that the mocked functions were called with the correct parameters
        expect(mockStorePrices.getStoreSearchResult).toHaveBeenCalledTimes(2);
        expect(mockStorePrices.getStoreSearchResult).toHaveBeenCalledWith(mockBookList[0]);
        expect(mockStorePrices.getStoreSearchResult).toHaveBeenCalledWith(mockBookList[1]);

        expect(mockStorePrices.getStoreBookUrl).toHaveBeenCalledTimes(2);
        expect(mockStorePrices.getStoreBookUrl).toHaveBeenCalledWith(mockSearchResults[0].data, mockBookList[0].title);
        expect(mockStorePrices.getStoreBookUrl).toHaveBeenCalledWith(mockSearchResults[1].data, mockBookList[1].title);

        expect(axiosGet).toHaveBeenCalledTimes(2);
        expect(axiosGet).toHaveBeenCalledWith(mockBookUrls[0]);
        expect(axiosGet).toHaveBeenCalledWith(mockBookUrls[1]);

        expect(mockStorePrices.getStoreBookData).toHaveBeenCalledTimes(2)
        expect(mockStorePrices.getStoreBookData).toHaveBeenCalledWith("bookpage1",mockBookUrls[0])
        expect(mockStorePrices.getStoreBookData).toHaveBeenCalledWith("bookpage2",mockBookUrls[1])
        // Assert the returned book price list
        expect(bookPriceList).toEqual([mockPrices[0], mockPrices[1]]);
    });
});