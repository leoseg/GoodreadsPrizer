import {
    Entity,
    Column,
    OneToMany,
    Index, PrimaryColumn
} from 'typeorm';
import {BookStoreItem} from "./bookStoreItem";


@Entity()
@Index('unique_index', ['title', 'author'], { unique: true })
export class BookGoodRead {


    @PrimaryColumn()
    author!: string;

    @PrimaryColumn()
    title!: string;

    @Column()
    isbn!: string;

    @Column()
    isbn13!: string;

    @Column()
    url!: string;

    @Column()
    numPages!: number;

    @OneToMany(() => BookStoreItem, (storeItem) => storeItem.bookGoodRead,{cascade: ["insert","update"]})
    storeItems!: BookStoreItem[] ;

    //
    // @ManyToMany(() => GoodReadsUser, (user) => user.booksGoodRead, )
    // users!: GoodReadsUser[];

}



