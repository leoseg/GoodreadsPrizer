import { Router } from 'express';
import {Container} from "typedi";
import {UserController} from "../controller/userController";

export const userRouter = Router()
const userController = Container.get(UserController)

//
userRouter.post("/user",userController.update)
userRouter.delete("/user",userController.remove)
userRouter.get("/user", userController.one)
userRouter.get("/logout", userController.logout)