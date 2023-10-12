import axios from "axios";
import * as cheerio from 'cheerio';
import puppeteer from "puppeteer";
import {scrollToBottom, getNumberBooks, getBooksData, userNameCheck} from "./scrapeHelperFuncs";
import dotenv from 'dotenv';
import {minimal_args, userAgents} from "./scrapeConfigs";
dotenv.config();
/**
 * Gets the number of books in the shelf
 * @param userID goodreads user id
 * @param userName goodreads user name
 */
const getNumberOfBooks = async (userID: string, userName: string): Promise<number> => {
    console.time("numberbooks")
    const url = `https://www.goodreads.com/review/list/${userID}-${userName}?shelf=currently-reading`;

    try {
        const response = await axios.get(url,
            {
                headers : {"User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)]}
            });
        const $ = cheerio.load(response.data);
        const element = $(".userShelf:eq(2)");
        const numberBooks = element.text().match(/(\d+)/);
        if (numberBooks) {
            return parseInt(numberBooks[0], 10);
        } else {
            throw new Error("No books number found in scraped page.");
        }
    } catch (error) {
        console.error("Error occurred:", error);
        throw error
    }

}
/**
 * Gets the list of books in the shelf with author and title
 * @param userID goodreads user id
 * @param userName goodreads user name
 */
const getBookList = async (userID: string, userName: string): Promise<Array<Array<string>>> => {
    const url = `https://www.goodreads.com/review/list/${userID}-${userName}?shelf=to-read`;
    console.log(url)
    try {
        console.time("loadbrowser");
        const browser = await puppeteer.launch({
            headless: "new",
            args: minimal_args,
            defaultViewport: {
                width: 1280,
                height: 1500
            }
        });
        const page = await browser.newPage();
        console.timeEnd("loadbrowser")
        await page.setRequestInterception(true);
        console.time("loadPage")
        page.on('request', (request) => {
            if (['image', 'font', "stylesheet"].indexOf(request.resourceType()) !== -1) {
                request.abort();
            } else {
                request.continue();
            }
        });
        await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
        await page.goto(url, {waitUntil: 'domcontentloaded'});


        console.timeEnd("loadPage")
        await userNameCheck(page, userName)
        console.time("scroll")
        // Scroll until all books are loaded (you might need to adjust this logic based on the website's behavior)
        const numberBooks = await getNumberBooks(page)
        if(numberBooks == 0){
            return []
        }
        if(numberBooks){
            await scrollToBottom(page,numberBooks);
        }else{
            console.log("Could not scroll")
        }

        console.timeEnd("scroll")

        const booksData = await getBooksData(page)
        await page.close();
        await browser.close();
        return booksData;
    } catch (error) {
        throw Error("Could not load page");
    }
}
// // Example usage:
// const userID = process.env.GOODREADS_USERID;
// const userName = process.env.GOODREADS_USERNAME;
// if(userID == undefined || userName == undefined){
//     throw Error("Goodreads user id or name not found in .env file")
// }else{
//     getBookList(userID, userName).then(
//         result => {
//             console.log(result)
//         }
//     )
//     // getNumberOfBooks(userID, userName)
//     //     .then(number => {
//     //         console.log(`Number of books: ${number}`);
//     //     })
//     //     .catch(error => {
//     //         console.error(error.message);
//     //     });
//
// }

export {getNumberOfBooks, getBookList}