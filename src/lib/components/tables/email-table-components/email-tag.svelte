<script lang="ts">
	import { Icons } from '$lib/components/icons/index.js';
	let { selectedLabels, emailIndex } = $props();
	import { Badge } from '$lib/components/ui/badge/index.js';

</script>

{#if selectedLabels[emailIndex]?.name !== 'Not tagged'}
	<Badge variant="secondary">{selectedLabels[emailIndex]?.name}</Badge>
{:else}
	<div class="flex gap-2 text-xs italic">
		was this for entertainment?
		<Icons.Check class="h-4 w-4 rounded-md border text-green-500" />
		<Icons.X class="h-4 w-4 rounded-md border text-red-500" />
	</div>
{/if}
