import {Column, Entity, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {BookGoodRead} from "./bookGoodRead";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    goodreadsName!: string;

    @Column()
    goodreadsID!: string;

    @ManyToMany(() => BookGoodRead, (bookGoodRead) => bookGoodRead.users)
    booksGoodRead!: BookGoodRead[];
}
