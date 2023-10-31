import express from "express"
import {
    json
} from "body-parser"
import {booksRouter} from "./router/booksRouter";
import {userRouter} from "./router/userRouter";
import {validateAuth} from "./middleware/auth";
import {AppDataSource} from "./db/postgresConfig";
import https from "https";
import fs from "fs";
const config =  require('./config');

AppDataSource.initialize().then(() => console.log("Database initialized")).catch(
    (err) => console.log(err)
)


// create express app
const app = express()
app.use(json())
app.use(validateAuth)
app.use("/users",userRouter)
app.use("/books",booksRouter)
// start express server
https.createServer(
    {
        key: fs.readFileSync("./key.pem"),
        cert: fs.readFileSync("./cert.pem"),
    },app).listen(config.PORT)
console.log(`Express server has started on port ${config.PORT}. Open http://localhost:${config.PORT}/ to see results`)

