
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import cors from "cors"
import express from "express";
import userRouter from "./user.js";
import authRouter from "./auth.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);
app.use(cors())
app.use(express.json());

app.use("/api/v1/", userRouter);
app.use("/api/v1/auth", authRouter);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

