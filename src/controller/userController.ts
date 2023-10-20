import {AppDataSource} from "../db/postgresConfig";
import {User} from "../entity/user";
import {NextFunction,Request,Response} from "express";
import {BookGoodRead} from "../entity/bookGoodRead";

export class UserController {
    private userRepository = AppDataSource.getRepository(User);


    async one(request:Request) {
        const id = parseInt(request.params.id);
        const user = await this.userRepository.findOne({
            where: { id }
        });
        if (!user) {
            return "unregistered user";
        }
        return user;
    }
    async save(request: Request): Promise<User> {
        const {goodreadsName,goodreadsID}   = request.body;
        const user = Object.assign(new User(), {
            goodreadsName,
            goodreadsID
        });
        return this.userRepository.save(user);
    }

    async getBookList(request:Request): Promise<Array<BookGoodRead>>{
        const id = parseInt(request.params.id);
        const user = await this.userRepository.findOne({
            where: { id }
        });
        if (!user) {
            return [];
        }
        return user.booksGoodRead;
    }
    // async remove(request:R, response, next) {
    //     const id = parseInt(request.params.id);
    //     let userToRemove = await this.userRepository.findOneBy({ id });
    //     if (!userToRemove) {
    //         return "this user not exist";
    //     }
    //     await this.userRepository.remove(userToRemove);
    //     return "user has been removed";
    // }
}