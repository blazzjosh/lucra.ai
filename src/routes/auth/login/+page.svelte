<script lang="ts">
	import type { ActionData } from './$types.js';
	import LoginForm from '$lib/components/login-form.svelte';
	import Microscope from 'lucide-svelte/icons/microscope';
	import { Header, Footer } from '$lib/components/landing/index.js';

	let handleGoogleLogin = async () => {
		const res = await fetch('/api/auth/gmail');
		const data = await res.json();
		if (data.url) {
			window.location.href = data.url;
		}
	};
</script>

<div class="flex h-screen w-full flex-col items-center justify-center gap-4 px-4">
	<Header />
	<LoginForm {handleGoogleLogin} />
</div>
<Footer />	