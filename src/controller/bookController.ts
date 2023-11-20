import {Container, Service} from "typedi";
import {BookService} from "../service/bookService";
import {Request, Response} from "express";
import {GoodReadsUser} from "../entity/goodReadsUser";

/**
 * Controller for the book routes
 */
@Service()
export class BookController{


    private bookService:BookService = Container.get(BookService)

    /**
     * Update the book prices for a user with sse, if the request param fullUpdate is 'true'
     * all the bookprices will be updated
     * not only the ones not in the db
     * @param request request containing the userId in cookkies
     * @param response response containing the status of the request
     */
    public updateBookPricesForUser = async (request:Request,response:Response):Promise<void> =>{
        // const userID = response.locals.user.sub
        try {
            response.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            'Content-Encoding': 'none'})
            response.flushHeaders()
            response.write("data: connection established\n\n")
            const user = response.locals.user as GoodReadsUser
            await this.bookService.updateBookPricesForUser(user,request.query.fullUpdate == "true")
            response.write("data: Book price updating finished\n\n");
            request.on('close', () => {
                response.end();
                console.log('Connection closed  by the client');
            })
        }catch(error) {
            console.log(error)
            response.status(500).send("Error updating book prices")
        }
    }


    /**
     * Get all the BookStoreItem entries for a user
     * @param request request containing the userId in cookkies and the storeTag in params
     * @param response response containing information about the user
     */
    public getBookstoreEntriesForUser = async (request: Request,response:Response)=> {
        try{
            const user = response.locals.user as GoodReadsUser
            const storeTag = request.params.storeTag ? request.params.storeTag : undefined;
            const books = await this.bookService.getBookstoreEntriesForUser(user,storeTag);
            return response.json(books)
        }catch (error) {
            console.log(error)
            response.status(500).send("Error getting book prices")
        }
    }
}