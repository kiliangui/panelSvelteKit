import type {PageServerLoad} from "../../../../.svelte-kit/types/src/routes/$types";
import {redirect} from "@sveltejs/kit";
import {db} from "$lib/db.server";

export const load: PageServerLoad = async (event) => {
    const session = await event.locals.getSession();
    if (!session || !session.user) {
        return redirect(303, `/login`)
    }
    // get the user current offer
    const user = await db.user.findUnique({
        where: {
            email: session.user.email as string
        }
    })
    // check if user has a current Offer
    if (!user) {
        return redirect(303, `/login`)
    }
    if (!user.currentOfferId) {
        return redirect(303, `/`)
    }
    const offer = await db.offer.findUnique({
        where: {
            id: user.currentOfferId
        }
    })
    if (!offer) {
        return redirect(303, `/`)
    }


    return {
        session,
        user,
        offer
    };
};

export const actions = {
    default : async (event) => {
        const session = await event.locals.getSession();
        if (!session || !session.user) return redirect(303, `/login`)
        // get the user current offer
        const user = await db.user.findUnique({
            where: {
                email: session.user.email as string
            }
        })
        if (!user) return redirect(303, `/login`)
        if (!user.currentOfferId) return redirect(303, `/`)
        // get the current offer
        const offer = await db.offer.findUnique({
            where: {
                id: user.currentOfferId
            }
        })
        if (!offer) return redirect(303, `/`)
        // get post Data
        const data = await event.request.formData();
        const cpu = Number(data.get('cpu'))*100;
        const ram = Number(data.get('ram'));
        const disk = Number(data.get('disk'));
        const now = new Date();
        const version = String(data.get('version'));
        const type = data.get('type');
        const name = data.get('name');
        const domain = data.get('domain');
        console.log("cpu : ",cpu, "ram : ",ram, "disk : ",disk, "version : ",version, "type : ",type, "name : ",name, "domain : ",domain)

        console.log(JSON.stringify(data.get('domain')));

        // count the number of disk used by all the user's servers
        const servrel = await db.userServer.findMany({
            where: {
                userId: user.id,
                role: "owner"
            }
        })

        let usedDisk = 0;
        servrel.forEach(rel => {
            const server = db.server.findUnique({
                where: {
                    id: rel.serverId
                }
            })
            if (server) {
                usedDisk += server.disk;
            }
        })
        console.log("usedDisk : ",usedDisk)
        // check if the user has enough resources
        if (cpu/100 > offer.cpu || ram > offer.ram || disk > offer.disk-usedDisk) {
            if (cpu > offer.cpu) console.log("cpu not enough")
            console.log(cpu, offer.cpu)
            if (ram > offer.ram) console.log("ram not enough")
            if (disk > offer.disk-usedDisk) console.log("disk not enough")
            console.log("not enough resources")
            return {
                status: 400,
                body: {
                    message: "Not enough resources"
                }
            }
        }
        console.log("user has enough resources")
        // create the server
        const server = await db.server.create({
            data: {
                cpu,
                ram,
                disk,
                version,
                type,
                status: "creation", // creation, installing, running, stopped
                name: name as string,
                domain,
                createdAt: now,
                updatedAt: now
            }
        })

// create the relation
        await db.userServer.create({
            data: {
                userId: user.id,
                serverId: server.id,
                role: "owner"
            }
        })
        console.log("server created")

        throw redirect(303, `/dashboard/server/${server.id}`)

    }
}