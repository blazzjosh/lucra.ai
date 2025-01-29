<script lang="ts">
	import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	let { id, emailTags, selectedLabels, i, handleSelect, closeAndFocusTrigger } = $props();

    // console.log(emailTags);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<EllipsisVertical />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
			<DropdownMenu.Sub>
				<DropdownMenu.SubTrigger>Tag Transaction</DropdownMenu.SubTrigger>
				<DropdownMenu.SubContent class="p-0">
					<Command.Root value={selectedLabels[i]?.id}>
						<Command.Input autofocus placeholder="Filter label..." class="h-9" />
						<Command.List>
							<Command.Empty>No label found.</Command.Empty>
							<Command.Group>
								{#each emailTags as tag, i}
									<Command.Item
										value={tag.id}
                                        onSelect={() => {
                                            closeAndFocusTrigger(i);
                                            handleSelect(tag, i);
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
            <DropdownMenu.Separator />
            <DropdownMenu.Item class="text-red-600">Ignore Transaction</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item>Transaction details</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
