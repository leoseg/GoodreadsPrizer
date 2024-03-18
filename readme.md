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

## Data Model
- There are 3 main entities: User, BookGoodRead and BookStoreItem and 1 Helping Entity: StoreTag. 
- The User entity is used to store the user information is directly linked to the AWS user used for login
- The User and the BookGoodRead entity are linked by a many to many relationship, this way a user can have multiple books and a book can be owned by multiple users
- The BookGoodRead and the BookStoreItem are linked by a one to many relationship, this way a book can have multiple store items and a store item can only belong to one book
- The StoreTag is used to store the store tags which are used as a composite key for the BookStoreItem entity, ensuring that there are only valid store tags in the DB
- BookstoreItems could be partitioned by store tag, this way the DB could be sharded by store tag in future, or one the userid in join table in the many to many relationship

## Local Deployment
- Install Micro8ks, optionally use another kubernetes provider
- Install rabbitmq kubernetes plugin with
    ```console 
  microk8s kubectl apply -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml" 
    ```
- Enable storage on local host for this cluster (only for development and local deployment)
    ```console
    microk8s enable hostpath-storage
    ```
- Add secret.yaml with the schema like in the example in secret_example.yaml to the kubernetesconfigs/config directory,  you should have an aws cognito running with an hosted ui
- After that you can deploy the kubernetes configs with
    ```console
    microk8s kubectl apply -f kubernetesconfigs -R
    ```
- The frontend should be now accesible under localhost:32001
