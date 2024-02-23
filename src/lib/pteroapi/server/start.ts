import type {Server} from "@prisma/client";
import {pterourl, pteroUserKey} from "$lib/db.server";

export async function start(server:Server) {
    console.log("Starting server")
    console.log(pteroUserKey)
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
console.log(res)
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
    console.log(res)
}