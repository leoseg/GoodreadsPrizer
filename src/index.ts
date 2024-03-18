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
import {Container} from "typedi";
import {RabbitMQ} from "./messagequeues/rabbitmq";
const rabbitmq = Container.get(RabbitMQ);
AppDataSource.initialize().then( async ()=>{
    if(config.PRICEALGORITHM === "AsyncPricerRabbit"){
    await rabbitmq.initialize()
    console.log("rabbitmq initialized")
}}).then(
    () => {
        console.log(config)
        // var corsOptions = {
        //     origin: config.PUBLIC_FRONTEND_URL,
        //     credentials: true
        // }
        var corsOptions = {
            origin: '*',
            optionsSuccessStatus: 200,
            credentials: true
        }
        // create express app
        const app = express()
        app.use((req, res, next) => {
          console.log(`Origin: ${req.header('Origin')}`);
          next();
        });
        app.use(json())
        app.use(cors(corsOptions));
        app.use((req, res, next) => {
          res.header("X-Content-Type-Options", "nosniff");
          next();
        });
        app.use((req, res, next) => {
          res.setHeader("Feature-Policy", "geolocation 'none'; microphone 'none'; camera 'none'; display-capture 'none'; payment 'none'");
          next();
        });
        app.use(function(req, res, next) {
          res.header("X-Permitted-Cross-Domain-Policies", "none");
          next();
        });
        app.use((req, res, next) => {
          res.header("Referrer-Policy", "same-origin");
          next();
        });
        app.use(cookieParser());
        app.use("/users",validateAuth,userRouter)
        app.use("/books",validateAuth,userDataCheck,booksRouter)
        app.use("",authRouter)

        // start express server
        app.listen(config.PORT)
        console.log(`Express server has started on port ${config.PORT}. Open http://localhost:${config.PORT}/ to see results`)
    }).catch(
    (err) => {
        console.log(err);
        shutdown()
    }
)

async function shutdown() {
    try {
        await rabbitmq.close();
        console.log('Cleanup completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
}




