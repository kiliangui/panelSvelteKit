<script>
    export let data;
    console.log(data)
    const message = data.body?.message;
</script>

<div>
    {#if message}
        <p>{message}</p>
    {/if}
</div>
