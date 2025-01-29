<script lang="ts">
    import { Icons } from '$lib/components/icons/index.js';
	let { tag } = $props();
    import { Badge } from '$lib/components/ui/badge/index.js';
</script>

<div>
    {#if !tag}
    <div class="flex gap-2 text-xs italic">
        was this for entertainment?
        <Icons.Check class="h-4 w-4 rounded-md border text-green-500" />
        <Icons.X class="h-4 w-4 rounded-md border text-red-500" />
    </div>
    {:else}
        <Badge variant="secondary">{tag.name}</Badge>
    {/if}
</div>
