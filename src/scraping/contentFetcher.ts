import axios from "axios";
import {minimal_args, userAgents} from "./goodreadsBooksScraper/scrapeBooksConfigs";
import puppeteer from "puppeteer";
import {Page} from "puppeteer";
import {Service} from "typedi";


/**
 * Interface for the content fetcher which fetches content from the store pages
 */
export interface ContentFetcher {

    /**
     * Returns the html response of the page
     * @param url url of the page to scrape
     */
    fetchContent(url: string): Promise<string>

    /**
     * Closes the content fetcher
     */
    close(): Promise<void>
}

/**
 * Implementation of the ContentFetcher interface using axios
 */
@Service()
export class AxiosFetcher implements ContentFetcher {

    public async fetchContent(url: string): Promise<string> {
       const content = await axios.get(url,
            {
                headers : {"User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)]}
            })
            .then(response => {
                return response.data
            })
            .catch(error => {
                console.log(error)
                throw new Error(`Error fetching content from ${url}`);
            })
       return content.data
    }

    public async close() {
        //Nothing to close
    }

}

/**
 * Implementation of the ContentFetcher interface using puppeteer
 */
@Service()
export class PuppeteerFetcher implements ContentFetcher {

    private poolSize: number = 3;
    private browser: any;
    private pages: Array<Page> = [];
    private waitingList: Array<any> = [];
    async setup(){
        this.browser = await puppeteer.launch({
            headless: "new",
            args: minimal_args,
            defaultViewport: {
                width: 1280,
                height: 1500
            }
        });
        for(let i= 0; i < this.poolSize; i++){
            this.pages.push(await this.createNewPage())
        }
    }


      async fetchContent(url) {
        try{
                if (!this.browser) {
                    await this.setup();
                }
                const page = await this.acquirePage();
                try {
                    await page.goto(url, {waitUntil: 'networkidle2'});
                    return await page.content();
                } catch (error) {
                    // @ts-ignore
                    throw new Error(`Error fetching content from ${url}: ${error.message}`);
                } finally {
                    await this.release(page);
                }
        }
        catch (error) {
            console.log(error)
            throw new Error(`Error fetching content from ${url}`);
        }
    }

    private async acquirePage(): Promise<Page>{
        if (this.pages.length > 0) {
            return this.pages.pop()!;
        }
        // Wait for a page to be released by pushing the resolve function on the waiting list, so the promise
        // is awaited until the function from the waiting is called and the promise is resolved
        return new Promise(resolve => this.waitingList.push(resolve));

    }

     async release(page) {
        const waiter = this.waitingList.shift();
        if (waiter) {
            // Calling the resolve function with page as value (so page is resolved and returned)
            waiter(page);
        } else {
            this.pages.push(page);
        }
    }

      async close() {
        await Promise.all(this.pages.map(page => page.close()));
        await this.browser.close();
    }

    private async createNewPage(): Promise<Page>{
        const page = await this.browser.newPage();
        await page.setDefaultNavigationTimeout(300000);
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (['image', 'font', "stylesheet"].indexOf(request.resourceType()) !== -1) {
                request.abort();
            } else {
                request.continue();
            }
        });
        await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
        return page
    }

}