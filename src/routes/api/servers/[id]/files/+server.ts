import type {RequestHandler} from "@sveltejs/kit";
import {db, pterourl, pteroUserKey} from "$lib/db.server";
import {checkPermission} from "$lib/checkperms";


export const POST : RequestHandler = async (request) => {
    // get the session
    const path = request.url.searchParams.get("path") as string | "";
    // check if edit param is set (event if empty)
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

    // get the body
    const body = await request.request.text();

    console.log(pterourl + "/api/client/servers/"+server.distantIdentifier+"/files/write?file="+path)

    const res = await fetch(pterourl + "/api/client/servers/"+server.distantIdentifier+"/files/write?file="+path, {
        method: "POST",
        body: body,
        headers: {
            "Authorization": "Bearer "+pteroUserKey,
            "Accept": "application/json"
        }
    })

    return new Response("OK", {
        status: res.status
    })




}

export const GET: RequestHandler = async (request) => {
    // get the session
    const path = request.url.searchParams.get("path") as string | "";
    // check if edit param is set (event if empty)
    const edit : boolean = request.url.searchParams.get("edit") === "true";
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



    if (edit){

        const res = await fetch(pterourl + "/api/client/servers/"+server.distantIdentifier+"/files/contents?file="+path, {
            headers: {
                "Authorization": "Bearer "+pteroUserKey,
                "Accept": "application/json"
            }
        })
        let data;
        if (res.status === 200){
            data = await res.text();
        }
        return new Response(data, {
            headers: {
                "content-type": "text/plain"
            }
        })


    }else{
        let files =  []
        let folders = []
        // get the files from the pterodactyl server
        const res = await fetch(pterourl + "/api/client/servers/"+server.distantIdentifier+"/files/list?directory="+path, {
            headers: {
                "Authorization": "Bearer "+pteroUserKey,
                "Accept": "application/json"
            }
        })
        const all = await res.json();
        for (const file of all.data) {
            if (file.attributes.is_file === false){
                folders.push(file)
            }else{
                files.push(file)
            }
        }
        console.log("PATH : ",path)
        return new Response(JSON.stringify({files:files,folders:folders}), {
            headers: {
                "content-type": "application/json"
            }
        })
    }




}