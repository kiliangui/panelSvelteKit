<script>
    import {Card} from "$lib/components/ui/card";
    import {Progress} from "$lib/components/ui/progress";

    export let name = 'default';
    export let value = '50';
    export let unit = "%";
    export let max = '100'
    export let color = 'blue'
</script>
<div>
    <Card>
        <div class="p-8 mx-auto">
            <div class="flex justify-between">
                <p>{name}</p>
                <p>Total: {max}{unit}</p>
            </div>
            <div class="">
                <Progress  value="{value}" max={max} color={color}/>
                <div class="flex justify-end">
                    <p class="">Left: {max-value}{unit}</p>
                </div>
            </div>
        </div>
    </Card>
</div>
