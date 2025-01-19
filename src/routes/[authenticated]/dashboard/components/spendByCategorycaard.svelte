<script lang="ts">
	import { VisSingleContainer, VisDonut, VisBulletLegend } from '@unovis/svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { format, parseISO } from 'date-fns';

	interface TagSpendItem {
		change_percent: string;
		currency_code: string;
		tag_id: string;
		tag_name: string;
		total_amount: string;
	}

	let { items } = $props<{ items: TagSpendItem[] }>();

	// console.log('items', items);
	let data: TagSpendItem[] = $state([]);

	let chartData = $derived(() => {
		return items ? items.map((item: TagSpendItem) => {
			if (item.tag_name === null) {
				return {
					key: 'uncategorized',
					value: parseInt(item.total_amount)
				};
			}
			return {
				key: item.tag_name,
						value: parseInt(item.total_amount)
					};
				})
			: [];
	});

	let legendItems = $derived(() => {
		return chartData().map((item: any) => ({
			name: item.key.charAt(0).toUpperCase() + item.key.slice(1),
			color: undefined
		}));
	});

	// $effect(() => {
	// 	console.log('chartData', chartData());
	// 	console.log('legendItems', legendItems());
	// });

	// Format currency for tooltips
	function formatCurrency(amount: number, currency = 'USD') {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	// const data = [
	// 	{ key: 'names', value: 1396 },
	// 	{ key: 'cool', value: 928 },
	// 	{ key: 'alphanumeric', value: 864 },
	// 	{ key: 'fluffy', value: 518 },
	// 	{ key: 'nerdy', value: 294 },
	// 	{ key: 'other', value: 916 }
	// ];

	// const legendItems = Object.entries(data).map(([_, data]) => ({
	// 	name: data.key.charAt(0).toUpperCase() + data.key.slice(1)
	// }));

	// let selectedMonth = $state('all');

	// // console.log('selectedMontth', selectedMonth);
	// $effect(() => {
	// 	console.log('selectedMonth', selectedMonth);
	// });

	// Get selected label
	// const triggerContent = $derived(() => {
	// 	if (selectedMonth === 'all') {
	// 		return 'All Months';
	// 	}
	// 	return format(parseISO(selectedMonth), 'MMMM yyyy');
	// });

	// // Calculate total amount based on selection
	// const totalAmount = $derived(() => {
	// 	if (selectedMonth === 'all') {
	// 		return items.reduce((sum: number, item: BalanceItem) => sum + parseInt(item.totalAmount), 0);
	// 	} else {
	// 		const selectedItem = items.find((item: BalanceItem) => item.month === selectedMonth);
	// 		return selectedItem ? parseInt(selectedItem.totalAmount) : 0;
	// 	}
	// });

	// // Get currency code (assuming it's the same for all items)
	// const currencyCode = items[0]?.currencyCode || 'NGN';

	// // Format amount with currency
	// const formattedAmount = $derived(() => {
	// 	return new Intl.NumberFormat('en-NG', {
	// 		style: 'currency',
	// 		currency: currencyCode
	// 	}).format(totalAmount());
	// });
</script>

<Card.Root class="w-full">
	<Card.Header class="text-sm">
		<div class="flex items-center justify-between">
			<Card.Title>Spending by Category</Card.Title>
			<div class="flex items-center justify-between">
				<!-- <Select.Root type="single" bind:value={selectedMonth}>
					<Select.Trigger class="w-[180px]">
						<span>{triggerContent()}</span>
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.GroupHeading>Select Period</Select.GroupHeading>
							<Select.Item value="all" label="All Months" />
							{#each items as item}
								<Select.Item value={item.month} label={format(parseISO(item.month), 'MMM')} />
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root> -->
			</div>
		</div>
	</Card.Header>
	<Card.Content class="grid gap-1">
		<div class="flex items-center justify-between">
			<VisSingleContainer height={200}>
				<VisDonut
					data={chartData()}
					value={(d: any) => d.value}
					arcWidth={60}
					padAngle={0.01}
					showEmptySegments={true}
					dataKey={(d: any) => d.key}
					tooltip={{
						content: (d: any) => `${d.key}: ${formatCurrency(d.value, d.currency)}`
					}}
				/>
			</VisSingleContainer>
		</div>
		<div class="mb-4">
			<VisBulletLegend items={legendItems()} interactive={true} />
		</div>
	</Card.Content>
</Card.Root>
