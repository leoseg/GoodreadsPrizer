import puppeteer, { Page } from "puppeteer";
import {minimal_args, userAgents} from "./scrapeGoodReadsBooks/scrapeBooksConfigs";

/**
 * Validates the format of the credentials
 * @param credentials credentials
 */
export const validateCredentialFormat = (credentials:{
    "GoodReadsUserID":string,
    "GoodReadsUserName":string,
}):boolean =>{
    if(/^\d+$/.test(credentials["GoodReadsUserID"])) return false
    if(/\d/.test(credentials["GoodReadsUserName"])) return false
    return true
}

/**
 * Loads a puppeteer page with the given url
 * @param url url to load
 */
export async function loadPuppeteerPage(url:string):Promise<Page> {
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