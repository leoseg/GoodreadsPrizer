import {Repository} from "typeorm";
import {BookGoodRead} from "../entity/bookGoodRead";
import {AppDataSource} from "../db/postgresConfig";

/**
 * Controller for the BookGoodRead entity
 */
export class BookGoodReadController{
    private bookGoodReadRepository:Repository<BookGoodRead> = AppDataSource.getRepository(BookGoodRead)

    /**
     * Upserts a list of books by their Title and Author and returns the list of books
     * @param books books to upsert
     */
    async upsertBookList(books:Array<BookGoodRead>){
        // Fetch all books that match the provided titles and authors in one go
        return this.bookGoodReadRepository.upsert(books,["uniqueIndex"])
        // const existingBooks = await this.bookGoodReadRepository.find({
        //     where: books.map(bookDetail => ({ title: bookDetail.title, author: bookDetail.author }))
        // });
        // const existingBookMap = new Map(
        //     existingBooks.map(book => [`${book.title}-${book.author}`, book])
        // );
        //
        // const booksToCreate = books;
        // for(const book of books) {
        //     const key = `${book.title}-${book.author}`;
        //     if (!existingBookMap.has(key)) {
        //         booksToCreate.push();
        //     }
        // }
        // const newBooks = await this.bookGoodReadRepository.save(booksToCreate);
        // return existingBooks.concat(newBooks);
    }

}