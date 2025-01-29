<script lang="ts">
	import { Icons } from '$lib/components/icons/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	let { body } = $props();
</script>

<Popover.Root>
    <Popover.Trigger class="outline-none"><Icons.Eye class="h-4 w-4" /></Popover.Trigger>
    <Popover.Content>
        <div class="h-full w-full overflow-y-auto">
            {@html body}
        </div>
    </Popover.Content>
</Popover.Root>