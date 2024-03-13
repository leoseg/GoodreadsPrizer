import {ThaliaPrices} from "../thaliaPrices";
import axios from "axios";
import {grmPage, suesspage, thaliaBookPage, thaliaSearchResult} from "../../../testdata/mockThaliaPage";
import {BookGoodRead} from "../../../entity/bookGoodRead";
import {BookStoreItem} from "../../../entity/bookStoreItem";
jest.mock('axios');
axios.get = jest.fn()
describe("ThaliaPrices", () => {
    let thaliaPricesTestClass: ThaliaPrices;
    beforeAll(() => {
        thaliaPricesTestClass = new ThaliaPrices();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    // afterAll(() => {
    //     thaliaPricesTestClass.contentFetcher.close();
    // });

    describe("getStoreSearchParams", () => {
        it("should return title + author", () => {
            const bookData = new BookGoodRead();
            bookData.author = "testauthor";
            bookData.title = "testtitle";
            bookData.isbn = "isbn";
            bookData.isbn13 = "isbn13";
            const expected = "testtitle+testauthor";
            const result = thaliaPricesTestClass.getStoreSearchParams(bookData);
            expect(result).toBe(expected);
        });
        it("should return title with + in the gaps + author if isbn and isbn13 are not provided", () => {
            const bookData = new BookGoodRead();
            bookData.author = "testauthor";
            bookData.title = "test title";
            bookData.isbn = "";
            bookData.isbn13 = "";
            const expected = "test+title+testauthor";
            const result = thaliaPricesTestClass.getStoreSearchParams(bookData);
            expect(result).toBe(expected);
        });
    });
    describe("getStoreBookUrl", () => {
        it("should return the book url if the book is found", () => {
            const url:string = thaliaPricesTestClass.getStoreBookUrl(thaliaSearchResult, "Die Haushälterin","Fielding, Joy");
            const expectedUrl ="https://www.thalia.de/shop/home/artikeldetails/A1063536722"
            expect(url).toBe(expectedUrl);
        });
        it("should return the book url for suess book if found", () => {
            const url:string = thaliaPricesTestClass.getStoreBookUrl(suesspage,"Süss : Süss: eine feministische Kritik",'Tlusty, Ann-Kristin');
            const expectedUrl ="https://www.thalia.de/shop/home/artikeldetails/A1060434456"
            expect(url).toBe(expectedUrl);
        });
        it("should return the book url for grm book if found", () => {
            const url:string = thaliaPricesTestClass.getStoreBookUrl(grmPage,'GRM: Brainfuck','Berg, Sibylle');
            const expectedUrl ="https://www.thalia.de/shop/home/artikeldetails/A1065393050"
            expect(url).toBe(expectedUrl);
        });
    });

    describe("getStoreBookData", () => {
        it("should return the book data given the html response", () => {
            const bookData = thaliaPricesTestClass.getStoreBookData(thaliaBookPage,"https://www.thalia.de/shop/home/artikeldetails/A1063536722");
            const expectedBookData : BookStoreItem = new BookStoreItem();
            expectedBookData.price = "22,00 €";
            expectedBookData.pricePaperback = "13,00 €";
            expectedBookData.priceEbook= "10,99 €";
            expectedBookData.url = "https://www.thalia.de/shop/home/artikeldetails/A1063536722";
            expectedBookData.storeID="A1063536722";
            expectedBookData.storeTag ="Thalia";
            expect(bookData).toEqual(expectedBookData);
        });
    });
});