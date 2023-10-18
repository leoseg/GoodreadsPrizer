import {BookStoreItem} from "../entity/bookStoreItem";
import {Repository} from "typeorm";
import {AppDataSource} from "../db/postgresConfig";


export class BookStoreItemController{
    private bookStoreItemRepository:Repository<BookStoreItem> = AppDataSource.getRepository(BookStoreItem)

    async all(){
        return this.bookStoreItemRepository.find()
    }

    async insert(bookStoreItem:BookStoreItem){
        return this.bookStoreItemRepository.save(bookStoreItem)
    }

    async insertMany(bookStoreItems:BookStoreItem[]){
        return this.bookStoreItemRepository.save(bookStoreItems)
    }

    async findByStoreTagAndBookNameAuthor(bookName:string,author:string,storeTag?:string,){
        if(storeTag === undefined){
            return this.bookStoreItemRepository.find({ where: { title: bookName, author: author } })
        }else{
            return this.bookStoreItemRepository.find({ where: { storeTag: storeTag, title: bookName, author: author } })
        }
    }

    async findByListOfBooks(bookList:Array<Array<string>>,storeTag?:string):Promise<Array<BookStoreItem>>{
        const bookStoreItems = await Promise.all(bookList.map(bookData => this.findByStoreTagAndBookNameAuthor(bookData[0],bookData[1],storeTag)))
        return bookStoreItems.flat()
    }
}