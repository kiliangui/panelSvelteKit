<script lang="ts">
    import RessourceGauge from "$lib/components/elements/RessourceGauge.svelte";
    import {Label} from "$lib/components/ui/label";
    import {Input} from "$lib/components/ui/input";
    import * as Select from "$lib/components/ui/select";

    import * as RadioGroup from "$lib/components/ui/radio-group";
    import {Button} from "$lib/components/ui/button";

    export let data : any;
    const user = data?.user;
    const offer = data?.offer;
    const message = data.body?.message || "";
    const domains = [
        { value: "1", label: ".kiliangui.fr",default:true },
        { value: "2", label: ".orange.fr",default:false },
        { value: "3", label: ".kgui.fr",default:false },
        { value: "4", label: "custom",default:false },
    ];

    let cpu = 2
    let cpuPrice = .25;
    function setCpu(event: Event){
        cpu = event.target?.value;
    }
    let ram = 4096;
    let ramPrice = .25;
    function setRam(event: Event){
        ram = event.target?.value
    }
    let disk = 5;
    let diskPrice = .40
    function setDisk(event:Event){
        disk = event.target?.value;
    }




</script>
<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Create a server</h1>
    {#if message}
    <p>{message}</p>
    {/if}
<div>
    <h2 class="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">Ressources Available</h2>
    <ul class="flex mt-6 gap-4">
        <li  class="w-full">
            <RessourceGauge name="CPU" max={offer?.cpu} />
        </li>
        <li  class="w-full">
            <RessourceGauge name="RAM" value={2048} max={offer?.ram} unit="Mo" />
        </li>
        <li class="w-full">
            <RessourceGauge name="Storage" value={2.5} max={offer?.disk} unit="Gb" />
        </li>
    </ul>
</div>
<section class="mt-6">
    <h2 class="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">Server Configuration</h2>
    <form method="post" >
        <div class="flex gap-8">

            <section id="informations" class="flex-1">
            <div>
                <Label for="name">Name</Label>
                <div class="flex">
                    <Input id="name" name="name" type="text" placeholder="Your servername" />
                    <Select.Root >
                        <Select.Trigger class="w-[180px]">
                            <Select.Value placeholder="Select a domain" />
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Group>
                                <Select.Label>Domains</Select.Label>
                                {#each domains as domain}
                                    <Select.Item value={domain.label} selected="{domain.default}" label={domain.label}
                                    >{domain.label}</Select.Item>
                                {/each}
                            </Select.Group>
                        </Select.Content>
                        <Select.Input name="domain" value="{domains[0].value}" />
                    </Select.Root>
                </div>
            </div>
            <div class="flex gap-8 items-center">
                <div>

                    <Label for="type">Version</Label>
                    <!--Radio html-->
                    <div class="flex gap-4">

                    <div>
                        <input type="radio" id="type" name="type" value="vanilla">
                        <label for="vanilla">Vanilla</label>
                    </div>
                    <div>
                        <input type="radio" id="type" name="type" value="spigot" checked>
                        <label for="spigot">Spigot</label>
                    </div>
                    <div>
                        <input type="radio" id="type" name="type" value="paper">
                        <label for="paper">Paper</label>
                    </div>
                    </div>
                    <!-- CheckBox -->
                </div>
                <div class="flex-1">
                    <Label for="version">Version</Label>
                    <div class="flex gap-4">
                        <Input id="version" name="version" type="text" placeholder="Your server version" />
                    </div>
                </div>
            </div>
        </section>
            <section id="ressources"  class="flex-1">
                <div class="flex flex-col">
                    <label for="cpu">Nombre de CPU : {cpu} </label>
                    <input on:input={(event)=>setCpu(event)} name="cpu" id="cpu" type="range" max="{offer.cpu/100}" min=".25" value={cpu} step=".25">
                </div>
                <div class="flex flex-col">
                    <label for="ram">Nombre de ram : {ram} </label>
                    <input on:input={(event)=>setRam(event)} name="ram" id="ram" type="range" max={offer.ram} min="256" value={ram} step="256">
                </div>
                <div class="flex flex-col">
                    <label for="disk">Nombre de ram : {disk} </label>
                    <input on:input={(event)=>setDisk(event)} name="disk" id="disk" type="range" max={offer.disk} min="5" value={disk} step="5">
                </div>

        </section>
        </div>
        <Button type="submit" class="mt-4">Create</Button>
    </form>
</section>