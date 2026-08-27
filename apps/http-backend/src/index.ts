
import express from "express"
import userRouter from "./user";

const app = express();

app.use(express.json())

app.use("/api/v1/", userRouter);

app.listen(3000, ()=>{
    console.log("Server listen on port: 3000")
})