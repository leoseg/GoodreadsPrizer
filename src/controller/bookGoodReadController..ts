import {Repository} from "typeorm";
import {BookGoodRead} from "../entity/bookGoodRead";
import {AppDataSource} from "../db/postgresConfig";


export class BookGoodReadController{
    private bookGoodReadRepository:Repository<BookGoodRead> = AppDataSource.getRepository(BookGoodRead)

    async all(){
        return this.bookGoodReadRepository.find()
    }

    async insert(bookGoodRead:BookGoodRead){
        return this.bookGoodReadRepository.save(bookGoodRead)
    }

    async insertMany(bookGoodReads:BookGoodRead[]){
        return this.bookGoodReadRepository.save(bookGoodReads)
    }
}