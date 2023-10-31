import {Column, Entity, JoinTable, ManyToMany, PrimaryColumn} from "typeorm";
import {BookGoodRead} from "./bookGoodRead";

@Entity()
export class GoodReadsUser {

    @PrimaryColumn("uuid")
    id!: string;

    @Column()
    goodreadsName!: string;

    @Column()
    goodreadsID!: string;

    @ManyToMany(() => BookGoodRead, {cascade: ["insert","update"]}
        )
    @JoinTable({name:"user_book"})
    booksGoodRead!: BookGoodRead[];

    //
    // @OneToMany(()=> BookStoreItem, (bookStoreItem) => bookStoreItem.bookGoodRead,{cascade: ["insert","update"]})
    // storeItems!: BookStoreItem[];

}
