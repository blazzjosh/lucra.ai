<script lang="ts">
	import { goto } from '$app/navigation';
	let { data } = $props();
	let status: 'loading' | 'success' | 'error' = $state('loading');

    $effect(() => {
        if(data.success) {
            status = 'success';
            goto('/[authenticated]/dashboard');
        } else {
            status = 'error';
        }
    });

</script>

<!-- <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div class="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        {#if status === 'loading'}
            <div class="text-center">
                <h2 class="text-2xl font-semibold mb-4">Processing...</h2>
                <p class="text-gray-600">Please wait while we complete the authentication.</p>
            </div>
        {:else if status === 'success'}
            <div class="text-center">
                <h2 class="text-2xl font-semibold mb-4 text-green-600">Successfully Connected!</h2>
                <p class="text-gray-600">Redirecting you to the dashboard...</p>
            </div>
        {:else}
            <div class="text-center">
                <h2 class="text-2xl font-semibold mb-4 text-red-600">Authentication Failed</h2>
                <p class="text-gray-600">
                    {errorMessage || 'An error occurred during authentication.'}
                </p>
                <button 
                    class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onclick={() => goto('/')}
                >
                    Return Home
                </button>
            </div>
        {/if}
    </div>
</div> -->
