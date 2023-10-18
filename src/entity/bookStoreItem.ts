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

    @Column({ type: 'float' })
    priceEbook!: number;

    @Column({ type: 'float' })
    price!: number;

    @Column({ type: 'float' })
    pricePaperback!: number;

    @ManyToOne(() => BookGoodRead, (bookGoodRead) => bookGoodRead.storeItems)
    bookGoodRead!: BookGoodRead;
}