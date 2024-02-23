import type {User} from "@prisma/client";
import {db, pteroAppKey, pterourl} from "$lib/db.server";

async function createAndSync(user:User){
    // create the user on the pteroApi
    const res = await fetch(pterourl+"/api/application/users", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${pteroAppKey}`
        },
        body: JSON.stringify({
            "email": user.email,
            "username": user.name,
            "first_name": user.name,
            "last_name": user.name,
            "password": Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            "root_admin": false
        })
    })
    const data = await res.json();
    console.log(data)
    if (res.status < 200 || res.status >= 300) {
        console.warn(res.status)
        console.log(data.errors[0].detail)
        throw new Error(data.errors[0].detail)
    }
    // sync the user's id with the database
    user = await db.user.update({
        where: {
            id: user.id
        },
        data: {
            distantId: data.attributes.id
        }
    })
    return user;
}

export {createAndSync}