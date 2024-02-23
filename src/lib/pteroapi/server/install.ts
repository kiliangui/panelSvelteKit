import type {Server, User} from "@prisma/client";
import {db, pterourl,pteroAppKey} from "$lib/db.server";
import {createAndSync} from "$lib/pteroapi/users/create";

async function createServer(server:Server,user:User) {
    // install server from the pteroApi
    let egg = 1;
    switch (server.type) {
        case "vanilla":
            egg = 4;
            break
        case "paper":
            egg = 1;
            break
        case "spigot":
            egg = 1;
            break

    }
    if (user.distantId === null) {
        user = await createAndSync(user);
    }

    console.log(user)

    console.log(pterourl+"/api/application/servers")
    const res = await fetch(pterourl+"/api/application/servers", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${pteroAppKey}`
        },
        body: JSON.stringify({
                "name": server.name,
                "user": user.distantId ,
                "egg": 1,
                "docker_image": "ghcr.io/pterodactyl/yolks:java_17",
                "startup": "java -Xms128M -XX:MaxRAMPercentage=95.0 -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}",
                "environment": {
                    "BUNGEE_VERSION": "latest",
                    "SERVER_JARFILE": "server.jar",
                    "BUILD_NUMBER": "latest",
                },
                "limits": {
                    "memory": server.ram,
                    "swap": 1024,
                    "disk": server.disk * 1024,
                    "io": 250,
                    "cpu": server.cpu
                },
                "feature_limits": {
                    "allocations": 1,
                    "databases": 0,
                    "backups": 5
                },
            'allocation': {
                'default': 1,
                'additional': [],
            },
            'deploy': {
                'locations': [1],
                'dedicated_ip': false,
                'port_range': [],
            },
            'start_on_completion': true,
            'skip_scripts': false,
            'oom_disabled': true
            }
        )
    })
    const data = JSON.parse(await res.text());
    if (data.error) {
        console.error(data.error);
        return;
    }
    console.log(data)
    server.uuid = data.attributes.uuid;
    server.distantId = data.attributes.id;
    server.distantIdentifier = data.attributes.identifier;
    server.status = "installing";
    server.createdAt = new Date();
    server.updatedAt = new Date();
    // update the server in the database
    const updatedServer = await db.server.update({
        where: {
            id: server.id
        },
        data: {
            uuid: server.uuid,
            distantId: server.distantId,
            distantIdentifier: server.distantIdentifier,
            status: server.status,
            createdAt: server.createdAt,
            updatedAt: server.updatedAt
        }
    })
    console.log(updatedServer);

}

async function installServer(server:Server){
    // install server from the pteroApi
        }

export {installServer,createServer}