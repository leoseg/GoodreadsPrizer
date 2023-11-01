import dotenv from "dotenv";
import path from "path";
dotenv.config({
    path: path.resolve(__dirname+"/../src", `.env.${process.env.NODE_ENV}`)
});
module.exports = {
    NODE_ENV : process.env.NODE_ENV || 'development',
    HOST : process.env.HOST || 'localhost',
    PORT : process.env.PORT || 3000,
    GOODREADS_USERID : process.env.GOODREADS_USERID,
    GOODREADS_USERNAME: process.env.GOODREADS_USERNAME,
    COGNITO_USER_POOL_ID : process.env.COGNITO_USER_POOL_ID,
    AWS_DEFAULT_REGION : process.env.AWS_DEFAULT_REGION,
    LOGIN_URL : process.env.LOGIN_URL,
    TESTUSERNAME : process.env.TESTUSERNAME,
    TESTUSERPASSWORD : process.env.TESTUSERPASSWORD,
    DB_HOST : process.env.DB_HOST || "localhost",
    DB_USER : process.env.DB_USER || "test-user",
    DB_PASSWORD : process.env.DB_PASSWORD || " ",
    DB_NAME : process.env.DB_NAME || "test-db",
    DB_PORT : process.env.DB_PORT || 5433,
    DROP_SCHEMA : process.env.DROP_SCHEMA || false,
    PRICEALGORITHM : process.env.PRICEALGORITHM || "AsyncPricer",
}