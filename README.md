# Panel Svelte kit
This repo is a wrapper for the pterodactyl panel that allow user to reserve servers.

# The stack
For this project i use SvelteKit Auth.js and Prisma.
Its a quick way to set up a project.
## Be careful
The implementation for the routes security is not good. 
I have set the security in the layout.ts, but even if the user dont get the render like that, the +server.ts execute anyway !. You need to check the user on each route.

