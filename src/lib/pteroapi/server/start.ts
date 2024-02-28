import type {Offer, Server} from "@prisma/client";
import {db, pterourl, pteroUserKey} from "$lib/db.server";

export async function start(server:Server,offer:Offer,usedCpu:number,usedRam:number) {
    console.log("Starting server")
    console.log(pteroUserKey)
    if (usedCpu + server.cpu > offer.cpu || usedRam + server.ram > offer.ram) {
        console.log("Forbidden")
        return {status: 403, message: "Not enough ressources"}
    }
    const res = await fetch(`${pterourl}/api/client/servers/${server.distantIdentifier}/power`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${pteroUserKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            signal: "start"
        })
    })

    // update the server
    const updatedServer = await db.server.update({
        where: {
            id: server.id
        },
        data: {
            status: "started"
        }
    })
console.log("RES : ",res)

    return res;
}

export async function stop(server:Server) {
    console.log("Stopping server")
    const res = await fetch(`${pterourl}/api/client/servers/${server.distantIdentifier}/power`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${pteroUserKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            signal: "stop"
        })
    })
    const updatedServer = await db.server.update({
        where: {
            id: server.id
        },
        data: {
            status: "stopped"
        }
    })

    console.log(res)
}