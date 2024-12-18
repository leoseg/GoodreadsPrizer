import {Request,Response,NextFunction} from "express";
import {AppDataSource} from "../db/postgresConfig";
import {GoodReadsUser} from "../entity/goodReadsUser";

const userRepository = AppDataSource.getRepository(GoodReadsUser);

/**
 * Middleware to check if the cognito user has a corresponding entry in the goodreadsuser db or is missing
 * the data there
 * @param request request passed trough middleware
 * @param response response passed trough middleware containing the userid
 * @param next next function to call
 */
export function userDataCheck (request:Request,response:Response,next:NextFunction)  {
    console.log("Checking if user has goodreads data")
    if(!response.locals.user){
        response.clearCookie("accessToken");
        console.log("User not logged in")
        return response.status(401).send({
            error: "User not logged in",
        })
    }
    const id = response.locals.user.sub
    userRepository.findOne({ where: {id:id} , cache: true
    }).then((user) => {
        if (!user) {
            console.log("User not found");
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
                error: "No user data found for user"
            })
        }else{
            console.log("User with name: " + user.goodreadsName+ " found")
            response.locals.user= user
            next()
        }
    });
}