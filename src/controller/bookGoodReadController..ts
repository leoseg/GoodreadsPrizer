import {Repository} from "typeorm";
import {BookGoodRead} from "../entity/bookGoodRead";
import {AppDataSource} from "../db/postgresConfig";

/**
 * Controller for the BookGoodRead entity
 */
export class BookGoodReadController{
    private bookGoodReadRepository:Repository<BookGoodRead> = AppDataSource.getRepository(BookGoodRead)

    /**
     * Get all the BookGoodReads entries
     */
    async all(){
        return this.bookGoodReadRepository.find()
    }

    /**
     * Insert a BookGoodRead entry
     * @param bookGoodRead
     */
    async insert(bookGoodRead:BookGoodRead){
        return this.bookGoodReadRepository.save(bookGoodRead)
    }

    /**
     * Insert many BookGoodRead entries
     * @param bookGoodReads
     */
    async insertMany(bookGoodReads:BookGoodRead[]){
        return this.bookGoodReadRepository.save(bookGoodReads)
    }
}