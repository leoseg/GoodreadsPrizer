import CognitoExpress from "cognito-express"
import {Request,Response,NextFunction} from "express"
const config = require("../config")
// Setup CognitoExpress
const cognitoExpress = new CognitoExpress({
    region: config.AWS_DEFAULT_REGION,
    cognitoUserPoolId: config.COGNITO_USER_POOL_ID,
    tokenUse: "access",
    tokenExpiration: 3600
})

export function validateAuth (request : Request, response:Response, next:NextFunction)  {
    // Check that the request contains a token
    if (request.headers.authorization && request.headers.authorization.split(" ")[0] === "Bearer") {
        // Validate the token
        const token = request.headers.authorization.split(" ")[1]
        cognitoExpress.validate(token, function (err: any, response: Response) {
            if (err) {
                // If there was an error, return a 401 Unauthorized along with the error
                response.status(401).send({
                    error: "Not authenticated",
                    idp: process.env.LOGIN_URL,
                    detail: err.message
                });
            } else {
                response.locals.user = response;
                next();
            }
        });
    } else {
        // If there is no token, respond appropriately
        // @ts-ignore
        return response.redirect(process.env.LOGIN_URL)
    }
}