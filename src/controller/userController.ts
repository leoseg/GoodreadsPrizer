import {AppDataSource} from "../db/postgresConfig";
import {GoodReadsUser} from "../entity/goodReadsUser";
import {Request,Response} from "express";
import {Service} from "typedi";
import AWS from "aws-sdk";

@Service()
export class UserController {
    private userRepository = AppDataSource.getRepository(GoodReadsUser);

    private cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

    /**
     * Get one user by id
     * @param request request containing the userId in params
     * @param response response containing the status of the request
     */
    async one(request:Request,response:Response): Promise<GoodReadsUser | null> {
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
    async update(request: Request,response:Response): Promise<GoodReadsUser> {
        const id = response.locals.user.sub
        const {goodreadsName,goodreadsID}   = request.body;
        const user = new GoodReadsUser()
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
        try {
          var params = {
            AccessToken: request.headers.authorization!.split(" ")[1]
          };
          await this.userRepository.remove(userToRemove);
          await new Promise((resolve, reject) => {
            this.cognitoidentityserviceprovider.deleteUser(params, async (err, data) => {
              if (err) {
                console.log(err, err.stack);
                await this.userRepository.insert(userToRemove!);
                reject(err);
              } else {
                resolve(data);
              }
            });
          });
          return response.status(200).send("User deleted successfully");
        } catch (e) {
          console.error("Error:", e);
          return response.status(500).send("Error deleting user");
        }
    }
}