import "reflect-metadata"
import { DataSource } from "typeorm"
import { GoodReadsUser } from "../entity/goodReadsUser"
import {BookGoodRead} from "../entity/bookGoodRead";
import {BookStoreItem} from "../entity/bookStoreItem";
const config = require("../config")
export const AppDataSource = new DataSource({
    type: "postgres",
    host: config.DB_HOST,
    port: parseInt(config.DB_PORT!),
    username: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [GoodReadsUser,BookGoodRead,BookStoreItem],
    migrations: ["src/db/migration/*.ts"],
    dropSchema: config.DROP_SCHEMA === "true",
    migrationsRun: true,
    subscribers: [],

})
