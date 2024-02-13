<script lang="ts">
    import RessourceGauge from "$lib/components/elements/RessourceGauge.svelte";
    import {Label} from "$lib/components/ui/label";
    import {Input} from "$lib/components/ui/input";
    import * as Select from "$lib/components/ui/select";

    const domains = [
        { value: "1", label: ".kiliangui.fr",default:true },
        { value: "2", label: ".orange.fr",default:false },
        { value: "3", label: ".kgui.fr",default:false },
        { value: "4", label: "custom",default:false },
    ];
</script>
<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Create a server</h1>
<div>
    <h2 class="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">Ressources Available</h2>
    <ul class="flex mt-6 gap-4">
        <li  class="w-full">
            <RessourceGauge name="CPU" value={15} max={100} />
        </li>
        <li  class="w-full">
            <RessourceGauge name="RAM" value={2} max={4} unit="Gb" />
        </li>
        <li class="w-full">
            <RessourceGauge name="Storage" value={2.5} max={25} unit="Gb" />
        </li>
    </ul>
</div>
<section class="mt-6">
    <h2 class="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">Server Configuration</h2>
    <form>
        <div>
            <Label for="name">Name</Label>
            <div class="flex">

                <Input id="name" type="text" placeholder="Your servername" />
                <Select.Root >
                    <Select.Trigger class="w-[180px]">
                        <Select.Value placeholder="Select a domain" />
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Group>
                            <Select.Label>Domains</Select.Label>
                            {#each domains as domain}
                                <Select.Item value={domain.value} selected="{domain.default}" label={domain.label}
                                >{domain.label}</Select.Item>
                            {/each}
                        </Select.Group>
                    </Select.Content>
                    <Select.Input name="favoriteFruit" />
                </Select.Root>
            </div>
        </div>
        <div>
            <Label for="type">

            </Label>
        </div>
    </form>
</section>