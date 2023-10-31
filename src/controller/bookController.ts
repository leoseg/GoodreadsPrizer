import {Container, Service} from "typedi";
import {BookService} from "../service/bookService";
import {Request, Response} from "express";
import {GoodReadsUser} from "../entity/goodReadsUser";


@Service()
export class BookController{


    private bookService:BookService = Container.get(BookService)

    /**
     * Update the book prices for a user with sse
     * @param request request containing the userId in cookkies
     * @param response response containing the status of the request
     */
    public async updateBookPricesForUser(request:Request,response:Response):Promise<void>{
        // const userID = response.locals.user.sub
        try {
            response.setHeader('Content-Type', 'text/event-stream');
            response.setHeader('Cache-Control', 'no-cache');
            response.setHeader('Connection', 'keep-alive');
            const user = response.locals.user as GoodReadsUser
            await this.bookService.updateBookPricesForUser(user);
            response.write("data: Book price updating finished");
            response.end()
        } catch (error) {
            console.log(error)
            response.status(500).send("Error updating book prices")
        }
    }


    /**
     * Get all the BookStoreItem entries for a user
     * @param request request containing the userId in cookkies and the storeTag in params
     * @param response response containing information about the user
     */
    async getBookstoreEntriesForUser(request: Request,response:Response) {
        const userID = response.locals.user.sub
        const storeTag = request.params.storeTag;
        return await this.bookService.getBookstoreEntriesForUser(userID,storeTag);
    }
}