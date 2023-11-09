import {getBookList, getNumberOfBooks} from "../scrapeBooks";
import axios from 'axios';
import {getBooksData, getNumberBooks, loadPuppeteerPage, scrollToBottom, userNameCheck} from "../scrapeBooksHelpers";
import {GoodReadsUser} from "../../../entity/goodReadsUser";

jest.mock('axios');
jest.mock('../scrapeBooksHelpers');
const mockedAxios = axios as jest.Mocked<typeof axios>;
axios.get = jest.fn()

describe('scrapeBooks', () => {

    var user: GoodReadsUser
    beforeAll(() => {
        user = new GoodReadsUser()
        user.goodreadsName = 'testuser'
        user.goodreadsID =  '123'
    })
    describe('getNumberOfBooks', () => {
        it('should return the number of books', async () => {
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
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {},
            });

            const number = await getNumberOfBooks(user.goodreadsID,user.goodreadsName);

            let userNameTransformed = user.goodreadsName.replace(/\s+/g, '-').toLowerCase();

            expect(number).toBe(expectedNumber);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                `https://www.goodreads.com/review/list/${user.goodreadsID}-${userNameTransformed}?shelf=currently-reading`,
                expect.any(Object)
            );
        });
        it('should throw an error if no books number found', async () => {
            // Mock the axios get method to return a response without the books number
            mockedAxios.get.mockResolvedValueOnce({
                data: `<div class="userShelf">No books found</div>`,
            });

            await expect(getNumberOfBooks(user.goodreadsID,user.goodreadsName)).rejects.toThrowError(
                'No books number found in scraped page.'
            );
        });

        it('should throw an error if axios get request fails', async () => {

            // Mock the axios get method to throw an error
            mockedAxios.get.mockRejectedValueOnce(new Error('Request failed'));

            await expect(getNumberOfBooks(user.goodreadsID,user.goodreadsName)).rejects.toThrowError('Request failed');
        });
    });

    describe('getBookList', () => {
        let mockPage: { close: typeof jest.fn};
        let getNumberBooksMock: jest.Mock<any, any, any>
        beforeEach(() => {
            mockPage = {
                close: jest.fn(),
            };
            // Mock the necessary functions
            (loadPuppeteerPage as jest.Mock).mockResolvedValue(
                mockPage
            );
            getNumberBooksMock =getNumberBooks as jest.Mock

        })
        afterEach(() => {
            jest.resetAllMocks();
        });


        it('should call the necessary functions with the correct values', async () => {
            const url = `https://www.goodreads.com/review/list/${user.goodreadsID}-${user.goodreadsName}?shelf=to-read`;
            getNumberBooksMock.mockImplementationOnce(() => Promise.resolve(2));
            (getBooksData as jest.Mock).mockResolvedValue([['Book 1', 'Author 1'], ['Book 2', 'Author 2']]);

            // Call the function
            await getBookList(user);

            // Check if the functions were called with the correct values
            expect(loadPuppeteerPage).toHaveBeenCalledWith(url);
            expect(userNameCheck).toHaveBeenCalledWith(mockPage, user.goodreadsName);
            expect(getNumberBooks).toHaveBeenCalledWith(mockPage);
            expect(scrollToBottom).toHaveBeenCalledWith(mockPage, 2);
            expect(getBooksData).toHaveBeenCalledWith(mockPage);
            expect(mockPage.close).toBeCalled();
        });

        it('should throw an error when the page cannot be loaded', async () => {
            const error = new Error('False User ID');
            (userNameCheck as jest.Mock).mockRejectedValueOnce(error);

            // Call the function and expect it to throw an error
            await expect(getBookList(user)).rejects.toThrow('Goodreads scrapping failed');

        });

        it('should return an empty list when numberBooks is 0', async () => {

            getNumberBooksMock.mockResolvedValueOnce(0)


            // Call the function and expect it to return an empty list
            const result = await getBookList(user);
            expect(result).toEqual([]);
        });
    });
});







