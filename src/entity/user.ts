import { Column, Entity, ManyToMany, PrimaryColumn} from "typeorm";
import {BookGoodRead} from "./bookGoodRead";

@Entity()
export class User {

    @PrimaryColumn("uuid")
    id!: string;

    @Column()
    goodreadsName!: string;

    @Column()
    goodreadsID!: string;

    @ManyToMany(() => BookGoodRead, (bookGoodRead) => bookGoodRead.users,{cascade: ["insert","update"]}
        )
    booksGoodRead!: BookGoodRead[];

    //
    // @OneToMany(()=> BookStoreItem, (bookStoreItem) => bookStoreItem.bookGoodRead,{cascade: ["insert","update"]})
    // storeItems!: BookStoreItem[];

}
