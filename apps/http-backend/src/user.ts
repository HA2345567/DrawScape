import { Router } from "express";
import { CreateUserSchema, SigninSchema } from "@repo/common";
import { PrismaClient } from "@repo/db";
import { JWT_SECRET } from "@repo/backend-common";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient({} as any);
const userRouter = Router();

userRouter.post("/signup", async(req,res)=>{
    const parseData = CreateUserSchema.safeParse(req.body);
    if(!parseData.success){
        res.json({
            message: "incorrect inputs"
        })
        return;
    }

    try{
        const user = await prisma.user.create({
            data:{
                email: parseData.data?.username,
                password: parseData.data.password,
                name: parseData.data.name,

            }
        })
        res.json({
            userId:user.id
        })
    }catch(e){
        res.status(411).json({
            message:"user already exists"
        })

    }
    
});

userRouter.post("/signin", async(req,res)=>{
   try{
    const data = SigninSchema.safeParse(req.body);
    if(!data.success){
        res.json({
            message:"Incorrect inputs"
        })
        return;
    }
    const {username, password} = data.data;
    const user= await prisma.user.findUnique({
        where:{
            email:username,
        }
    })
    if(!user || user.password !== password){
        res.json({
            message:"User not found"
        })
        return;
    }
    const userId = user.id;
    const token = jwt.sign({
        userId
    },JWT_SECRET);
    res.json({
        token
    })
   }catch(e){
    res.status(500).json({
        message:"Internal Server error"
    });
   }

});

export default userRouter;

