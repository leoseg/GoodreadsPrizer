# GoodreadsPrizer

The idea of this project is to get the list of desired books from
a Goodreads shelf and then get the best price for each book from 
different online-stores.

## Components
- Goodreads API: This repository which acts as main server to handle user requests
  - Forwards them to the corresponding microservice for scrapping
  - Handles DB accesses and reads
  - Handles user authentication with AWS Cognito
  - (Temporary) Handles scrapping of the books from Goodreads
  - <strong> Technology: </strong> NodeJS, Express, PostgreSQL, AWSCognito, TypeORM
- BookStoreScrapper: Microservice written in Java to scrape the results from bookstores https://github.com/leoseg/BookstoreScrapper
- Frontend: Frontend written in Vue https://github.com/leoseg/goodreadsprizer_frontend
## API
API Endpoints
#### Book Management
1. Update Book Prices
Endpoint: /bookPricesUpdate
Method: GET
Description: Updates book prices for a user. This endpoint should be called to refresh and update the prices of books in the user's collection.
2. Get Bookstore Entries
Endpoint: /bookPrices/:storeTag?
Method: GET
Description: Retrieves entries from a bookstore for a user. The storeTag parameter is optional and can be used to filter results from a specific bookstore tag.
#### User Management
1. Update User
Endpoint: /user
Method: POST
Description: Updates user information. This endpoint can be used for updating user profile details.
2. Delete User
Endpoint: /user
Method: DELETE
Description: Deletes a user account. Use this endpoint to remove a user's account and associated data from the system.
3. Get User Information
Endpoint: /user
Method: GET
Description: Retrieves the user information.
4. User Logout
Endpoint: /logout
Method: GET
Description: Logs out the current user. This endpoint cleans the session Cookie.
## Flow
1. User logs in via AWS Cognito
2. Middleware checks if the user has an corresponding goodReadsUser entry in the DB 
   3. If yes it passes
   4. If no it creates a new goodReadsUser entry in the DB and sends back 406 to frontend which then redirect to user-edit so the user can entry his goodreads name and number
5. If the user sends now over the frontend a request to get the bookprices by opening a SSE connection the server starts processing
   6. First it gets a list of the books from the goodreads shelf of the user
   7. It checks if the flag fullUpdate set by the user request is true:
      8. If yes it sends all books to the scrapping microservice and updates all store entries for each book overwriting old ones
      9. If no it checks the DB for that user if it already has corresponding entries and only updates the new one
   10. In the last step it saves the books for the user and notify the user which then reloads the books from the DB and the SSE is closed


## Design Notes
- The bookService uses a BookPrizer interface which can be used to implement different strategies for getting the prices from the scores, this way it can be flexible changed in case for later changes
- The bookController uses SSE to send the results to the client, this way the client can get the results as soon as they are available without keeping a http connection open
- In the first place scrapping was done by the main server but I have decided to outsource it to a microservice and choose to use RabbitMQ as message broker for indepence scaling and development