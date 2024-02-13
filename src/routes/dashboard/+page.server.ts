import {redirect} from "@sveltejs/kit";
import {db} from "$lib/db.server";

export const load = async (event) => {
    const session = await event.locals.getSession();
    const user = await db.user.findUnique({
        where:
        {   // @ts-ignore
            email: session?.user?.email
        }
    })

    console.log(user)

    if (!user) {
        throw redirect(303, `/login`);
    }

    // get servers from db
    const serversUser = await db.userServer.findMany()
    console.log("servers : ",serversUser)
    // @ts-ignore
    let OwnedServers = []
    // @ts-ignore
    let AllowedServers = []
    for (let server of serversUser) {
        let serverData = await db.server.findUnique({
            where: {
                id: server.serverId
            }
        })
        if (server.userId === user.id) {
            // @ts-ignore
            OwnedServers.push(serverData)
        }
        if (server.userId !== user.id) {
            // @ts-ignore
            AllowedServers.push(serverData)
        }
    }


    return {
        session,
        // @ts-ignore
        OwnedServers,
        // @ts-ignore
        AllowedServers
    };
}