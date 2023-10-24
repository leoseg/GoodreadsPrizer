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
     */
    async one(request:Request) {
        const id = parseInt(request.params.id);
        const user = await this.userRepository.findOne({
            where: { id },relations:["booksGoodRead"]
        });
        if (!user) {
            console.log("unregistered user");
            return null;
        }
        return user;
    }

    /**
     * Save a new user
     * @param request request containing the user in body
     */
    async save(request: Request): Promise<User> {
        const {goodreadsName,goodreadsID}   = request.body;
        const user = Object.assign(new User(), {
            goodreadsName,
            goodreadsID
        });
        return this.userRepository.save(user);
    }

    /**
     * Remove a user
     * @param request request containing the userId in params
     * @param response response containing the status of the request
     */
    async remove(request:Request, response:Response){
        const id = parseInt(request.params.id);
        let userToRemove = await this.userRepository.findOneBy({ id });
        if (!userToRemove) {
            return response.status(404).send("this user not exist");
        }
        await this.userRepository.remove(userToRemove);
        return response.status(200).send("user has been removed");
    }
}