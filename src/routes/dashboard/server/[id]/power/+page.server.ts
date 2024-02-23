import type {UserServer} from "@prisma/client";
import {start, stop} from "$lib/pteroapi/server/start";
import {redirect} from "@sveltejs/kit";
import {db} from "$lib/db.server";
import {checkPermission} from "$lib/checkperms";


export const actions = {
    start : async (event) => {
        // get the user
        const session = await event.locals.getSession();
        // get server from [id]
        const id = event.params.id;
        if (!session || !session.user) return redirect(303, `/login`)
        const user = await db.user.findUnique({
            where: {
                email: session.user.email as string
            }
        })
        if (!user) return redirect(303, `/login`)

        const server = await db.server.findUnique({
            where: {
                id: id
            }
        })
        if (!server) return {status: 404, body: {message: "Server not found"}}
        if (await checkPermission(user,server.id)) return {status: 403, body: {message: "Forbidden"}}
        /*Checking the ressources*/
        // get the servers
        const servers = await db.UserServer.findMany({
            where: {
                userId: user.id
            }
        })
        if (!servers) return {status: 500, body: {message: "Internal Server Error"}}
        let cpu = 0;
        let ram = 0;
        servers.forEach((serverLink:UserServer) => {
            const linkedServer = db.server.findUnique({
                where: {
                    id: serverLink.serverId
                }
            })
            if (!linkedServer) return {status: 500, body: {message: "Internal Server Error"}}
            if (linkedServer.status == "started"){
                cpu += linkedServer.cpu;
                ram += linkedServer.ram;
            }
        })

        // get the user current offer
        const offer = await db.offer.findUnique({
            where: {
                id: user.currentOfferId
            }
        })
        if (!offer) return {status: 500, body: {message: "Internal Server Error"}}
        // check if the user has enough resources
        if (cpu + server.cpu > user.cpu || ram + server.ram > user.ram) {
            return {
                status: 403,
                body: {
                    message: "Not enough resources"
                }
            }
        }
        await start(server);
        // update the server
        const updatedServer = await db.server.update({
            where: {
                id: server.id
            },
            data: {
                status: "started"
            }
        })

    },
    stop: async (event) => {
        // get the user
        const session = await event.locals.getSession();
        // get server from [id]
        const id = event.params.id;
        if (!session || !session.user) return redirect(303, `/login`)
        const user = await db.user.findUnique({
            where: {
                email: session.user.email as string
            }
        })
        if (!user) return redirect(303, `/login`)

        const server = await db.server.findUnique({
            where: {
                id: id
            }
        })
        if (!server) return {status: 404, body: {message: "Server not found"}}
        if (await checkPermission(user,server.id)) return {status: 403, body: {message: "Forbidden"}}
        await stop(server);
        // update the server
        const updatedServer = await db.server.update({
            where: {
                id: server.id
            },
            data: {
                status: "stopped"
            }
        })
    }


}