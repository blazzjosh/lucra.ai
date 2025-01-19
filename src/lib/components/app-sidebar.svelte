

<script lang="ts">
	import Microscope from 'lucide-svelte/icons/microscope';
	import Calendars from "$lib/components/calendars.svelte";
	import DatePicker from "$lib/components/date-picker.svelte";
	import NavUser from "$lib/components/nav-user.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import Plus from "lucide-svelte/icons/plus";
	import type { ComponentProps } from "svelte";
	let { logout, user, ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> & { user: { name: string; email: string; picture: string }; logout: () => void } = $props();
</script>

<Sidebar.Root bind:ref {...restProps}>
	<Sidebar.Header class="border-sidebar-border h-16 border-b">
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="##" {...props}>
							<div class="border bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
								<Microscope class="size-7" />
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">DebitLens</span>
								<span class="truncate text-xs">by SynergyDesk</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<DatePicker />
		<Sidebar.Separator class="mx-0" />
		<!-- <Calendars calendars={data.calendars} /> -->
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={user} logout={logout} />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
