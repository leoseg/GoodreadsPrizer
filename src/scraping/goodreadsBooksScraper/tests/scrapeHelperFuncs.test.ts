import { Page } from 'puppeteer';
import dotenv from 'dotenv';
import {loadPuppeteerPage} from "../scrapeBooksHelpers";


dotenv.config();
describe('utils', () => {
    let page: Page;
    let url: string

    beforeAll(async () => {
        const userID = process.env.GOODREADS_USERID;
        const userName = process.env.GOODREADS_USERNAME;
        url = `https://www.goodreads.com/review/list/${userID}-${userName}?shelf=to-read`;
        page = await loadPuppeteerPage(url);

    });

    afterAll(async () => {
        await page.close();
    });

    describe('loadPuppeteerPage', () => {
        it('should load the page successfully', async () => {
            expect(page).toBeDefined();
        });

        it('should have the correct URL', async () => {
            const currentUrl = await page.url();
            expect(currentUrl).toBe(url);
        },10000);

    });
    // describe("scrollToBottom", () => {
    //
    //
    //     it("should scroll to the bottom of the page", async () => {
    //         const mockNumberBooks = 90;
    //
    //
    //         await scrollToBottom(page, mockNumberBooks);
    //
    //         expect(page.evaluate).toHaveBeenCalledTimes(1);
    //
    //     },20000);
    // });

    // describe("getNumberBooks", () => {
    //     let mockPage: Page;
    //
    //     beforeEach(() => {
    //         mockPage = {} as Page;
    //     });
    //
    //     it("should return the number of books in the shelf", async () => {
    //         const mockElement = {
    //             textContent: "Total Books: 10",
    //         };
    //
    //         mockPage.$eval = jest.fn().mockResolvedValueOnce(mockElement);
    //
    //         const result = await getNumberBooks(mockPage);
    //
    //         expect(mockPage.$eval).toHaveBeenCalledTimes(1);
    //         expect(mockPage.$eval).toHaveBeenCalledWith(".userShelf:nth-of-type(3)", expect.any(Function));
    //         expect(result).toBe(10);
    //     });
    //
    //     it("should throw an error if no books number found in scraped page", async () => {
    //         mockPage.$eval = jest.fn().mockResolvedValueOnce(null);
    //
    //         await expect(getNumberBooks(mockPage)).rejects.toThrowError("No books number found in scraped page.");
    //         expect(mockPage.$eval).toHaveBeenCalledTimes(1);
    //         expect(mockPage.$eval).toHaveBeenCalledWith(".userShelf:nth-of-type(3)", expect.any(Function));
    //     });
    // });



});