import {BookGoodRead} from "../../entity/bookGoodRead";
import {User} from "../../entity/user";
import {BookStoreItem} from "../../entity/bookStoreItem";
import {v4 as uuidv4} from 'uuid';


const user1 = new User()
user1.goodreadsName = "testuser"
user1.goodreadsID = "12345623"
user1.id=uuidv4()
const user2 = new User()
user2.goodreadsName = "testuser2"
user2.goodreadsID = "12345624"
user2.id =uuidv4()
export var users: User[] = [user1,user2
]


export var testBooks :BookGoodRead[] = [
    {
        author: 'Author 1',
        title: 'Book 1',
        isbn: '1234567890',
        isbn13: '9781234567890',
        url: 'https://example.com/book1',
        numPages: 200,
        storeItems: [],
        users: [users[0]],
    },
    {
        author: 'Author 2',
        title: 'Book 2',
        isbn: '0987654321',
        isbn13: '9780987654321',
        url: 'https://example.com/book2',
        numPages: 300,
        storeItems: [],
        users: [users[0],users[1]],
    },
    {
        author: 'Author 3',
        title: 'Book 3',
        isbn: '5432109876',
        isbn13: '9785432109876',
        url: 'https://example.com/book3',
        numPages: 400,
        storeItems: [],
        users: [users[1]],
    },
];

testBooks[0].storeItems = [ {
    id: 1,
    author: 'Author 1',
    title: 'Book 1',
    storeID: 'store1',
    url: 'https://example.com/book1/store1',
    storeTag: 'test1',
    priceEbook: '9.99',
    price: '19.99',
    pricePaperback: '29.99',
    bookGoodRead: testBooks[0]
},
    {
        id: 2,
        author: 'Author 1',
        title: 'Book 1',
        storeID: 'store2',
        url: 'https://example.com/book1/store2',
        storeTag: 'test',
        priceEbook: '9.99',
        price: '19.99',
        pricePaperback: '29.99',
        bookGoodRead: testBooks[0],
    },

]

testBooks[1].storeItems = [
    {
        id: 3,
        author: 'Author 2',
        title: 'Book 2',
        storeID: 'store1',
        url: 'https://example.com/book2/store1',
        storeTag: 'Thalia',
        priceEbook: '9.99',
        price: '19.99',
        pricePaperback: '29.99',
        bookGoodRead: testBooks[1],
    },
    {
        id: 4,
        author: 'Author 2',
        title: 'Book 2',
        storeID: 'store2',
        url: 'https://example.com/book2/store2',
        storeTag: 'test',
        priceEbook: '9.99',
        price: '19.99',
        pricePaperback: '29.99',
        bookGoodRead: testBooks[1],
    },
]

testBooks[2].storeItems = [
    {
        id: 5,
        author: 'Author 3',
        title: 'Book 3',
        storeID: 'store1',
        url: 'https://example.com/book3/store1',
        storeTag: 'Thalia',
        priceEbook: '9.99',
        price: '19.99',
        pricePaperback: '29.99',
        bookGoodRead: testBooks[2],
    }
]
//
users[0].booksGoodRead = [
    testBooks[0],testBooks[1]]

users[1].booksGoodRead = [
    testBooks[1],testBooks[2]
]

export var newStoreBook = new BookStoreItem()
newStoreBook.storeTag = "Thalia"
newStoreBook.price = "10 €"
newStoreBook.priceEbook = "10 €"
newStoreBook.pricePaperback = "10 €"
newStoreBook.title = "New Book 1"
newStoreBook.author = "New Author 1"
newStoreBook.bookGoodRead = testBooks[2]
newStoreBook.storeID = "art1234"
newStoreBook.url = "https://thalia.com/art1234"
export var newBook: BookGoodRead = new BookGoodRead()
newBook.title = "New Book 1"
newBook.author = "New Author 1"
newBook.storeItems = [
]
newBook.isbn = "123456789"
newBook.isbn13 = "123456789"
newBook.url = "https://goodreads.com/book1"
newBook.numPages = 100
export var notRealNewBook: BookGoodRead = new BookGoodRead()
notRealNewBook.title = testBooks[2].title
notRealNewBook.author = testBooks[2].author
notRealNewBook.storeItems = [
]
notRealNewBook.isbn = testBooks[2].isbn
notRealNewBook.isbn13 = testBooks[2].isbn13
notRealNewBook.url = testBooks[2].url
notRealNewBook.numPages = testBooks[2].numPages