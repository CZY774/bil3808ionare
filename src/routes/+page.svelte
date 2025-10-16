<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores';
	import { DollarSign, Users, Shield, Bell, Package, ArrowRight, CheckCircle } from 'lucide-svelte';

	onMount(() => {
		// Redirect to dashboard if already logged in
		if ($currentUser) {
			goto('/dashboard');
		}
	});

	const features = [
		{
			icon: DollarSign,
			title: 'Bagi Tagihan Otomatis',
			description: 'Sistem otomatis membagi tagihan ke semua anggota dengan perhitungan yang akurat'
		},
		{
			icon: Users,
			title: 'Kelola 8 Anggota',
			description: 'Dirancang khusus untuk 8 teman sekamar dengan manajemen yang mudah'
		},
		{
			icon: Shield,
			title: 'Bukti Pembayaran',
			description: 'Upload bukti transfer atau cash untuk transparansi penuh'
		},
		{
			icon: Bell,
			title: 'Reminder Otomatis',
			description: 'Notifikasi email dan PWA untuk mengingatkan tenggat pembayaran'
		}
	];

	const benefits = [
		'Tidak ada biaya tersembunyi - gratis selamanya',
		'Mode admin dengan audit log lengkap',
		'Sinkronisasi real-time antar pengguna',
		'PWA - bisa diinstall seperti aplikasi native',
		'Keamanan tingkat bank dengan Supabase',
		'Interface yang mudah digunakan'
	];
</script>

<svelte:head>
	<title>Bil3808ionaire - Manajemen Iuran Teman Sekamar</title>
	<meta
		name="description"
		content="Aplikasi PWA untuk mengelola iuran dan pembagian tagihan 8 teman sekamar secara transparan dan otomatis."
	/>
</svelte:head>

