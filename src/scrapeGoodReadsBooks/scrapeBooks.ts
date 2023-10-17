import axios from "axios";
import * as cheerio from 'cheerio';
import {scrollToBottom, getNumberBooks, getBooksData, userNameCheck} from "./scrapeBooksHelpers";
import dotenv from 'dotenv';
import {userAgents} from "./scrapeBooksConfigs";
import {loadPuppeteerPage} from "../utils";
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
        const page = await loadPuppeteerPage(url)
        await userNameCheck(page, userName)
        console.time("scroll")
        const numberBooks = await getNumberBooks(page)
        if(numberBooks == 0){
            return []
        }
        if(numberBooks){
            await scrollToBottom(page,numberBooks);
        }

        console.timeEnd("scroll")

        const booksData = await getBooksData(page)
        await page.close();
        return booksData;
    } catch (error) {
        console.log(error)
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