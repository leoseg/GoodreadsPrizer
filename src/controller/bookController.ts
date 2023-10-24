import {Container, Service} from "typedi";
import {BookService} from "../service/bookService";
import {Request, Response} from "express";

@Service()
export class BookController{

    private bookService:BookService = Container.get(BookService)

    /**
     * Update the book prices for a user
     * @param request request containing the userId in cookkies
     * @param response response containing the status of the request
     */
    public async updateBookPricesForUser(request:Request,response:Response):Promise<void>{
        const body = request.body;
        this.bookService.updateBookPricesForUser(body.userID);
        response.status(200).send("Book price updating in progress");
    }


    /**
     * Get all the BookStoreItem entries for a user
     * @param request request containing the userId in cookkies and the storeTag in params
     */
    async getBookstoreEntriesForUser(request: Request) {
        const userId = parseInt(request.cookies.userId);
        const storeTag = request.params.storeTag;
        return await this.bookService.getBookstoreEntriesForUser(userId,storeTag);
    }
}