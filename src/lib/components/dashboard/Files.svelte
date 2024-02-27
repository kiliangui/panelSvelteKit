<script lang="ts">
    import { Separator} from '$lib/components/ui/separator';
    import {FolderIcon} from "lucide-svelte";
    import {File} from "radix-icons-svelte";
    import {Card} from "$lib/components/ui/card";
    import {onMount} from "svelte";
    export let serverId:String;
    export let serverIdentifier : String;
    console.log(serverIdentifier)
    let sourceFile = "";
    let editedFile = "";

    async function saveFile(file:string){
        const result = await fetch("http://localhost:5173/api/servers/"+serverId+"/files?path="+path+file, {
            method: "POST",
            body: editedFile
        })
        const res = await result.text()
        console.log(res)
    }
    async function getFile(file:string){
        if (editedFile !== sourceFile){
            const result = confirm("Do you want to save the file before leaving?")
            if (result){
                await saveFile(file)
            }
        }
        const result = await fetch("http://localhost:5173/api/servers/"+serverId+"/files?path="+path+file+"&edit=true")
        const res = await result.text()

        editedFile = res;
        sourceFile = res;

    }

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
        document.addEventListener('keydown', e => {
            if (e.ctrlKey && e.key === 's') {
                // Prevent the Save dialog to open
                e.preventDefault();
                // Place your code here
                console.log('CTRL + S');
            }
        });
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
                <li style="{ file.attributes.size <= 10000 ? 'cursor:pointer;':'' }" on:click={()=>{
                    getFile(file.attributes.name)
                }}>
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
        <textarea class="w-full h-full" value={editedFile} style="background: unset;" id="editFile" on:keyup={(event)=>{
            const editElement = document.getElementById("editFile");
            editedFile=editElement.value; console.log(editedFile)}} ></textarea>
    </div>
</Card>