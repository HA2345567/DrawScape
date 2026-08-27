
import express from "express"
import userRouter from "./user.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json())

app.use("/api/v1/", userRouter);

app.listen(port, ()=>{
    console.log("Server listen on port")
})
