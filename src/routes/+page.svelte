<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores';

	onMount(() => {
		if ($currentUser) {
			goto('/dashboard');
		}
	});
</script>

<svelte:head>
	<title>Bil3808ionaire</title>
</svelte:head>

<div class="min-h-screen bg-[#240f0f] text-white flex items-center justify-center px-6">
	<div class="text-center max-w-2xl">
		<h1 class="text-6xl md:text-7xl font-bold mb-8">
			Bil<span class="text-[#f8d0d8]">3808</span>ionaire
		</h1>
		
		<p class="text-lg text-gray-300 mb-12 italic">
			"Trust is good, proof is better."
		</p>

		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<button
				on:click={() => goto('/register')}
				class="px-12 py-4 bg-[#f8d0d8] text-[#240f0f] rounded-lg font-semibold text-xl hover:bg-white transition-colors"
			>
				Mulai
			</button>
			<button
				on:click={() => goto('/login')}
				class="px-12 py-4 border border-gray-600 text-white rounded-lg font-semibold text-xl hover:border-gray-400 transition-colors"
			>
				Masuk
			</button>
		</div>
	</div>
</div>
