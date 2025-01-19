<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { enhance } from '$app/forms';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import MessageCircleMore from 'lucide-svelte/icons/message-circle-more';
	import { Icons } from '$lib/components/icons/index.js';

	let { handleGoogleLogin } = $props();
</script>

<Card.Root class="mx-auto max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Login</Card.Title>
		<Card.Description>Use the email associated with your debit account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="post" action="/auth/login?/login" use:enhance>
			<div class="grid gap-4">
				<div class="flex flex-wrap gap-2">
					<Button disabled variant="outline" class="w-full">
						<Icons.Yahoo  />
						Continue with Yahoo
						</Button
					>
					<Button onclick={handleGoogleLogin} variant="outline" class="w-full">
						<Icons.Google /> Continue with Google</Button
					>
					<Button disabled variant="outline" class="w-full">
						<Icons.Outlook />
						Continue with Outlook</Button
					>
				</div>
				<Separator />

				<!-- <div class="grid gap-2">
				<Label for="username">Username</Label>
				<Input name="username" placeholder="username" required />
				<p style="color: red">{form?.message ?? ''}</p>
			</div>
			<div class="grid gap-2">
				<div class="flex items-center">
					<Label for="password">Password</Label>
					<a href="##" class="ml-auto inline-block text-sm underline">
						Forgot your password?
					</a>
				</div>
				<Input name="password" id="password" type="password" required />
			</div> -->
				<!-- <Button type="submit" class="w-full">Login</Button> -->
				<!-- <Button variant="outline" class="w-full">Login with Google</Button> -->
			</div>
			<div class="mt-4 flex items-center justify-center gap-2 text-center text-sm">
				Can't sync?

				<a href="##" class="flex items-center gap-1 underline">
					Chat with us
					<MessageCircleMore class="size-4" />
				</a>
			</div>
		</form>
	</Card.Content>
</Card.Root>
