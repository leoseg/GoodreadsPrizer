// UserController.ts
import { Request, Response } from 'express';
import { Service } from 'typedi';
import { UserService } from '../service/userService';

@Service()
export class UserController {
    constructor(private userService: UserService) {}

    public one = async (request: Request, response: Response): Promise<Response> => {
        const id = response.locals.user.sub;
        try {
            const user = await this.userService.findOneById(id);
            if (!user) {
                return response.status(404).send("User not found");
            }
            return response.json(user);
        } catch (error) {
            console.error(error);
            return response.status(500).send("An error occurred");
        }
    };

    public update = async (request: Request, response: Response): Promise<Response> => {
        const id = response.locals.user.sub;
        console.log(request.body)
        try {
            const user = await this.userService.updateUser(id, request.body.goodreadsName, request.body.goodreadsID);
            return response.json(user);
        } catch (error) {
            console.error(error);
            return response.status(500).send("An error occurred");
        }
    };

    public logout = async (request: Request, response: Response): Promise<Response> => {
        response.clearCookie("accessToken");
        return response.status(200).send("User logged out successfully");
    };

    public remove = async (request: Request, response: Response): Promise<Response> => {
        const id = response.locals.user.sub;
        try {
            await this.userService.deleteUser(id, request.cookies.AccessToken);
            response.clearCookie("accessToken");
            return response.status(200).send("User deleted successfully");
        } catch (error) {
            console.error("Error:", error);
            return response.status(500).send("Error deleting user");
        }
    };
}
