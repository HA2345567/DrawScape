import { Response, Router } from "express";
import { CreateUserSchema, SigninSchema,CreateRoomSchema } from "@repo/common";
import { prismaClient } from "@repo/db";
import { JWT_SECRET } from "@repo/backend-common";
import jwt from "jsonwebtoken";
import { middleware, AuthenticatedRequest } from "./middleware.js";

const prisma = prismaClient;
const userRouter = Router();

userRouter.post("/signup", async(req,res)=>{
    const parseData = CreateUserSchema.safeParse(req.body);
    if(!parseData.success){
        res.status(400).json({
            message: "incorrect inputs",
            errors: parseData.error.issues
        });
        return;
    }

    try{
        const user = await prisma.user.create({
            data:{
                email: parseData.data.username,
                password: parseData.data.password,
                name: parseData.data.name,
            }
        });
        const token = jwt.sign({
            userId: user.id
        }, JWT_SECRET);
        res.json({
            userId: user.id,
            token
        });
    }catch(e){
        res.status(409).json({
            message: "user already exists"
        });
    }
});

userRouter.post("/signin", async(req,res)=>{
   try{
    const data = SigninSchema.safeParse(req.body);
    if(!data.success){
        res.status(400).json({
            message:"Incorrect inputs"
        });
        return;
    }
    const {username, password} = data.data;
    const user = await prisma.user.findUnique({
        where:{
            email: username,
        }
    });
    if(!user || user.password !== password){
        res.status(401).json({
            message: "Invalid credentials"
        });
        return;
    }
    const userId = user.id;
    const token = jwt.sign({
        userId
    }, JWT_SECRET);
    res.json({
        token
    });
   }catch(e){
    console.error("Signin error:", e);
    res.status(500).json({
        message:"Internal Server error"
    });
   }

});

userRouter.post("/room", middleware, async(req: AuthenticatedRequest, res: Response) => {
    const parseData = CreateRoomSchema.safeParse(req.body);
    if(!parseData.success){
        res.json({
            message:"Incorrect inputs"
        })
        return;
    }
    try{
        const room = await prisma.room.create({
            data:{
                slug: parseData.data.roomName,
                adminId: Number(req.userId),
            }
        })
        res.json({
            roomId: room.id
        })
    }catch(e){
        res.status(500).json({
            message:"Internal Server Error"
        })
    }
});

userRouter.get("/chats/:roomId", async (req, res) => {
    const param = req.params.roomId;
    let numericRoomId = Number(param);

    if (Number.isNaN(numericRoomId)) {
        const room = await prisma.room.findFirst({
            where: { slug: param },
        });
        if (!room) {
            res.json({ messages: [] });
            return;
        }
        numericRoomId = room.id;
    }

    const messages = await prisma.chat.findMany({
        where: {
            roomId: numericRoomId,
        },
        orderBy: {
            id: "desc",
        },
        take: 50,
    });
    res.json({
        messages,
    });
});

userRouter.get("/room/:slug", async(req,res)=>{
    const slug = req.params.slug;
    const chats = await prisma.room.findFirst({
        where:{
            slug
        },
        orderBy:{
            id:"desc",
        },
        take:50
    })
    res.json({
        chats
    })
})

export default userRouter;