<div class="min-h-screen bg-[#1a1a1a] text-white">
	<!-- Navigation -->
	<nav class="border-b border-gray-800">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<div class="flex items-center space-x-3">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600"
					>
						<Package class="h-5 w-5 text-white" />
					</div>
					<span class="text-xl font-bold">Bil3808ionaire</span>
				</div>
				<div class="flex items-center space-x-4">
					<button
						on:click={() => goto('/login')}
						class="text-gray-300 transition-colors hover:text-white"
					>
						Masuk
					</button>
					<button
						on:click={() => goto('/register')}
						class="rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-2 font-medium transition-all duration-200 hover:from-pink-600 hover:to-rose-700"
					>
						Daftar Sekarang
					</button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Hero Section -->
	<section class="px-4 py-20">
		<div class="mx-auto max-w-7xl text-center">
			<div class="mb-8">
				<div
					class="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600"
				>
					<DollarSign class="h-10 w-10 text-white" />
				</div>
				<h1
					class="mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-5xl font-bold text-transparent md:text-6xl"
				>
					Kelola Iuran Kos<br />Jadi Lebih Mudah
				</h1>
				<p class="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-400">
					Aplikasi PWA yang dirancang khusus untuk 8 teman sekamar. Buat tagihan, bagikan otomatis,
					upload bukti pembayaran, dan kelola semuanya dengan transparan.
				</p>
			</div>

			<div class="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
				<button
					on:click={() => goto('/register')}
					class="flex transform items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-105 hover:from-pink-600 hover:to-rose-700"
				>
					Mulai Gratis Sekarang
					<ArrowRight class="h-5 w-5" />
				</button>
				<button
					on:click={() => goto('/login')}
					class="rounded-xl border border-gray-600 px-8 py-4 text-lg font-semibold transition-all duration-200 hover:border-gray-500"
				>
					Sudah Punya Akun?
				</button>
			</div>

			<!-- Stats -->
			<div class="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
				<div class="text-center">
					<div class="mb-2 text-3xl font-bold text-pink-500">100%</div>
					<div class="text-gray-400">Gratis Selamanya</div>
				</div>
				<div class="text-center">
					<div class="mb-2 text-3xl font-bold text-pink-500">8</div>
					<div class="text-gray-400">Anggota Maksimal</div>
				</div>
				<div class="text-center">
					<div class="mb-2 text-3xl font-bold text-pink-500">24/7</div>
					<div class="text-gray-400">Sinkronisasi Real-time</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="bg-[#0f0f0f] px-4 py-20">
		<div class="mx-auto max-w-7xl">
			<div class="mb-16 text-center">
				<h2 class="mb-4 text-4xl font-bold">Fitur Unggulan</h2>
				<p class="mx-auto max-w-2xl text-xl text-gray-400">
					Semua yang Anda butuhkan untuk mengelola iuran kos dengan mudah dan transparan
				</p>
			</div>

			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
				{#each features as feature}
					<div
						class="rounded-xl border border-gray-800 bg-[#1a1a1a] p-6 transition-colors hover:border-gray-700"
					>
						<div
							class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600"
						>
							<svelte:component this={feature.icon} class="h-6 w-6 text-white" />
						</div>
						<h3 class="mb-3 text-xl font-semibold">{feature.title}</h3>
						<p class="leading-relaxed text-gray-400">{feature.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Benefits Section -->
	<section class="px-4 py-20">
		<div class="mx-auto max-w-7xl">
			<div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
				<div>
					<h2 class="mb-6 text-4xl font-bold">Mengapa Pilih Bil3808ionaire?</h2>
					<p class="mb-8 text-xl text-gray-400">
						Dibangun khusus untuk kebutuhan teman sekamar dengan fokus pada transparansi, kemudahan
						penggunaan, dan keamanan data.
					</p>

					<div class="space-y-4">
						{#each benefits as benefit}
							<div class="flex items-start gap-3">
								<CheckCircle class="mt-0.5 h-6 w-6 flex-shrink-0 text-green-500" />
								<span class="text-gray-300">{benefit}</span>
							</div>
						{/each}
					</div>
				</div>

				<div class="rounded-2xl border border-gray-800 bg-[#0f0f0f] p-8">
					<h3 class="mb-6 text-center text-2xl font-bold">Cara Kerja</h3>
					<div class="space-y-6">
						<div class="flex items-start gap-4">
							<div
								class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-pink-500 text-sm font-bold"
							>
								1
							</div>
							<div>
								<h4 class="mb-1 font-semibold">Buat Tagihan</h4>
								<p class="text-sm text-gray-400">
									Buat tagihan baru (listrik, air, internet, dll) dan sistem otomatis membagi ke 8
									anggota
								</p>
							</div>
						</div>
						<div class="flex items-start gap-4">
							<div
								class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-pink-500 text-sm font-bold"
							>
								2
							</div>
							<div>
								<h4 class="mb-1 font-semibold">Upload Bukti</h4>
								<p class="text-sm text-gray-400">
									Setiap anggota upload bukti pembayaran (transfer/cash) dan status otomatis berubah
									"Lunas"
								</p>
							</div>
						</div>
						<div class="flex items-start gap-4">
							<div
								class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-pink-500 text-sm font-bold"
							>
								3
							</div>
							<div>
								<h4 class="mb-1 font-semibold">Monitor & Kelola</h4>
								<p class="text-sm text-gray-400">
									Mode admin untuk mengubah status jika diperlukan, dengan audit log dan notifikasi
									email
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-20">
		<div class="mx-auto max-w-4xl text-center">
			<h2 class="mb-4 text-4xl font-bold">Siap Mulai Kelola Iuran?</h2>
			<p class="mb-8 text-xl text-pink-100">
				Bergabunglah dengan teman-teman sekamar Anda dan rasakan kemudahan mengelola iuran bersama
			</p>
			<button
				on:click={() => goto('/register')}
				class="transform rounded-xl bg-white px-8 py-4 text-lg font-semibold text-pink-600 transition-all duration-200 hover:scale-105 hover:bg-gray-100"
			>
				Daftar Gratis Sekarang
			</button>
		</div>
	</section>

	<!-- Footer -->
	<footer class="border-t border-gray-800 bg-[#0f0f0f] px-4 py-12">
		<div class="mx-auto max-w-7xl">
			<div class="flex flex-col items-center justify-between md:flex-row">
				<div class="mb-4 flex items-center space-x-3 md:mb-0">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600"
					>
						<Package class="h-5 w-5 text-white" />
					</div>
					<span class="text-xl font-bold">Bil3808ionaire</span>
				</div>
				<div class="text-center text-gray-400 md:text-right">
					<p>&copy; 2024 Bil3808ionaire. Dibuat dengan ❤️ untuk teman sekamar.</p>
					<p class="mt-1 text-sm">Powered by Supabase & SvelteKit</p>
				</div>
			</div>
		</div>
	</footer>
</div>
