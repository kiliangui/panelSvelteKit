<script lang="ts">
import RessourceGauge from "$lib/components/elements/RessourceGauge.svelte";
import type {Server} from "@prisma/client";
import * as Alert from "$lib/components/ui/alert";
import {ExclamationTriangle} from "radix-icons-svelte";
import {Button} from "$lib/components/ui/button";
import {onMount} from "svelte";
import ansi from "ansidec";
import * as Tabs from "$lib/components/ui/tabs";


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
import {Input} from "$lib/components/ui/input";
import Files from "$lib/components/dashboard/Files.svelte";

const socket = io()

socket.emit('auth',{id:server.id})
socket.on('eventFromServer', (data) => {
    if (data.args && data.args.length !== 1) return;
    if (data.event === "stats") {
        data.args[0] = JSON.parse(data.args[0])
        cpu =  Math.ceil(Math.min(server.cpu,data.args[0]["cpu_absolute"]));
        ram = Math.ceil(data.args[0]["memory_bytes"]/1024/1024);
        disk = Math.round((data.args[0]["disk_bytes"]/1024/1024/1024 + Number.EPSILON) * 100) / 100;

    }
    if (data.event === "console output") {
        let log = data.args[0];
        // get the Ansi color
        var format = ansi.format(function (styles,color,background,text){
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
        // remove ansii color
        log = log.replace(/\x1b\[[0-9;]*m/g, '');
        logs = [...logs, [log,color]];

        updateScroll();
    }
})
socket.on('', (message) => {
    cpu  = Math.ceil(Math.min(100,message.cpu_absolute));
    ram = Math.ceil(message.memory_bytes/1024/1024);
    disk = Math.round((message.disk_bytes/1024/1024/1024 + Number.EPSILON) * 100) / 100;
})
let consoleList : HTMLElement | null;
let stickBottom = true;

function updateScroll(){
    // scroll to the last item
    //console.log("UPDATING SCROLL", consoleList.scrollTop, consoleList.clientHeight, consoleList.scrollHeight, stickBottom)
    if (stickBottom) consoleList.scrollTop = consoleList.scrollHeight;
}
onMount(async ()=>{

    consoleList = document.getElementById("consoleList");
    if (!consoleList) return;
    // sleep for 2 seconds
    await new Promise(r => setTimeout(r, 2000));
    consoleList.addEventListener("scroll", async function(event) {
        if (consoleList.scrollTop + consoleList.clientHeight + 1 < consoleList.scrollHeight) {
            stickBottom = false;
        } else {
            stickBottom = true;
        }
    });
})

let command:string = "";
async function sendCommand(){
    console.log("SENDING COMMAND")
    socket.emit('eventFromClient', {event: "send command", args: [command]})
    command = "";
    // sleep for 2 seconds
    await new Promise(r => setTimeout(r, 2000));
    console.log("UPDATING SCROLL")
    updateScroll();
}

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
        <RessourceGauge  value="{String(server.cpu)}"/>
    {/if}
    <Tabs.Root value="main" >
        <Tabs.List>
            <Tabs.Trigger value="main">Informations</Tabs.Trigger>
            <Tabs.Trigger value="files">Fichiers</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="main">

            <div class="flex gap-4">

                <section class="flex-2">
                    <h1>{server.name}</h1>

                    <ul id="consoleList" class="h-80 overflow-scroll ">
                        {#each logs as log}
                            <li style={log[1]}>{log[0]}</li>
                        {/each}
                    </ul>
                    <div class="flex gap-2 items-center ">

                        <Input type="text" id="command" bind:value={command} placeholder="command" />
                        <Button on:click={async (event)=>{
                    sendCommand()}}>Send</Button>
                    </div>
                </section>
                <section class="flex-1">
                    <RessourceGauge name="CPU usage" value="{String(cpu)}" max={String(server.cpu)} />
                    <RessourceGauge name="RAM usage" value="{String(ram)}" max={String(server.ram)} unit="Mb" />
                    <RessourceGauge name="DISK usage" value="{String(disk)}" max={String(server.disk)} unit="Go" />
                </section>
            </div>

            <Button on:click={async() =>{ const res = await fetch(server.id+"/power?action=start",{method:"POST",body:""});
                          if (res.status === 200){

                          }
            }}>Start</Button>
            <Button on:click={async() =>{ await fetch(server.id+"/power?action=stop",{method:"POST",body:""})}}>Stop</Button>
        </Tabs.Content>
        <Tabs.Content value="files">
            <Files serverId={server.id} serverIdentifier={server.distantIdentifier} />
        </Tabs.Content>
    </Tabs.Root>

</div>