<script lang="ts">
	import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	let {row, emailId, id, triggerRefs, emailTags, selectedLabels, emailIndex, tagIndex, handleSelect, closeAndFocusTrigger, openStates } = $props();

</script>

<DropdownMenu.Root bind:open={openStates[emailIndex]}>
	<DropdownMenu.Trigger bind:ref={triggerRefs[emailIndex]}>
		{#snippet child({ props })}
			<Button variant="ghost" size="sm" {...props} aria-label="Open menu">
				<EllipsisVertical />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-[200px]" align="end">
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
			<DropdownMenu.Sub>
				<DropdownMenu.SubTrigger>Apply label</DropdownMenu.SubTrigger>
				<DropdownMenu.SubContent class="p-0">
					<Command.Root value={selectedLabels[emailIndex]?.id}>
						<Command.Input autofocus placeholder="Filter label..." class="h-9" />
						<Command.List>
							<Command.Empty>No label found.</Command.Empty>
							<Command.Group>
								{#each emailTags as tag}
									<Command.Item
										value={tag.id}
										onSelect={() => {
											closeAndFocusTrigger(emailIndex);
											handleSelect(tag, id, emailIndex);
										}}
									>
										{tag.name}
									</Command.Item>
								{/each}
							</Command.Group>
						</Command.List>
					</Command.Root>
				</DropdownMenu.SubContent>
			</DropdownMenu.Sub>
			<DropdownMenu.Item>Remind me</DropdownMenu.Item>
			<DropdownMenu.Item>Mark as unread</DropdownMenu.Item>
			<DropdownMenu.Item>Transaction details</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item class="text-red-600">
				Unlist Transaction
				<DropdownMenu.Shortcut>⌘⌫</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>