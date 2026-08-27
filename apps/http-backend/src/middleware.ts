import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "./config";
import jwt, { JwtPayload } from "jsonwebtoken";


type AuthenticatedRequest = Request &{ userId?: string | number};
export const middleware =(
    req:AuthenticatedRequest,
    res: Response,
    next: NextFunction
)=>{
    try{
        const authHeader = req.headers["authorization"]??"";
        const token = authHeader.startsWith("Bearer")
        ? authHeader.slice(7)
        : authHeader;


        const decoded = jwt.verify(token,JWT_SECRET);
        if(typeof decoded === "string"){
            return res.status(403).json({
                message:"unauthorized",
            })
        }

        req.userId = (decoded as JwtPayload).userId as string | number;
        return next();


    }catch(e){
        return res.status(403).json({
            message:"unauthorized",
        })
    }

}