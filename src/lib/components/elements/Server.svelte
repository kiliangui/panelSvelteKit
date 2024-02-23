<script lang="js">
    import {Button} from "$lib/components/ui/button";
    import {Card} from "$lib/components/ui/card";

    export let server = ""
</script>
<Card class="flex flex-col items-center gap-4">
    <h1 class="text-3xl">{server.name}</h1>
    <p>{server.status}</p>

    <Button href="/dashboard/server/{server.id}" >View Server</Button>
</Card>