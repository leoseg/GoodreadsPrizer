import CognitoExpress from "cognito-express"
import {Request,Response,NextFunction} from "express"
const config = require("../config")
console.log(config)
// Setup CognitoExpress
const cognitoExpress = new CognitoExpress({
    region: config.AWS_DEFAULT_REGION,
    cognitoUserPoolId: config.COGNITO_USER_POOL_ID,
    tokenUse: "access",
    tokenExpiration: 3600
})

/**
 * Middleware to validate the access token
 * @param request request containing the access token in cookies
 * @param response response containing the status of the request and the user information
 * @param next next function to call
 */
export function validateAuth (request : Request, response:Response, next:NextFunction)  {
    // Check that the request contains a token
    if (!request.cookies || !request.cookies.accessToken) return response.status(401).send({
        error: "Not authenticated",
        detail: "Access Token missing from header"
    })
    let accessTokenFromClient = request.cookies.accessToken;
    // Validate the token and if valid, the response will contain user information
    cognitoExpress.validate(accessTokenFromClient, function (err: any, cognitoResponse: Response) {
    if (err) {
        console.error('Token validation failed:', err);
        if(err.message === "jwt expired"){
            response.clearCookie("accessToken")
            response.status(401).send({
                error: "Token expired",
                detail: "Access Token expired"
            })
        }
        response.status(500).json({
            message: 'Internal server error',
            error: err.message,
        });

    } else {
        console.log("Cognito response was: ", cognitoResponse);
        response.locals.user = cognitoResponse;
        next();
    }
});
}