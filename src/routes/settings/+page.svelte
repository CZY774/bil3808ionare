<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser, userProfile } from '$lib/stores';
	import { supabase } from '$lib/supabaseClient';
	import Navbar from '$lib/components/Navbar.svelte';
	import { Bell, Mail, Smartphone, Save, AlertCircle, CheckCircle } from 'lucide-svelte';

	let loading = false;
	let success = false;
	let error = '';

	// Notification preferences (stored in browser localStorage)
	let emailReminders = true;
	let weeklyEmail = false;
	let browserNotifications = true;
	let newBillNotif = true;
	let paymentNotif = true;

	// PWA notification permission
	let notificationPermission: NotificationPermission = 'default';

	onMount(() => {
		if (!$currentUser) {
			goto('/login');
			return;
		}

		loadPreferences();
		checkNotificationPermission();
	});

	function loadPreferences() {
		const saved = localStorage.getItem('notification_preferences');
		if (saved) {
			const prefs = JSON.parse(saved);
			emailReminders = prefs.emailReminders ?? true;
			weeklyEmail = prefs.weeklyEmail ?? false;
			browserNotifications = prefs.browserNotifications ?? true;
			newBillNotif = prefs.newBillNotif ?? true;
			paymentNotif = prefs.paymentNotif ?? true;
		}
	}

	function checkNotificationPermission() {
		if ('Notification' in window) {
			notificationPermission = Notification.permission;
		}
	}

	async function requestNotificationPermission() {
		if ('Notification' in window) {
			const permission = await Notification.requestPermission();
			notificationPermission = permission;

			if (permission === 'granted') {
				new Notification('Bil3808ionaire', {
					body: 'Notifikasi browser berhasil diaktifkan!',
					icon: '/favicon.png'
				});
			}
		}
	}

	function savePreferences() {
		loading = true;
		error = '';
		success = false;

		try {
			const prefs = {
				emailReminders,
				weeklyEmail,
				browserNotifications,
				newBillNotif,
				paymentNotif
			};

			localStorage.setItem('notification_preferences', JSON.stringify(prefs));

			success = true;
			setTimeout(() => (success = false), 3000);
		} catch (err: any) {
			error = 'Gagal menyimpan pengaturan';
		} finally {
			loading = false;
		}
	}
</script>

<Navbar />

<div class="min-h-screen p-4 sm:p-6 lg:p-8">
	<div class="mx-auto max-w-3xl">
		<div class="mb-8">
			<h1 class="mb-2 text-3xl font-bold">Pengaturan Notifikasi</h1>
			<p class="text-white/60">Kelola preferensi notifikasi dan pengingat</p>
		</div>

		{#if success}
			<div
				class="glass-card mb-6 flex items-center gap-3 rounded-lg border border-status-lunas/50 bg-status-lunas/10 px-4 py-3 text-status-lunas"
			>
				<CheckCircle class="h-5 w-5" />
				<span>Pengaturan berhasil disimpan!</span>
			</div>
		{/if}

		{#if error}
			<div
				class="glass-card mb-6 flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-200"
			>
				<AlertCircle class="mt-0.5 h-5 w-5 flex-shrink-0" />
				<div>{error}</div>
			</div>
		{/if}

		<!-- Email Reminders -->
		<div class="glass-card mb-6 p-6">
			<div class="mb-4 flex items-center gap-3">
				<Mail class="h-6 w-6 text-primary-pink" />
				<h2 class="text-xl font-semibold">Email Reminders</h2>
			</div>

			<div class="space-y-4">
				<label
					class="flex cursor-pointer items-center justify-between rounded-lg bg-white/5 p-4 transition-colors hover:bg-white/10"
				>
					<div class="flex-1">
						<div class="font-medium">Pengingat Tagihan</div>
						<div class="text-sm text-white/60">Kirim email 24 jam sebelum deadline</div>
					</div>
					<input
						type="checkbox"
						bind:checked={emailReminders}
						class="h-5 w-5 rounded accent-primary-pink"
					/>
				</label>

				<label
					class="flex cursor-pointer items-center justify-between rounded-lg bg-white/5 p-4 transition-colors hover:bg-white/10"
				>
					<div class="flex-1">
						<div class="font-medium">Ringkasan Mingguan</div>
						<div class="text-sm text-white/60">
							Kirim email ringkasan tagihan belum lunas setiap minggu
						</div>
					</div>
					<input
						type="checkbox"
						bind:checked={weeklyEmail}
						class="h-5 w-5 rounded accent-primary-pink"
					/>
				</label>
			</div>
		</div>

		<!-- App Notifications -->
		<div class="glass-card mb-6 p-6">
			<div class="mb-4 flex items-center gap-3">
				<Smartphone class="h-6 w-6 text-primary-pink" />
				<h2 class="text-xl font-semibold">Notifikasi Aplikasi</h2>
			</div>

			{#if notificationPermission === 'default'}
				<div
					class="mb-4 flex items-start gap-3 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-yellow-200"
				>
					<Bell class="mt-0.5 h-5 w-5 flex-shrink-0" />
					<div class="flex-1">
						<div class="mb-2 font-medium">Izinkan Notifikasi Browser</div>
						<button on:click={requestNotificationPermission} class="btn-primary text-sm">
							Aktifkan Notifikasi
						</button>
					</div>
				</div>
			{:else if notificationPermission === 'denied'}
				<div class="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-200">
					<p class="text-sm">
						Notifikasi browser diblokir. Ubah pengaturan browser Anda untuk mengaktifkan.
					</p>
				</div>
			{:else}
				<div
					class="mb-4 flex items-center gap-3 rounded-lg border border-status-lunas/50 bg-status-lunas/10 p-4 text-status-lunas"
				>
					<CheckCircle class="h-5 w-5" />
					<span class="text-sm">Notifikasi browser aktif</span>
				</div>
			{/if}

			<div class="space-y-4">
				<label
					class="flex cursor-pointer items-center justify-between rounded-lg bg-white/5 p-4 transition-colors hover:bg-white/10"
				>
					<div class="flex-1">
						<div class="font-medium">Tagihan Baru</div>
						<div class="text-sm text-white/60">Notifikasi saat ada tagihan baru ditambahkan</div>
					</div>
					<input
						type="checkbox"
						bind:checked={newBillNotif}
						class="h-5 w-5 rounded accent-primary-pink"
						disabled={notificationPermission !== 'granted'}
					/>
				</label>

				<label
					class="flex cursor-pointer items-center justify-between rounded-lg bg-white/5 p-4 transition-colors hover:bg-white/10"
				>
					<div class="flex-1">
						<div class="font-medium">Pembayaran</div>
						<div class="text-sm text-white/60">
							Notifikasi saat ada yang membayar atau mengubah status
						</div>
					</div>
					<input
						type="checkbox"
						bind:checked={paymentNotif}
						class="h-5 w-5 rounded accent-primary-pink"
						disabled={notificationPermission !== 'granted'}
					/>
				</label>
			</div>
		</div>

		<!-- Save Button -->
		<button
			on:click={savePreferences}
			class="btn-primary flex w-full items-center justify-center gap-2"
			disabled={loading}
		>
			{#if loading}
				<span class="animate-spin">⏳</span>
				Menyimpan...
			{:else}
				<Save class="h-5 w-5" />
				Simpan Pengaturan
			{/if}
		</button>
	</div>
</div>
