import  {Page} from "puppeteer";

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
 * Gets the list of books in the shelf with title, author, isbn, isbn13
 * @param page
 */
export async function getBooksData(page: Page): Promise<any[][]>{
    return await page.evaluate(() => {
        let titles: any[] = [];
        let authors: any[] = [];
        let isbns: any[] = [];
        let isbn13s: any[] = [];
        const bookElements = document.querySelectorAll('#booksBody > tr');
        bookElements.forEach(element => {
            const titleElement = element.querySelector('.field.title a');
            if (titleElement) {
                titles.push(titleElement.getAttribute('title'));
            } else {
                return
            }
            const authorElement = element.querySelector('.field.author a');
            if (authorElement) {
                if (authorElement.textContent) {
                    authors.push(authorElement.textContent.trim());
                } else {
                    authors.push("Unknown")
                }
            }
            const isbnElement = element.querySelector('.field.isbn div');
            if (isbnElement){
                if(isbnElement.textContent){
                    isbns.push(isbnElement.textContent.trim())
                }else {
                    isbns.push("Unknown")
                }
            }
            const isbn13Element = element.querySelector('.field.isbn13 div');
            if(isbn13Element){
                if(isbn13Element.textContent){
                    isbn13s.push(isbn13Element.textContent.trim())
                }else {
                    isbn13s.push("Unknown")
                }
            }
        });

        return titles.map((title, index) => [title, authors[index], isbns[index], isbn13s[index]]);
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