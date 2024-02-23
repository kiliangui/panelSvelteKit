
import {redirect, type RequestEvent} from "@sveltejs/kit";
import {db} from "$lib/db.server";

export const actions = {
    default: async (event: RequestEvent) => {
        const session = await event.locals.getSession();
        if (!session?.user) throw redirect(303, `/login`);
        const user = await db.user.findUnique({
            where:
            {   // @ts-ignore
                email: session?.user?.email
            }
        })

        console.log(user)

        if (!user) throw redirect(303, `/login`);
        // get post Data
        const data = await event.request.formData();
        console.log(data)
        const cpu = Number(data.get('cpu'));
        const ram = Number(data.get('ram'));
        const disk = Number(data.get('disk'));

        const now = new Date();
        if (user.currentOfferId){
            // get the current Offer
            const offer = await db.offer.findUnique({
                where: {
                    id: user.currentOfferId
                }
            })

            if (offer) {
                // check if the offer is the same as the new one
                if (offer.cpu === cpu && offer.ram === ram && offer.disk === disk) {
                    return {
                        status: 200,
                        body: {
                            message: "User ressources already set"
                        }
                    }
                }
                // set the endDate to now
                // update the offer
                const updatedOffer = await db.offer.update({
                    where: {
                        id: user.currentOfferId
                    },
                    data: {
                        endDate: now
                    }
                })

            }

        }

        let newOffer = await db.offer.create({
            data: {
                startDate:now,
                cpu: cpu*100,
                ram: ram,
                disk: disk
            }
        })
        // update the user
        const updatedUser = await db.user.update({
            where: {
                id: user.id
            },
            data: {
                currentOfferId: newOffer.id
            }
        })

        if (!updatedUser) return { status: 500, body: { message: "Internal Server Error" } }
        

        return {
            status: 200,
            body: {
                message: "User ressources Updated",
                session
            }
        }

    }
}