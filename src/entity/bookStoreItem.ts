import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {BookGoodRead} from "./bookGoodRead";

@Entity()
export class BookStoreItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    author!: string;

    @Column()
    title!: string;

    @Column()
    storeID!: string;

    @Column()
    url!: string;

    @Column()
    storeTag!: string

    @Column()
    priceEbook!: string;

    @Column()
    price!: string;

    @Column()
    pricePaperback!: string;

    @ManyToOne(() => BookGoodRead, (bookGoodRead) => bookGoodRead.storeItems)
    bookGoodRead!: BookGoodRead;
}