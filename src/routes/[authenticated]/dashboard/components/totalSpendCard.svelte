<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { format, parseISO } from 'date-fns';
	import { VisGroupedBar, VisXYContainer, VisAxis, VisStackedBar } from '@unovis/svelte';

	interface BalanceItem {
		month: string;
		totalAmount: string;
		currencyCode: string;
	}

	let { items } = $props<{ items: BalanceItem[] }>();

	let selectedMonth = $state('all');

	const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	let chartData = $derived(() => {
    if (!items) return allMonths.map(month => ({ month, amount: 0 }));
    
    // Create a map of existing data
    const dataMap = new Map(
      items.map((item: BalanceItem) => [
        format(parseISO(item.month), 'MMM'),
        parseInt(item.totalAmount)
      ])
    );

    // Return array with all months, using 0 for missing values
    return allMonths.map(month => ({
      month,
      amount: dataMap.get(month) || 0
    }));
  });

	// Get selected label
	const triggerContent = $derived(() => {
		if (selectedMonth === 'all') {
			return 'All';
		}
		return format(parseISO(selectedMonth), 'mmm yyyy');
	});

	// Calculate total amount based on selection
	let totalAmount = $derived(() => {
		if (!items) return 0;

		if (selectedMonth === 'all') {
			return items.reduce((sum: number, item: BalanceItem) => sum + parseInt(item.totalAmount), 0);
		}
		const selectedItem = items.find((item: BalanceItem) => item.month === selectedMonth);
		return selectedItem ? parseInt(selectedItem.totalAmount) : 0;
	});

	// // Get currency code (assuming it's the same for all items)
	let currencyCode = $derived(() => {
		return items && items[0]?.currencyCode ? items[0]?.currencyCode : 'NGN';
	});

	// Format amount with currency
	let formattedAmount = $derived(() => {
		return new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: currencyCode()
		}).format(totalAmount());
	});

	const x  = (_d:any, i:number) => i;
	const y = (d:{month:string, amount:number}) => d.amount;

	const tickFormat = (tick: number) => chartData()[tick]?.month || '';

	
</script>

<Card.Root>
	<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
		<Card.Title class="text-base font-normal">Total Spendings</Card.Title>
		<div class="flex items-center justify-between">
			<Select.Root type="single" bind:value={selectedMonth}>
				<Select.Trigger class="w-[180px]">
					<span>{triggerContent()}</span>
				</Select.Trigger>
			</Select.Root>
		</div>
	</Card.Header>
	<Card.Content>
		<div class="text-2xl font-bold">{formattedAmount()}</div>
		<p class="text-xs text-muted-foreground">+180.1% from last month</p>
		<div class="mt-4 h-[80px]">
			<VisXYContainer data={chartData()} height={120} >
				<VisAxis type="x" {tickFormat}/>
				<VisGroupedBar {x} {y} roundedCorners={4} />
			</VisXYContainer>
		</div>
	</Card.Content>
</Card.Root>
