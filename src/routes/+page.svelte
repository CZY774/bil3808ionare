<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores';
	import { DollarSign, Users, Shield, ArrowRight } from 'lucide-svelte';

	onMount(() => {
		if ($currentUser) {
			goto('/dashboard');
		}
	});
</script>

<svelte:head>
	<title>Bil3808ionaire</title>
</svelte:head>

<div class="min-h-screen bg-[#240f0f] text-white">
	<!-- Header -->
	<header class="flex items-center justify-between p-6">
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 bg-[#f8d0d8] rounded-lg flex items-center justify-center">
				<DollarSign class="w-5 h-5 text-[#240f0f]" />
			</div>
			<span class="text-xl font-semibold">Bil3808ionaire</span>
		</div>
		<div class="flex gap-4">
			<button
				on:click={() => goto('/login')}
				class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
			>
				Masuk
			</button>
			<button
				on:click={() => goto('/register')}
				class="px-6 py-2 bg-[#f8d0d8] text-[#240f0f] rounded-lg font-medium hover:bg-white transition-colors"
			>
				Daftar
			</button>
		</div>
	</header>

	<!-- Hero -->
	<main class="px-6 py-20 text-center">
		<div class="max-w-4xl mx-auto">
			<h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">
				Kelola Iuran<br />
				<span class="text-[#f8d0d8]">8 Teman Sekamar</span>
			</h1>
			
			<p class="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
				Buat tagihan, bagikan otomatis, upload bukti pembayaran
			</p>

			<div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
				<button
					on:click={() => goto('/register')}
					class="px-8 py-4 bg-[#f8d0d8] text-[#240f0f] rounded-lg font-semibold text-lg hover:bg-white transition-colors flex items-center justify-center gap-2"
				>
					Mulai Sekarang
					<ArrowRight class="w-5 h-5" />
				</button>
				<button
					on:click={() => goto('/login')}
					class="px-8 py-4 border border-gray-600 rounded-lg font-semibold text-lg hover:border-gray-400 transition-colors"
				>
					Sudah Punya Akun
				</button>
			</div>

			<!-- Features -->
			<div class="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
				<div class="text-center">
					<div class="w-12 h-12 bg-[#f8d0d8] rounded-lg flex items-center justify-center mx-auto mb-4">
						<DollarSign class="w-6 h-6 text-[#240f0f]" />
					</div>
					<h3 class="font-semibold mb-2">Bagi Otomatis</h3>
					<p class="text-gray-400 text-sm">Tagihan dibagi rata ke 8 anggota</p>
				</div>
				
				<div class="text-center">
					<div class="w-12 h-12 bg-[#f8d0d8] rounded-lg flex items-center justify-center mx-auto mb-4">
						<Shield class="w-6 h-6 text-[#240f0f]" />
					</div>
					<h3 class="font-semibold mb-2">Bukti Bayar</h3>
					<p class="text-gray-400 text-sm">Upload bukti, status otomatis lunas</p>
				</div>
				
				<div class="text-center">
					<div class="w-12 h-12 bg-[#f8d0d8] rounded-lg flex items-center justify-center mx-auto mb-4">
						<Users class="w-6 h-6 text-[#240f0f]" />
					</div>
					<h3 class="font-semibold mb-2">Mode Admin</h3>
					<p class="text-gray-400 text-sm">Kelola status dengan audit log</p>
				</div>
			</div>
		</div>
	</main>
</div>
