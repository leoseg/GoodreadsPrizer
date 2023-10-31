import {BookGoodRead} from "../entity/bookGoodRead";
import {GoodReadsUser} from "../entity/goodReadsUser";
import {BookStoreItem} from "../entity/bookStoreItem";
import {v4 as uuidv4} from 'uuid';


const user1 = new GoodReadsUser()
user1.goodreadsName = "testuser"
user1.goodreadsID = "12345623"
user1.id=uuidv4()
const user2 = new GoodReadsUser()
user2.goodreadsName = "testuser2"
user2.goodreadsID = "12345624"
user2.id =uuidv4()
export var users: GoodReadsUser[] = [user1,user2
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
        position: 1,
    },
    {
        author: 'Author 2',
        title: 'Book 2',
        isbn: '0987654321',
        isbn13: '9780987654321',
        url: 'https://example.com/book2',
        numPages: 300,
        storeItems: [],
        position: 2,
    },
    {
        author: 'Author 3',
        title: 'Book 3',
        isbn: '5432109876',
        isbn13: '9785432109876',
        url: 'https://example.com/book3',
        numPages: 400,
        storeItems: [],
        position: 3,
    },
];

// create store items for testing
const storeItem1 = new BookStoreItem()
// storeItem1.author = "Author 1"
// storeItem1.title = "Book 1"
storeItem1.storeID = "store1"
storeItem1.url = "https://example.com/book1/store1"
storeItem1.storeTag = "Thalia"
storeItem1.priceEbook = "9.99"
storeItem1.price = "19.99"
storeItem1.pricePaperback = "29.99"
const storeItem2 = new BookStoreItem()
// storeItem2.author = "Author 1"
// storeItem2.title = "Book 1"
storeItem2.storeID = "store2"
storeItem2.url = "https://example.com/book1/store2"
storeItem2.storeTag = "test"
storeItem2.priceEbook = "9.99"
storeItem2.price = "19.99"
storeItem2.pricePaperback = "29.99"
const storeItem3 = new BookStoreItem()
// storeItem3.author = "Author 2"
// storeItem3.title = "Book 2"
storeItem3.storeID = "store1"
storeItem3.url = "https://example.com/book2/store1"
storeItem3.storeTag = "Thalia"
storeItem3.priceEbook = "9.99"
storeItem3.price = "19.99"
storeItem3.pricePaperback = "29.99"
const storeItem4 = new BookStoreItem()
// storeItem4.author = "Author 2"
// storeItem4.title = "Book 2"
storeItem4.storeID = "store2"
storeItem4.url = "https://example.com/book2/store2"
storeItem4.storeTag = "test"
storeItem4.priceEbook = "9.99"
storeItem4.price = "19.99"
storeItem4.pricePaperback = "29.99"
const storeItem5 = new BookStoreItem()
// storeItem5.author = "Author 3"
// storeItem5.title = "Book 3"
storeItem5.storeID = "store1"
storeItem5.url = "https://example.com/book3/store1"
storeItem5.storeTag = "Thalia"
storeItem5.priceEbook = "9.99"
storeItem5.price = "19.99"
storeItem5.pricePaperback = "29.99"
export const storeItems = [storeItem1,storeItem2,storeItem3,storeItem4,storeItem5]
testBooks[0].storeItems = [ storeItem1,storeItem2]
testBooks[1].storeItems = [ storeItem3,storeItem4]
    testBooks[2].storeItems = [storeItem5]
//
users[0].booksGoodRead = [
    testBooks[0],testBooks[1]]

users[1].booksGoodRead = [
    testBooks[1],testBooks[2]
]
export var newBook: BookGoodRead = new BookGoodRead()
newBook.title = "New Book 1"
newBook.author = "New Author 1"
newBook.storeItems = [
]
newBook.isbn = "123456789"
newBook.isbn13 = "123456789"
newBook.url = "https://goodreads.com/book1"
newBook.numPages = 100
newBook.position = 4


export var notRealNewBook: BookGoodRead = new BookGoodRead()
notRealNewBook.title = testBooks[2].title
notRealNewBook.author = testBooks[2].author
notRealNewBook.storeItems = [
]
notRealNewBook.isbn = testBooks[2].isbn
notRealNewBook.isbn13 = testBooks[2].isbn13
notRealNewBook.url = testBooks[2].url
notRealNewBook.numPages = testBooks[2].numPages
notRealNewBook.position = testBooks[2].position

export var newBookWithStorePrices: BookGoodRead = new BookGoodRead()
newBookWithStorePrices.title = "New Book 1"
newBookWithStorePrices.author = "New Author 1"
newBookWithStorePrices.storeItems = [
]
newBookWithStorePrices.isbn = "123456789"
newBookWithStorePrices.isbn13 = "123456789"
newBookWithStorePrices.url = "https://goodreads.com/book1"
newBookWithStorePrices.numPages = 100
newBookWithStorePrices.position = 4
export var newStoreBook = new BookStoreItem()
newStoreBook.storeTag = "Thalia"
newStoreBook.price = "10 €"
newStoreBook.priceEbook = "10 €"
newStoreBook.pricePaperback = "10 €"
// newStoreBook.title = "New Book 1"
// newStoreBook.author = "New Author 1"
newStoreBook.bookGoodRead = newBookWithStorePrices
newStoreBook.storeID = "art1234"
newStoreBook.url = "https://thalia.com/art1234"
newBookWithStorePrices.storeItems = [newStoreBook]

export var alreadyInUserListbook: BookGoodRead = new BookGoodRead()
alreadyInUserListbook.title = testBooks[0].title
alreadyInUserListbook.author = testBooks[0].author
alreadyInUserListbook.storeItems = [
]
alreadyInUserListbook.isbn = testBooks[0].isbn
alreadyInUserListbook.isbn13 = testBooks[0].isbn13
alreadyInUserListbook.url = testBooks[0].url
alreadyInUserListbook.numPages = testBooks[0].numPages
alreadyInUserListbook.position = testBooks[0].position