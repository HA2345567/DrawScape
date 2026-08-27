import { WebSocket, WebSocketServer } from "ws";
import { JWT_SECRET } from "../../../packages/backend-common/src";
import jwt, {  JwtPayload } from "jsonwebtoken";
import { parse } from "node:path";

interface User {
    ws: WebSocket;
    rooms: string[];
    userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (typeof decoded === "string") {
            return null;
        }
        if (!decoded || !(decoded as JwtPayload).userId) {
            return null;
        }

        return String((decoded as JwtPayload).userId);



    } catch (e) {
        return null;
    }
    return null;
}

const wss = new WebSocketServer({port : 8080});

wss.on("connection", function connection(ws, request){
    const url = request.url;
    if(!url){
        return;
    }

    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token");
    const userId = checkUser(token as string);

    if(userId == null){
        ws.close();
        return null;
    }

    users.push({
        userId,
        rooms:[],
        ws,
    });

    ws.on("message", function message(data){
        let parseData: any;
        try{
            parseData = JSON.parse(data.toString());

        }catch(e){
            return null;
        }

        const roomId = parseData.roomId ?? parseData.room;
        if(parseData.type === "join_room"){
            const user = users.find(x => x.ws === ws);
            if(roomId){
                user?.rooms.push(roomId);
            }
        }

        if(parseData.type ==="leave_room"){
            const user = users.find(x => x.ws === ws);
            if(!user){
                return;
            }
            user.rooms = user.rooms.filter(x => x !== roomId)
        }

        if(parseData.type === "chat"){
            const message = parseData.message;
            if(!roomId || typeof message !== "string"){
                return;
            }
            users.forEach(user =>{
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message: message,
                        roomId
                    }))
                }
            })
        }
    })


})

