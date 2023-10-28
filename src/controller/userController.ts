import {AppDataSource} from "../db/postgresConfig";
import {User} from "../entity/user";
import {Request,Response} from "express";
import {Service} from "typedi";

@Service()
export class UserController {
    private userRepository = AppDataSource.getRepository(User);


    /**
     * Get one user by id
     * @param request request containing the userId in params
     * @param response response containing the status of the request
     */
    async one(request:Request,response:Response): Promise<User | null> {
        const id = response.locals.user.sub
        const user =  await this.userRepository.findOne({ where:id,relations:["booksGoodRead"]});
        if (!user) {
            console.log("unregistered user");
            return null;
        }
        return user;
    }

    /**
     * Update a new user
     * @param request request containing the user in body
     * @param response response containing information about the user
     */
    async update(request: Request,response:Response): Promise<User> {
        const id = response.locals.user.sub
        const {goodreadsName,goodreadsID}   = request.body;
        const user = new User()
        user.id = id
        user.goodreadsID = goodreadsID
        user.goodreadsName = goodreadsName
        return this.userRepository.save(user);
    }

    /**
     * Remove a user
     * @param request request containing the userId in params
     * @param response response containing information of the user
     */
    async remove(request:Request, response:Response){
        const id = response.locals.user.sub
        let userToRemove = await this.userRepository.findOneBy({ id });
        if (!userToRemove) {
            return response.status(404).send("this user not exist");
        }
        await this.userRepository.remove(userToRemove);
        return response.status(200).send("user has been removed");
    }
}