<script lang="ts">
	let { amount, currency } = $props();
    import {formatMoney} from '$lib/utils.js';
</script>

<div>
	<h1>{formatMoney(amount, currency.code)}</h1>
</div>
