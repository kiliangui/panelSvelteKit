import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/core/providers/google';
import GitHub from '@auth/core/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { db } from '$lib/db.server';
import type { Adapter } from '@auth/core/adapters';
import { env } from '$env/dynamic/private';
import Credentials from "@auth/core/providers/credentials";
import Discord from "@auth/core/providers/discord";

export const handle = SvelteKitAuth({
	adapter: PrismaAdapter(db) as Adapter,
	session: {
		strategy: "database",
		generateSessionToken: () => {
			return crypto.randomUUID();
		}
	},
	providers: [
		GitHub({ clientId: env.GITHUB_ID, clientSecret: env.GITHUB_SECRET }),
		Google({ clientId: env.GOOGLE_ID, clientSecret: env.GOOGLE_SECRET }),
		Discord({ clientId: env.DISCORD_ID, clientSecret: env.DISCORD_SECRET }),
	],
	callbacks: {
		session: async ({ session, token }) => {
			if (session?.user) {
				session.user = {
					...session.user,
					id: session.user.id,
				};
			}
			return session;
		},
		jwt: async ({ user, token }) => {
			if (user) {
				token.uid = user.id;
			}
			return token;
		},
	},


});