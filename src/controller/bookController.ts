import {Container, Service} from "typedi";
import {BookService} from "../service/bookService";
import {Request, Response} from "express";
import {GoodReadsUser} from "../entity/goodReadsUser";


@Service()
export class BookController{


    private bookService:BookService = Container.get(BookService)

    /**
     * Update the book prices for a user
     * @param request request containing the userId in cookkies
     * @param response response containing the status of the request
     */
    public async updateBookPricesForUser(request:Request,response:Response):Promise<void>{
        // const userID = response.locals.user.sub
        const user = response.locals.user as GoodReadsUser
        this.bookService.updateBookPricesForUser(user);
        response.status(200).send("Book price updating in progress");
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