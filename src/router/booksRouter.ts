import { Router } from 'express';
import {Container} from "typedi";
import {BookController} from "../controller/bookController";

export const booksRouter = Router()
const bookController = Container.get(BookController)

//
booksRouter.post("/bookPricesUpdate", bookController.updateBookPricesForUser)
booksRouter.get("/bookPrices/:storeTag", bookController.getBookstoreEntriesForUser)