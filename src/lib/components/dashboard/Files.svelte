<script lang="ts">
    import { Separator} from '$lib/components/ui/separator';
    import {FolderIcon} from "lucide-svelte";
    import {File} from "radix-icons-svelte";
    import {Card} from "$lib/components/ui/card";
    import {onMount} from "svelte";
    export let serverId:String;
    export let serverIdentifier : String;
    console.log(serverIdentifier)

    let path = "";
    // get the hash from the url
    let res;
    let folders = []
    let files = []


    onMount(async ()=>{
        path = location.href.split("#")[1] || "";
        await reloadPath();
        // detect if the user goes back or forward
        window.addEventListener("hashchange", async ()=>{
            path = location.href.split("#")[1] || "";
            await reloadPath();
        })
    })
    let ariane = []
    async function reloadPath(folder:string = ""){

        path = path+folder+"/"
        const splitted = path.split("/").filter((e)=>e !== "")
        ariane = []
        while (splitted.length > 0){
            ariane.push({
                name: splitted[splitted.length - 1],
                path: splitted.join("/")
            })
            splitted.pop()
        }
        ariane.push({
            name: "root",
            path: ""
        })
        ariane = ariane.reverse()
        console.log(ariane)
        console.log("http://localhost:5173/api/servers/"+serverId+"/files?path="+path)
        const result = await  fetch("http://localhost:5173/api/servers/"+serverId+"/files?path="+path)
        res = await result.json()
        console.log(res)
        folders = res.folders;
        files = res.files;

    }
 </script>

<ul class="flex gap-2 ">
    {#each ariane as folder}
        <li>
            <a href={"#"+folder.path} on:click={async ()=>{
                // change the windows location to the new path
                await reloadPath(folder.path);}} class="flex items-center gap-1">
                <span>{folder.name}</span> <Separator orientation="vertical" />
            </a>
        </li>
    {/each}
</ul>
<Card class="flex">
    <Card class="flex-1">

        <ul>

            {#each folders as folder}
                <li style="cursor:pointer;">
                    <a href={"#"+path} on:click={async ()=>{
                        // change the windows location to the new path
                        await reloadPath(folder.attributes.name);}}>
                        <div class="flex items-center p-4 gap-2">
                            <FolderIcon size="24"/>
                            <span>{folder?.attributes?.name}</span>
                        </div>
                    </a>
                    <Separator/>
                </li>
            {/each}

            {#each files as file}
                <li style="{ file.attributes.size <= 10000 ? 'cursor:pointer;':'' }">
                <div class="flex items-center p-4 gap-2">
                        <File size="24"/>
                        <span>{file?.attributes?.name}</span>
                    </div>
                    {#if file !== files[files.length - 1]}
                        <Separator/>
                    {/if}
                </li>
            {/each}
        </ul>
    </Card>
    <div style="flex: 2">

    </div>
</Card>