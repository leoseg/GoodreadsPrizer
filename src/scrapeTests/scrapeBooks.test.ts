import axios from 'axios';
import { getNumberOfBooks, getBookList } from "../scrape/scrapeBooks";
import {Page} from "puppeteer";

// Mock axios get method
jest.mock('axios');
jest.mock('../scrape/scrapeHelperFuncs', () => ({
    getNumberBooks: jest.fn(),
    scrollToBottom: jest.fn(),
    getBooksData: jest.fn(),
}));
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('scrapeBooks', () => {
    describe('getNumberOfBooks', () => {
        it('should return the number of books', async () => {
            const userID = '123';
            const userName = 'testuser';
            const expectedNumber = 10;

            // Mock the axios get method to return a response with the expected number of books
            mockedAxios.get.mockResolvedValueOnce({
                data: ` <div class="userShelf"> <a>
                            Books (12)</a>
                        </div>\`,
                        <div class="userShelf"> <a>
                            Books (15)</a>
                        </div>\`,
                        <div class="userShelf"> <a>
                            Books (${expectedNumber})</a>
                        </div>`,
            });

            const number = await getNumberOfBooks(userID, userName);

            expect(number).toBe(expectedNumber);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                `https://www.goodreads.com/review/list/${userID}-${userName}?shelf=currently-reading`,
                expect.any(Object)
            );
        });

        it('should throw an error if no books number found', async () => {
            const userID = '123';
            const userName = 'testuser';

            // Mock the axios get method to return a response without the books number
            mockedAxios.get.mockResolvedValueOnce({
                data: `<div class="userShelf">No books found</div>`,
            });

            await expect(getNumberOfBooks(userID, userName)).rejects.toThrowError(
                'No books number found in scraped page.'
            );
        });

        it('should throw an error if axios get request fails', async () => {
            const userID = '123';
            const userName = 'testuser';

            // Mock the axios get method to throw an error
            mockedAxios.get.mockRejectedValueOnce(new Error('Request failed'));

            await expect(getNumberOfBooks(userID, userName)).rejects.toThrowError('Request failed');
        });
    });

    describe('getBookList', () => {
        let mockPage: Page;

        beforeEach(() => {
            // Create a mock instance of the Page class
            mockPage = {} as Page;
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should call the necessary functions with the correct values', async () => {
            const userID = '123';
            const userName = 'testuser';
            const url = `https://www.goodreads.com/review/list/${userID}-${userName}?shelf=to-read`;

            // Mock the necessary functions
            const { getNumberBooks, scrollToBottom, getBooksData } = require('../scrape/scrapeHelperFuncs');
            getNumberBooks.mockResolvedValue(10);
            getBooksData.mockResolvedValue([['Book 1', 'Author 1'], ['Book 2', 'Author 2']]);

            // Call the function
            await getBookList(userID, userName);

            // Check if the functions were called with the correct values
            expect(getNumberBooks).toHaveBeenCalledWith(mockPage);
            expect(scrollToBottom).toHaveBeenCalledWith(mockPage, 10);
            expect(getBooksData).toHaveBeenCalledWith(mockPage);
        });

        it('should throw an error when the page cannot be loaded', async () => {
            const userID = '123';
            const userName = 'testuser';

            // Mock the necessary functions
            const { getNumberBooks } = require('../scrape/scrapeHelperFuncs');
            getNumberBooks.mockResolvedValue(0);

            // Call the function and expect it to throw an error
            await expect(getBookList(userID, userName)).rejects.toThrow('Could not load page');
        });

        it('should return an empty list when numberBooks is 0', async () => {
            const userID = '123';
            const userName = 'testuser';

            // Mock the necessary functions
            const { getNumberBooks } = require('../scrape/scrapeHelperFuncs');
            getNumberBooks.mockResolvedValue(0);

            // Call the function and expect it to return an empty list
            const result = await getBookList(userID, userName);
            expect(result).toEqual([]);
        });
    });
});

