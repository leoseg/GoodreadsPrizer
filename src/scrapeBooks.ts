import axios from "axios";
import * as cheerio from 'cheerio';
import puppeteer from "puppeteer";
import {userAgents, minimal_args, scrollToBottom} from "./scrapeHelperFuncs";
import dotenv from 'dotenv';
dotenv.config();
const getNumberOfBooks = async (userID: string, userName: string): Promise<number> => {
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
        throw error
    }
}

const getBookList = async (userID: string, userName: string): Promise<Array<Array<string>>> => {
    const url = `https://www.goodreads.com/review/list/${userID}-${userName}?shelf=to-read&per_page=100`;

    const browser = await puppeteer.launch({
        headless: "new" ,
        args: minimal_args,
        defaultViewport: {
            width: 1280,
            height: 800
        }
    });
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (request) => {
        if (['image', 'font',"stylesheet"].indexOf(request.resourceType()) !== -1) {
            request.abort();
        } else {
            request.continue();
        }
    });

    await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
    await page.goto(url, { waitUntil: 'networkidle2' });



// Scroll until all books are loaded (you might need to adjust this logic based on the website's behavior)
    await scrollToBottom(page);


    const titlesAndAuthors = await page.evaluate(() => {
        let titles: any[] = [];
        let authors: any[] = [];
        const bookElements = document.querySelectorAll('#booksBody > tr');
        bookElements.forEach(element => {
            const titleElement = element.querySelector('.field.title a');
            if (titleElement) {
                titles.push(titleElement.getAttribute('title'));
            } else{
                return
            }
            const authorElement = element.querySelector('.field.author a');
            if (authorElement) {
                if(authorElement.textContent){
                    authors.push(authorElement.textContent.trim());
                }else{
                    authors.push("Unknown")
                }
            }
        });

        return titles.map((title, index) => [title, authors[index]]);
    });

    await page.close();
    await browser.close();
    return titlesAndAuthors;
}
// Example usage:
const userID = process.env.GOODREADS_USERID;
const userName = process.env.GOODREADS_USERNAME;
if(userID == undefined || userName == undefined){
    throw Error
}else{
    getBookList(userID, userName).then(
        result => {
            console.log(result)
        }
    )
}

// getNumberOfBooks(userID, userName)
//     .then(number => {
//         console.log(`Number of books: ${number}`);
//     })
//     .catch(error => {
//         console.error(error.message);
//     });
