import {BookGoodReadController} from "../controller/bookGoodReadController.";
import { Router } from 'express';
import {BookStoreItemController} from "../controller/bookStoreItemController";

export const booksRouter = Router()
const bookGoodReadController = new BookGoodReadController()
const bookStoreItemController = new BookStoreItemController()
//
// booksRouter.post("/bookPrices", ( req, res ) => {
//     const tag = req.body.tag
//
//
//     const bookList = bookGoodReadController.
//     return res.send(bookStoreItemController.findByListOfBooks(bookList,tag))
// })