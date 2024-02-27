
import { db } from '$lib/db.server';
import type {PageServerLoad} from "../../../../../.svelte-kit/types/src/routes/$types";
import {createServer} from "$lib/pteroapi/server/install";
import {redirect} from "@sveltejs/kit";
import {checkPermission} from "$lib/checkperms";
import {getWs} from "$lib/pteroapi/server/ws";

export const load: PageServerLoad = async (event) => {
    const session = await event.locals.getSession();
    console.log(session?.user?.email)
    const user = await db.user.findUnique({
        where: {
            email: session?.user?.email as string
        }
    });

    if (!user) return redirect(303, `/login`)
    // get [id]
    const id = event.params.id;
    // get the server
    const server = await db.server.findUnique({
        where: {
            id: id
        }
    })
    if (!server) {
        return {
            status: 404,
            body: {
                message: "Server not found"
            }
        }
    }

    if (await checkPermission(user, server.id)) return {status: 403, body: {message: "Forbidden"}}

    if (server.status === "creation" || server.distantId === null) {
        console.log("USER : ",user)
        // @ts-ignore
        await createServer(server,user );
        return {
            status: 200,
            body: {
                message: "Server is installing",
                server,
            }
        }

    }
    // return the server
    return {
        status: 200,
        body: {
            server:server,
            ws: await getWs(server.distantIdentifier as string)
        }
    }

}