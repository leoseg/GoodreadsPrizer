import axios from "axios";
import {userAgents} from "./scraping/goodreadsBooksScraper/scrapeBooksConfigs";

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
 * Axios wrapper to log error and call with random user agent
 * @param url url to call
 */
export async function axiosGet(url:string):Promise<any>{
    return axios.get(url,
        {
            headers : {"User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)]}
        })
        .then(response => {
            return response.data
        })
        .catch(error => {
            console.log(error)
        })
}