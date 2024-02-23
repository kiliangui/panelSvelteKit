<script lang="ts">
import RessourceGauge from "$lib/components/elements/RessourceGauge.svelte";
import type {Server} from "@prisma/client";
import * as Alert from "$lib/components/ui/alert";
import {ExclamationTriangle} from "radix-icons-svelte";
import {Button} from "$lib/components/ui/button";
import {onMount} from "svelte";
import ansi from "ansidec";


export let data: any;
const status: string = data.body.status;
let variant: Alert.Variant = (Number(status) >= 200 && Number(status) <300)? "default":"destructive";
const server:Server = data.body.server;
let message = data.body.message;
let wsId = data.body.ws;
let cpu = 0;
let ram = 0;
let disk = 0;
let logs : object[] = [];
// use io websocket
import { io } from 'socket.io-client'

const socket = io()

socket.emit('auth',{id:server.id})
socket.on('eventFromServer', (data) => {
    console.log(data);
    if (data.args && data.args.length !== 1) return;
    if (data.event === "stats") {
        data.args[0] = JSON.parse(data.args[0])
        cpu =  Math.ceil(Math.min(100,data.args[0]["cpu_absolute"]));
        ram = Math.ceil(data.args[0]["memory_bytes"]/1024/1024);
        disk = Math.round((data.args[0]["disk_bytes"]/1024/1024/1024 + Number.EPSILON) * 100) / 100;
    }
    if (data.event === "console output") {
        let log = data.args[0];
        // get the Ansi color
        var format = ansi.format(function (styles,color,background,text){
            console.log(styles)
            let stylestring = "";
            stylestring += styles.bold ? "font-weight: bold;":"";
            stylestring += styles.italic ? "font-style: italic;":"";
            stylestring += styles.underline ? "text-decoration: underline;":"";
            stylestring += styles.strikethrough ? "text-decoration: line-through;":"";
            stylestring += color ? "color: "+color+";":"";
            stylestring += background ? "background-color: "+background+";":"";
            return stylestring;
        })
        let color = format(log);
        console.log("COLOOOOR : ",color)
        // remove ansii color
        log = log.replace(/\x1b\[[0-9;]*m/g, '');
        console.log(log)
        logs = [...logs, [log,color]];
    }
})
socket.on('', (message) => {
    console.log(message)
    cpu  = Math.ceil(Math.min(100,message.cpu_absolute));
    ram = Math.ceil(message.memory_bytes/1024/1024);
    disk = Math.round((message.disk_bytes/1024/1024/1024 + Number.EPSILON) * 100) / 100;
})





/*
onMount(()=>{
    console.log("MOUNTED")
    socket = new WebSocket(wsId.socket);
    socket.onopen = function (event) {
        console.log("connected");
        socket.send(JSON.stringify({
            "event": "auth",
            "args": [wsId.token]
        }));
    };
    socket.onmessage = function (event) {
        let data = JSON.parse(event.data);

        if (data.event === "auth success"){
            socket.send(JSON.stringify({
                "event": "send logs",
                "args": []
            }));
        }



        if (data.args && data.args.length !== 1) return;

        if (data.event === "stats") {
            data.args[0] = JSON.parse(data.args[0])

            cpu =  Math.ceil(Math.min(100,data.args[0]["cpu_absolute"]));
            ram = Math.ceil(data.args[0]["memory_bytes"]/1024/1024);
            disk = Math.round((data.args[0]["disk_bytes"]/1024/1024/1024 + Number.EPSILON) * 100) / 100;
        }

        if (data.event === "console output") {
            let log = data.args[0];
            // get the Ansi color
            var format = ansi.format(function (styles,color,background,text){
                console.log(styles)
                let stylestring = "";
                stylestring += styles.bold ? "font-weight: bold;":"";
                stylestring += styles.italic ? "font-style: italic;":"";
                stylestring += styles.underline ? "text-decoration: underline;":"";
                stylestring += styles.strikethrough ? "text-decoration: line-through;":"";
                stylestring += color ? "color: "+color+";":"";
                stylestring += background ? "background-color: "+background+";":"";

                return stylestring;
            })
            let color = format(log);
            console.log("COLOOOOR : ",color)
            // remove ansii color
            log = log.replace(/\x1b\[[0-9;]*m/g, '');
            console.log(log)

            logs = [...logs, [log,color]];

        }
    };
})
*/

</script>

<div>
    <input id="ws" type="hidden" value={wsId.socket+"||"+wsId.token}>
    {#if message}
        <Alert.Root variant={variant}>

            <ExclamationTriangle class="h-4 w-4" />
            <Alert.Title>Heads up!</Alert.Title>
            <Alert.Description
            >{message}.</Alert.Description
            >
        </Alert.Root>
    {/if}
    {#if Number(status) >= 200 && Number(status) < 300}
        <RessourceGauge  value="{server.cpu}"/>
    {/if}
    <ul>
        {#each logs as log}
            <li style={log[1]}>{log[0]}</li>
        {/each}
    </ul>
    <RessourceGauge name="CPU usage" value="{cpu}" max={server.cpu} />
    <RessourceGauge name="RAM usage" value="{ram}" max={server.ram} unit="Mb" />
    <RessourceGauge name="DISK usage" value="{disk}" max={server.disk} unit="Go" />
    <Button on:click={async() =>{ await fetch(server.id+"/power?/start",{method:"POST",body:""})}}>Start</Button>
    <Button on:click={async() =>{ await fetch(server.id+"/power?/stop",{method:"POST",body:""})}}>Stop</Button>
</div>