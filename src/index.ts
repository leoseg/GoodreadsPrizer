import express from "express"
import {
    json
} from "body-parser"
import {booksRouter} from "./router/booksRouter";
import {userRouter} from "./router/userRouter";
import {validateAuth} from "./middleware/auth";
import {AppDataSource} from "./db/postgresConfig";
import cookieParser from "cookie-parser";
import "reflect-metadata";
const config =  require('./config');
import cors from "cors";
import {authRouter} from "./router/authRouter";
import {userDataCheck} from "./middleware/userDataCheck.ts";

AppDataSource.initialize().then(() => console.log("Database initialized")).catch(
    (err) => console.log(err)
)

var corsOptions = {
    origin: "http://localhost:3001",
    credentials: true
}

// create express app
const app = express()
app.use(json())
app.use(cors(corsOptions));
app.use(cookieParser());
app.use("/users",validateAuth,userRouter)
app.use("/books",validateAuth,userDataCheck,booksRouter)
app.use("",authRouter)

// start express server
app.listen(config.PORT)
console.log(`Express server has started on port ${config.PORT}. Open http://localhost:${config.PORT}/ to see results`)

