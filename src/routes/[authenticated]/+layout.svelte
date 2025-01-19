<script lang="ts">
	import { enhance } from '$app/forms';
	import type { LayoutServerData } from './$types.js';
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";

	let { data, children }: { data: LayoutServerData; children: any } = $props();
	// console.log(data.user);

	const logout = async () => {
		console.log('Logging out');
		const response = await fetch('/api/auth/logout', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (response.ok) {
			window.location.href = '/auth/login';
		} else {
			console.error('Logout failed');
		}
	};	
</script>



<Sidebar.Provider>
	<AppSidebar user={data.user} logout={logout}/>
	<Sidebar.Inset>
		<header
			class="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4"
		>
			<Sidebar.Trigger class="-ml-1" />
			<Separator orientation="vertical" class="mr-2 h-4" />
			<Breadcrumb.Root>
				<Breadcrumb.List>
					<Breadcrumb.Item>
						<Breadcrumb.Page>Main</Breadcrumb.Page>
					</Breadcrumb.Item>
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</header>
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
