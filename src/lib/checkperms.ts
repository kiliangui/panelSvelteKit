import {db} from "./db.server";
import type {User, UserServer} from "@prisma/client";

export async function checkPermission(user:User,serverId:string):Promise<boolean>{

    const serverUser = await db.userServer.findMany({
        where: {
            serverId: serverId
        }
    })
    if (!serverUser) {
        console.warn("Not found")
        return true
    }
    if (!user) throw new Error("User not found");
    // check if the user is the owner of the server
    if (!serverUser.find((elem:UserServer) => elem.userId == user.id)){
        console.warn("Forbidden")
        return true
    }
    return false

}