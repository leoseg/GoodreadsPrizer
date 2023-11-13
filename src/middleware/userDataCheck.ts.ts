import {Request,Response,NextFunction} from "express";
import {AppDataSource} from "../db/postgresConfig";
import {GoodReadsUser} from "../entity/goodReadsUser";

const userRepository = AppDataSource.getRepository(GoodReadsUser);
export function userDataCheck (request:Request,response:Response,next:NextFunction)  {
    const id = response.locals.user.sub
    userRepository.findOne({ where: {id:id}
    }).then((user) => {
        if (!user) {
            console.log("User with id: " + id + " not found");
            console.log("New user created with id: " + id);
            userRepository.insert({id:id}).then(() => {
                return response.status(406).send({
                    error: "No goodreadsuserfound, new user created",
                })
                }).catch(
                    (error) => {
                        console.log(error)
                        return response.status(500).send({
                            error: "Something went wrong",
                        })
                    }
            )
            }
        else if(user.goodreadsID === " "|| user.goodreadsName === " "){
            return response.status(406).send({
                error: "No user data found for user with id: " + id,
            })
        }else{
            response.locals.user= user
            next()
        }
    });
}