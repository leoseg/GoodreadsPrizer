import puppeteer, { Page} from "puppeteer";
import {minimal_args, userAgents} from "./scrapeBooksConfigs";
import {BookGoodRead} from "../../entity/bookGoodRead";



/**
 * Scrolls to the bottom of the page
 * @param page puppeteer page
 * @param numberBooks number of books in the shelf
 */
export async function scrollToBottom(page: Page, numberBooks: number) : Promise<void>{
    while (true) {
        const numberOfElements = await page.evaluate(() => {
            return document.querySelectorAll('#booksBody > tr').length;
        });
        if(numberOfElements == numberBooks)break;
        await page.evaluate(() => {
            window.scrollBy(0, 20000); // Adjust this value based on the website's behavior
        });
    }
}
/**
 * Gets the number of books in the shelf
 * @param page puppeteer page
 */
export async function getNumberBooks(page: Page) :Promise<number | null>{
    return await page.$eval('.userShelf:nth-of-type(3)', element => {
        if(element && element.textContent){
            const match = element.textContent.match(/(\d+)/);
            return match ? parseInt(match[0], 10) : null;
        }
        else{
            throw Error("No books number found in scraped page.")
        }
})}

/**
 * Gets the list of books in the shelf with title, author, isbn, isbn13, number of pages and link
 * @param page
 */
export async function getBooksData(page: Page): Promise<BookGoodRead[]>{
    return await page.evaluate(() => {
        var books :any = []
        const bookElements = document.querySelectorAll('#booksBody > tr');
        bookElements.forEach((element,index) => {
            let book = {} as BookGoodRead
            book.storeItems = []
            const titleElement = element.querySelector('.field.title a');
            if (titleElement) {
                if(titleElement.getAttribute("title") != null){
                    book.title = titleElement.getAttribute("title")!
                }else{
                    return;
                }
                if(titleElement.getAttribute("href") != null){
                    book.url = titleElement.getAttribute("href")!
                }else{
                    return;
                }
            } else {
                return
            }
            const authorElement = element.querySelector('.field.author a');
            if (authorElement) {
                if (authorElement.textContent) {
                    book.author = authorElement.textContent.trim();
                } else {
                    book.author = "Unknown"
                }
            }
            const isbnElement = element.querySelector('.field.isbn div');
            if (isbnElement){
                if(isbnElement.textContent){
                    book.isbn = isbnElement.textContent.trim()
                }else {
                    book.isbn = "Unknown"
                }
            }
            const isbn13Element = element.querySelector('.field.isbn13 div');
            if(isbn13Element){
                if(isbn13Element.textContent){
                    book.isbn13 = isbn13Element.textContent.trim()
                }else {
                    book.isbn13 = "Unknown"
                }
            }
            const numPages: Element|null = element.querySelector('.field.num_pages nobr');
            if(numPages) {
                if (numPages.textContent) {
                    book.numPages = parseInt(numPages.textContent.trim())
                }else{
                    book.numPages = 0
                }
            }
            const position: Element|null = element.querySelector(".field.position .value input[type='text']")
            if(position){
                book.position = parseInt(position?.getAttribute("value") as string)
            }else{
                book.position = bookElements.length - index
            }
            books.push(book)
        });
         return books
        });
    }
/**
 * Checks if the username is the same as in the page
 * @param page puppeteer page
 * @param userName username
 */
export async function userNameCheck(page: Page, userName: string): Promise<void>{
    const scrapedUsername = await page.$eval("#header > h1 > a:nth-child(2)", element => {
        console.log(element.textContent)
        return  element.textContent
    })
    if(!(scrapedUsername  && userName.includes(scrapedUsername))){
        throw Error("False UserID")
    }
}



/**
 * Loads a puppeteer page with the given url
 * @param url url to load
 */
export async function loadPuppeteerPage(url: string): Promise<Page> {
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

    return page;
}