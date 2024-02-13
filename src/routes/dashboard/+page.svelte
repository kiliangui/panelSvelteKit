
<script>
  import {Button} from "$lib/components/ui/button";
  export let data;

</script>

<div class="h-full flex flex-col items-center justify-center gap-4">
  {#if data.session}
    <h1 class="text-5xl">Dashboard</h1>
    Welcome back,<span class="text-4xl">{data.session.user?.name}!</span>
  {/if}
  <h1>Owned Server</h1>
  {#each data.OwnedServers as server}
    <div class="flex flex-col items-center gap-4">
      <h1 class="text-3xl">{server.name}</h1>
      <Button href="/server/{server.id}" >View Server</Button>
    </div>
  {/each}
  <h1>AllowedServer</h1>
    {#each data.AllowedServers as server}
        <div class="flex flex-col items-center gap-4">

        <h1 class="text-3xl">{server.name}</h1>
        <a href="/server/{server.id}" class="text-blue-500">View Server</a>
        </div>
    {/each}
  {#if data.session}
    <a href="/create-server" class="text-blue-500">Create Server</a>
  {/if}
</div>