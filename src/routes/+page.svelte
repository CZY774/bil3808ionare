<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores';
	import { DollarSign, Users, Shield, Bell } from 'lucide-svelte';

	onMount(() => {
		// Redirect to dashboard if already logged in
		if ($currentUser) {
			goto('/dashboard');
		}
	});
</script>

<div class="flex min-h-screen flex-col">
	<!-- Hero Section -->
	<div class="flex flex-1 items-center justify-center p-6">
		<div class="mx-auto max-w-5xl text-center">
			<div class="mb-8">
				<div
					class="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-lg bg-primary-pink"
				>
					<span class="text-2xl font-bold text-primary-dark">B</span>
				</div>
			</div>

			<h1 class="mb-4 text-3xl font-extrabold sm:text-4xl">Bayar tagihan bersama jadi mudah</h1>

			<p class="mx-auto mb-6 max-w-2xl text-sm text-white/70">
				Bil3808ionaire membantu kamu membuat, membagi, dan melacak tagihan kelompok dengan cepat —
				tanpa ribet. Undang teman, tetapkan tenggat, dan lihat siapa yang sudah membayar dalam satu
				tempat.
			</p>

			<div class="flex items-center justify-center gap-3">
				<button class="btn-primary" on:click={() => goto('/register')}>Daftar Sekarang</button>
				<button class="btn-secondary" on:click={() => goto('/login')}>Masuk</button>
			</div>

			<!-- Quick stats / trust row -->
			<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div class="glass-card p-4 text-left">
					<div class="flex items-center gap-3">
						<DollarSign class="h-6 w-6 text-white/80" />
						<div>
							<div class="text-lg font-semibold">Mudah Kelola</div>
							<div class="text-xs text-white/60">Buat tagihan dan bagi per orang otomatis</div>
						</div>
					</div>
				</div>

				<div class="glass-card p-4 text-left">
					<div class="flex items-center gap-3">
						<Users class="h-6 w-6 text-white/80" />
						<div>
							<div class="text-lg font-semibold">Undang Teman</div>
							<div class="text-xs text-white/60">
								Tambahkan anggota lewat email dan lihat status pembayaran
							</div>
						</div>
					</div>
				</div>

				<div class="glass-card p-4 text-left">
					<div class="flex items-center gap-3">
						<Shield class="h-6 w-6 text-white/80" />
						<div>
							<div class="text-lg font-semibold">Aman &amp; Terpercaya</div>
							<div class="text-xs text-white/60">Kontrol akses dan proteksi data pengguna</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Features / How it works -->
	<section class="py-12">
		<div class="mx-auto max-w-5xl px-6">
			<h2 class="mb-6 text-center text-2xl font-bold">Cara Kerja</h2>

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
				<div class="glass-card p-6 text-left">
					<div class="mb-2 text-lg font-semibold">Buat Tagihan</div>
					<p class="text-sm text-white/60">
						Masukkan judul, jumlah, dan tenggat. Aplikasi akan menghitung pembagian otomatis.
					</p>
				</div>

				<div class="glass-card p-6 text-left">
					<div class="mb-2 text-lg font-semibold">Undang Anggota</div>
					<p class="text-sm text-white/60">
						Tambahkan anggota lewat email — mereka akan mendapat notifikasi dan link pembayaran.
					</p>
				</div>

				<div class="glass-card p-6 text-left">
					<div class="mb-2 text-lg font-semibold">Lacak & Konfirmasi</div>
					<p class="text-sm text-white/60">
						Lihat siapa yang sudah membayar, kirim pengingat, dan tandai lunas saat selesai.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA / Footer -->
	<footer class="py-8">
		<div class="mx-auto max-w-5xl px-6 text-center">
			<div class="mb-6">
				<div class="text-xl font-semibold">Siap memulai?</div>
				<div class="text-sm text-white/60">
					Daftar sekarang dan coba fitur lengkap secara gratis.
				</div>
			</div>

			<div class="flex items-center justify-center gap-3">
				<button class="btn-primary" on:click={() => goto('/register')}>Daftar Gratis</button>
				<button class="btn-secondary" on:click={() => goto('/bills/create')}>Buat Tagihan</button>
			</div>

			<div class="mt-8 text-xs text-white/50">
				© {new Date().getFullYear()} Bil3808ionaire — dibuat dengan ♥
			</div>
		</div>
	</footer>
</div>
