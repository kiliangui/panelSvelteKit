
<script lang="ts">
    import {Button} from "$lib/components/ui/button";
    import {Slider} from "$lib/components/ui/slider";

    let cpu = 2
    let cpuPrice = .25;
    function setCpu(event: Event){
        cpu = event.target?.value;
        prix()
    }
    let ram = 4096;
    let ramPrice = .25;
    function setRam(event: Event){
        ram = event.target?.value
        prix()
    }
    let disk = 5;
    let diskPrice = .40
    function setDisk(event:Event){
        disk = event.target?.value;
        prix()
    }
    let total = 0;
    function prix(){
        total = 0;
        if (disk>5){
            total += ((disk-5)/5)*diskPrice;
        }
        total += (ram/256)*ramPrice;
        total += (cpu) * cpuPrice;
    }
    prix();

</script>

<form action="/cart" method="post" >
    <div class="flex flex-col">
        <label for="cpu">Nombre de CPU : {cpu} </label>
        <input on:input={(event)=>setCpu(event)} name="cpu" id="cpu" type="range" max="8" min=".25" value={cpu} step=".25">
    </div>
    <div class="flex flex-col">
        <label for="ram">Nombre de ram : {ram} </label>
        <input on:input={(event)=>setRam(event)} name="ram" id="ram" type="range" max={256*64} min="256" value={ram} step="256">
    </div>
    <div class="flex flex-col">
        <label for="disk">Nombre de ram : {disk} </label>
        <input on:input={(event)=>setDisk(event)} name="disk" id="disk" type="range" max={150} min="5" value={disk} step="5">
    </div>
    <p>{total}</p>
    <Button type="submit" >Ajouter au panier</Button>
</form>
