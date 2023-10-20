import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToMany,
    JoinTable, Index
} from 'typeorm';
import {BookStoreItem} from "./bookStoreItem";
import {User} from "./user";

@Entity()
@Index('unique_index', ['title', 'author'], { unique: true })
export class BookGoodRead {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    author!: string;

    @Column()
    title!: string;

    @Column()
    isbn!: string;

    @Column()
    isbn13!: string;

    @Column()
    url!: string;

    @Column()
    numPages!: number;

    @OneToMany(() => BookStoreItem, (storeItem) => storeItem.bookGoodRead)
    storeItems: BookStoreItem[] = [];

    @ManyToMany(() => User, (user) => user.booksGoodRead)
    @JoinTable()
    users!: User[];
}



