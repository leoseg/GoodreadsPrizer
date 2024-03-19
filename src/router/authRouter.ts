import express from "express";
import axios from "axios";
const config = require("../config")
export const authRouter = express.Router();
// Environment variables (set these in your environment or .env file)
const clientId = config.COGNITO_CLIENT_ID;
const clientSecret = config.COGNITO_CLIENT_SECRET;
const redirectUri = config.COGNITO_REDIRECT_URI;
const cognitoDomain = config.COGNITO_DOMAIN;

authRouter.get('/auth/callback', async (request, response) => {
    const { code } = request.query;
    // Exchange the authorization code for tokens
    const tokenUrl = `https://${cognitoDomain}/oauth2/token`;
    const body = {
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code: code
    };

    // Cognito requires the client_id and client_secret to be sent as a Basic Auth header
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
        const axiosResponse = await axios.post(tokenUrl, body, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${auth}`
            }
        });
        // Set tokens in HTTP-only cookies
        response.cookie('accessToken', axiosResponse.data.access_token, {
            sameSite: 'lax',
            httpOnly: true,
            secure: config.SECURE_COOKIE// set to true if using https
        });
        response.cookie('idToken', axiosResponse.data.id_token, {
            sameSite: 'lax',
            httpOnly: true,
            secure: config.SECURE_COOKIE// set to true if using https
        });

        response.status(200).redirect(config.FRONTEND_URL);
    } catch (error) {
        console.log(error)
        console.error('Error exchanging auth code for tokens:', error);
        response.status(500).send("Authentication failed");
    }
});
//check if the user is logged in
authRouter.get('/auth/check', async (request, response) => {
    if (!request.cookies || !request.cookies.accessToken) {
        return response.status(401).send({
            error: "Not authenticated",
            detail: "Access Token missing from header"
        })
    } else {
        console.log("User authenticated")
        return response.status(200)
    }
});

