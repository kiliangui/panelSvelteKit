import type {UserServer} from "@prisma/client";
import {start, stop} from "$lib/pteroapi/server/start";
import {db} from "$lib/db.server";
import {checkPermission} from "$lib/checkperms";
import type {RequestHandler} from "@sveltejs/kit";


export const POST : RequestHandler = async (request) => {
    const session = await request.locals.getSession();
    const serverId = request.params.id;
    if (!session || !session?.user) return new Response("Unauthorized", { status: 401})
    const user = await db.user.findUnique({
        where: {
            email: session.user.email as string
        }
    })

    console.log("Serrver : ",serverId)
    if (!user) return new Response("Unauthorized", { status: 401})
    if (!serverId) return new Response("Server not found", { status: 404})
    // get the server
    const server = await db.server.findUnique({
        where: {
            id: serverId
        }
    })
    if (!server) return new Response("Server not found", { status: 404})
    // check if the user has the permission to access the server
    if (await checkPermission(user, server.id)) return new Response("Forbidden", { status: 403})

    // get the action
    const action = request.url.searchParams.get("action");

    console.log("POST",action == "")
    if (action == "start") {
        const servers = await db.UserServer.findMany({
            where: {
                userId: user.id
            }
        })
        if (!servers) return {status: 500, body: {message: "No server found"}}
        let cpu = 0;
        let ram = 0;
        console.log(servers.length)
        for (let i = 0; i < servers.length; i++) {
            const linkedServer =await db.server.findUnique({
                where: {
                    id: servers[i].serverId
                }
            })
            console.log("Linked Server : ", linkedServer)
            if (!linkedServer) return {status: 500, body: {message: "Internal Server Error"}}
            if (linkedServer.status == "started" && linkedServer.id !== server.id){
                cpu += linkedServer.cpu;
                ram += linkedServer.ram;
            }
        }


        // get the user current offer
        const offer = await db.offer.findUnique({
            where: {
                id: user.currentOfferId
            }
        })
        if (!offer) return new Response("User plan not found", { status: 500})
        console.log("CPU !!!" ,cpu, server.cpu, offer.cpu, ram + server.ram, offer.ram)
        const res = await start(server,offer,cpu,ram);
        if (res.status === 200){
            return new Response("Server is starting")
        }else if (res.status === 403) {
            return new Response(res?.message, {status: 403})
        }
    } else if (action === "stop") {
        await stop(server);
    } else {
        return new Response("Bad request", { status: 400})
    }
}


/*
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
        /*Checking the ressources*//*
        // get the servers
        const servers = await db.UserServer.findMany({
            where: {
                userId: user.id
            }
        })
        if (!servers) return {status: 500, body: {message: "No server found"}}
        let cpu = 0;
        let ram = 0;
        console.log(servers.length)
        for (let i = 0; i < servers.length; i++) {
            const linkedServer =await db.server.findUnique({
                where: {
                    id: servers[i].serverId
                }
            })
            console.log("Linked Server : ", linkedServer)
            if (!linkedServer) return {status: 500, body: {message: "Internal Server Error"}}
            if (linkedServer.status == "started"){
                cpu += linkedServer.cpu;
                ram += linkedServer.ram;
            }
        }

        // get the user current offer
        const offer = await db.offer.findUnique({
            where: {
                id: user.currentOfferId
            }
        })
        console.log("CPU !!!" ,cpu, server.cpu, offer.cpu, ram + server.ram, offer.ram)
        if (!offer) return {status: 500, body: {message: "User plan not found"}}
        // check if the user has enough resources
        if (cpu + server.cpu > offer.cpu || ram + server.ram > offer.ram) {
            // return not enough resources error
            return {success: false, message: "Not enough resources"}
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
        return {
            status: 200,
            body: {
                message: "Server is starting"
            }
        }

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

*/