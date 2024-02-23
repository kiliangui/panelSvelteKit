import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import {db} from "$lib/db.server";
import {createAndSync} from "$lib/pteroapi/users/create";
export const load: PageServerLoad = async (event) => {
	const session = await event.locals.getSession();
	const fromUrl = event.url.pathname + event.url.search;
	const user = await db.user.findFirst({
		where: {
			id: session?.user?.id
		}
	});
	if (!user) throw redirect(303, `/login?redirectTo=${fromUrl}`);

	if (!user.distantId) {
		console.log("creating user on ptero");
		await createAndSync(user);
		throw redirect(303, `/login?redirectTo=${fromUrl}`);
	}

    
	return {
		session: session,
		body: {
			session
		}
	};
};