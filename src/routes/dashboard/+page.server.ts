import {redirect} from "@sveltejs/kit";
import {db} from "$lib/db.server";
import type {Server, User} from "@prisma/client";

export const load = async (event) => {
    const session = await event.locals.getSession();
    if (!session?.user?.email) throw redirect(303, `/login`);
    const user: User | null = await db.user.findUnique({
        where:
        {
            email: session?.user?.email
        }
    })
    if (!user) throw redirect(303, `/login`);

    // get servers from db
    const serversUser = await db.userServer.findMany()
    console.log("servers : ",serversUser)
    let OwnedServers : Server[] = []
    let AllowedServers: Server[] = []
    for (let server of serversUser) {
        let serverData = await db.server.findUnique({
            where: {
                id: server.serverId
            }
        })
        if (!serverData) continue
        if (server.userId === user.id) {
            OwnedServers.push(serverData)
        }
        if (server.userId !== user.id) {
            AllowedServers.push(serverData)
        }
    }


    return {
        session,
        OwnedServers,
        AllowedServers
    };
}