import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import type {ViteDevServer} from 'vite';

import { Server } from 'socket.io'
import {db} from "./src/lib/db.server";
import {checkPermission} from "./src/lib/checkperms";
import type {Session, User} from "@prisma/client";
import {getWs} from "./src/lib/pteroapi/server/ws";
//import node websocket client

import WebSocket from "ws";

// @ts-ignore
const webSocketServer = {

	name: 'webSocketServer',
	configureServer(server: ViteDevServer) {
		let user:User | null = null;
		if (!server.httpServer) return

		const io = new Server(server.httpServer)
		console.log("WS Server started");


		io.on('connection', async (socket) => {
			// get the user
			const cookies = socket.client.request.headers.cookie;
			let wsServer;
			//console.log(cookies)
			let wsSocket:WebSocket | null = null;
			if (cookies?.includes( "session")) {
				// get the strip after session-token=
				const token = cookies.split("authjs.session-token=")[1].split(";")[0]
				// get the Session from token
				const session:any = await db.session.findUnique({
					where: {
						sessionToken: token
					}
				})

				if (!session || !session.expires) {
					socket.emit("eventFromServer", {status: 401, message: "Unauthorized"})
					socket.disconnect()
					return
				}

				console.log("VOICI LA SESSION : ", session, !session)
				// verify if the session is expired
				if (session.expires.getTime() < new Date().getTime()) {
					socket.emit("eventFromServer", {status: 401, message: "Unauthorized"})
					socket.disconnect()
					return
				}
				// get user
				const res = await db.user.findUnique({
					where: {
						id: session.userId
					}
				})
				if (!res) {
					socket.emit("eventFromServer", {status: 401, message: "Unauthorized"})
					socket.disconnect()
				}
				user = res;
			}


			socket.emit('eventFromServer', 'Hello, World 👋')
			socket.on("header", (data) => {
				console.log("header : ",data)
			})

			socket.on("auth", async (data) => {
				console.log("Auth : ",data)
				const serverId = data.id;
				if (!user) {
					socket.emit("eventFromServer", {status: 401, message: "Unauthorized"})
					socket.disconnect()
				}
				if (await checkPermission(user, serverId)) {
					console.log("Forbidden")
					socket.emit("eventFromServer", {status: 403, message: "Forbidden"})
					socket.disconnect()
					return
				}
				socket.emit("eventFromServer", {status: 200, message: "Authorized"})
				if (!wsServer){
					wsServer = await db.server.findUnique({
						where: {
							id: serverId
						}
					})
					}
				if (!wsServer) return;
				getWs(wsServer.distantIdentifier).then((ws) => {
					console.log(ws, "WS")
					if (!ws.token || ws.message) {
						console.log("Error, ", ws.status, "no ws.token included")
						socket.emit("eventFromServer", {status: ws.status, message: ws.body.message})
						socket.disconnect()
						return;
					}
					try {

						wsSocket = new WebSocket(ws.socket);
						wsSocket.onopen = () => {
							console.log("Socket opened")
							socket.on("disconnect", () => {
								wsSocket.close()
								console.log("Socket closed")
								return
							})
							console.log("AUTHENTICATING the socket")
							wsSocket.send(JSON.stringify({"event":"auth","args": [ws.token]}))
							wsSocket.on("message", (data) => {
								// data is <Buffer ... >
								const dataString = data.toString();
								const dataJson = JSON.parse(dataString);
								//console.log(dataJson)
								if (dataJson.event == "auth success") {
									wsSocket.send(JSON.stringify({"event":"send logs"}))
								}
								socket.emit("eventFromServer", JSON.parse(data))

							})
						}
					}
					catch (e) {
						console.log(e)
					}
				})
			})
			socket.on('eventFromClient', (data) => {
				//console.log(data)
				if (data.event == "send command"){
					if (!wsSocket) return;
					wsSocket.send(JSON.stringify(data))
				}
			})
		})
	}
}
export default defineConfig({
	plugins: [sveltekit(), webSocketServer]
});
