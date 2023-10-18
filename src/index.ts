import express from "express"
import {
    json
} from "body-parser"




// create express app
const app = express()
app.use(json())
// app.use("/users",userRouter)


// start express server
app.listen(3000)
console.log("Express server has started on port 3000. Open http://localhost:3000/ to see results")

