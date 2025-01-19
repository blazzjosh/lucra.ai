<script lang="ts">
	import type { ActionData } from './$types.js';
	import LoginForm from '$lib/components/login-form.svelte';
	import Microscope from 'lucide-svelte/icons/microscope';

	let handleGoogleLogin = async () => {
		const res = await fetch('/api/auth/gmail');
		const data = await res.json();
		if (data.url) {
			window.location.href = data.url;
		}
	};
</script>

<div class="flex h-screen w-full flex-col items-center justify-center gap-4 px-4">
	<span class="flex items-center text-2xl font-bold text-gray-500">
		<Microscope class="size-6" />
		DebitLens
	</span>
	<LoginForm {handleGoogleLogin} />
</div>
