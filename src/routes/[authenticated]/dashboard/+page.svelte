<script lang="ts">
	import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { TotalSpendCard, SpendByCategoryCard } from './components/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { enhance } from '$app/forms';

	import { EmailTable } from '$lib/components/tables/index.js';


	let { form, data } = $props();

	type Tag = {
		id: string;
		name: string;
	};


	// Initialize selectedLabels with the existing tags from emails
	let selectedLabels = $state(
		data.emails.map((email: { tag: {id:string, name:string} | null }) => {
			// Only look for a matching tag if email.ex_tag exists
			if (email.tag) {
				const matchingTag = data.emailTags.find((tag: { id: string }) => tag.id === email.tag?.id);
				return matchingTag || { id: '', name: 'No tag' };
			}
			// Return null/empty state if no ex_tag exists
			return { id: '', name: 'Not tagged' };
		})
	);

	let openStates = $state(Array(data.emails.length).fill(false));
	let triggerRefs = $state(Array(data.emails.length).fill(null));
	let dialogOpen = $state(false);

	const handleSelect = async (email: any, tag: Tag, index: number) => {
		console.log(email);
		try {
			const res = await fetch('/api/debit-emails', {
				method: 'PATCH',
				body: JSON.stringify({
					id: email.id,
					updates: {
						ex_tag: tag.id
					}
				})
			});

			if (res.ok) {
				// Update the selectedLabels array only after successful API call
				selectedLabels[index] = tag;
			} else {
				console.error('Failed to update tag');
			}
		} catch (error) {
			console.error('Error updating tag:', error);
		}
	};

	function closeAndFocusTrigger(index: number) {
		openStates[index] = false;
		tick().then(() => {
			triggerRefs[index]?.focus();
		});
	}

	const initiateGmailAuth = async () => {
		const res = await fetch('/api/auth/gmail');
		const data = await res.json();
		if (data.url) {
			window.location.href = data.url;
		}
	};

	// console.log(data.ex_tags);
	
</script>

<!-- <Card items={data.analytics.tagSpending} /> -->

<div class="flex flex-1 flex-col gap-4 p-4">
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<TotalSpendCard items={data.analytics.monthlySpending} />
		<SpendByCategoryCard items={data.analytics.tagSpending} />
		<!-- <Card items={data.analytics.tagSpending} /> -->
		<!-- <Card items={data.analytics.tagSpending} /> -->
	</div>

	<div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 px-4 py-8 md:min-h-min">
		<div class="flex w-[50%] flex-col gap-2">
			<div class="flex items-center justify-between">
				<h1 class="text-2xl font-bold">Transactions</h1>

				<div class="flex gap-2">
					<Dialog.Root bind:open={dialogOpen}>
						<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>New Tag</Dialog.Trigger>
						<Dialog.Content class="sm:max-w-[425px]">
							<Dialog.Header>
								<Dialog.Title>Add a new tag</Dialog.Title>
								<Dialog.Description>Add a new Tag for your expenses.</Dialog.Description>
							</Dialog.Header>
							<form
								method="post"
								action="/[authenticated]/dashboard?/createTag"
								use:enhance={() => {
									// creating = true;
									return async ({ update }) => {
										await update();
										dialogOpen = false;
										// creating = false;
									};
								}}
							>
								<div class="grid gap-4 py-4">
									<div class="flex flex-col items-center gap-4">
										<div class="flex flex-col w-full gap-1">
											<Label for="tag_name" class="">Tag Name:</Label>
											<Input id="tag_name" name="tag_name" value="" class="col-span-3" required placeholder="Emergency Fund"/>
											<p style="color: red">{form?.message ?? ''}</p>
										</div>

										<div class="flex flex-col w-full gap-1">
											<Label for="tag_description" class="">Tag Description:</Label>
											<Textarea
												placeholder="Savings for unforeseen expenses"
												class="resize-none"
												name="tag_description"
												required
											/>
										</div>
									</div>
								</div>
								<Dialog.Footer>
									<Button type="submit">Save</Button>
								</Dialog.Footer>
							</form>
						</Dialog.Content>
					</Dialog.Root>
					<Button variant="outline" size="sm" onclick={() => initiateGmailAuth()}>
						Sync Gmail
					</Button>
				</div>
			</div>
			<EmailTable emails={data.emails} emailTags={data.emailTags} {selectedLabels} {handleSelect} {closeAndFocusTrigger} />	
			 <!-- {#each data.emails as email, i}
				<div
					class="flex w-full flex-col items-start justify-between rounded-md border bg-white px-4 py-3 sm:flex-row sm:items-center"
				>
					<div class="flex items-center gap-2 text-sm leading-none">
						<span class="">{formatMoney(email.amount, email.currency.code)} - {email.subject}</span>
						{#if selectedLabels[i]?.name !== 'Not tagged'}
							<Badge variant="secondary">{selectedLabels[i]?.name}</Badge>
						{:else}
							<div class="flex gap-2 text-xs italic">
								was this for entertainment?
								<Check class="h-4 w-4 rounded-md border text-green-500" />
								<X class="h-4 w-4 rounded-md border text-red-500" />
							</div>
						{/if}
					</div>

					<div class="flex gap-2">
						<Popover.Root>
							<Popover.Trigger class="outline-none"><Eye class="h-4 w-4" /></Popover.Trigger>
							<Popover.Content>
								<div class="h-full w-full overflow-y-auto">
									{@html email.body}
								</div>
							</Popover.Content>
						</Popover.Root>

						<DropdownMenu.Root bind:open={openStates[i]}>
							<DropdownMenu.Trigger bind:ref={triggerRefs[i]}>
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
											<Command.Root value={selectedLabels[i]?.id}>
												<Command.Input autofocus placeholder="Filter label..." class="h-9" />
												<Command.List>
													<Command.Empty>No label found.</Command.Empty>
													<Command.Group>
														{#each data.ex_tags as tag}
															<Command.Item
																value={tag.id}
																onSelect={() => {
																	closeAndFocusTrigger(i);
																	handleSelect(email, tag, i);
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
									<DropdownMenu.Item class="text-red-600">
										Delete
										<DropdownMenu.Shortcut>⌘⌫</DropdownMenu.Shortcut>
									</DropdownMenu.Item>
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				</div>
			{/each}  -->
		</div>
	</div>
</div>
