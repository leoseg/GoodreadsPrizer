import {Request,Response,NextFunction} from "express";
import {AppDataSource} from "../db/postgresConfig";
import {GoodReadsUser} from "../entity/goodReadsUser";

const userRepository = AppDataSource.getRepository(GoodReadsUser);
export function userDataCheck (request:Request,response:Response,next:NextFunction)  {
    const id = response.locals.user.sub
    userRepository.findOne({ where:id,relations:["booksGoodRead"]}).then((user) => {
        if (!user) {
            console.log("unregistered user");
            return response.status(404).send({
                error: "No user found",
            })}
        if( user.goodreadsID === null || user.goodreadsName === null){
            return response.status(400).send({
                error: "No user data found",
            })
        }else{
            response.locals.user= user
            next()
        }
    });
}