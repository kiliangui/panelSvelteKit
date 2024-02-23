import {pterourl, pteroUserKey} from "../../db.server";

export async function getWs(serverIdentifier:string){
    const res = await fetch(pterourl+ `/api/client/servers/${serverIdentifier}/websocket`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${pteroUserKey}`
        }
    })
    console.log(res.status)
    if (res.status != 200) return {
        status: res.status,
        body: {
            message: "Internal Server Error"
        }
    }
    const data = await res.json();
    const token = data.token;
    return data.data;


}