<script lang="ts">
	import { onMount } from 'svelte';
	import { NotificationManager } from '$lib/notification';
	import { Bell, BellOff } from 'lucide-svelte';

	export let enabled = false;
	export let onToggle: (enabled: boolean) => void = () => {};

	let notificationManager: NotificationManager;
	let permissionStatus: NotificationPermission = 'default';

	onMount(() => {
		notificationManager = NotificationManager.getInstance();
		permissionStatus = Notification.permission;
		
		// Check if notifications are already enabled
		enabled = permissionStatus === 'granted';
	});

	async function toggleReminder() {
		if (!enabled) {
			// Request permission and enable
			const granted = await notificationManager.requestPermission();
			if (granted) {
				enabled = true;
				permissionStatus = 'granted';
				onToggle(true);
				
				// Show test notification
				await notificationManager.showNotification('Reminder Aktif!', {
					body: 'Kamu akan mendapat notifikasi untuk tagihan yang akan jatuh tempo.',
					tag: 'reminder-enabled'
				});
			}
		} else {
			// Disable (note: can't revoke permission, just disable in app)
			enabled = false;
			onToggle(false);
		}
	}

	function getStatusText(): string {
		switch (permissionStatus) {
			case 'granted':
				return enabled ? 'Aktif' : 'Nonaktif';
			case 'denied':
				return 'Ditolak';
			default:
				return 'Belum diatur';
		}
	}

	function getStatusColor(): string {
		switch (permissionStatus) {
			case 'granted':
				return enabled ? 'text-green-600' : 'text-gray-600';
			case 'denied':
				return 'text-red-600';
			default:
				return 'text-yellow-600';
		}
	}
</script>

<div class="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
	<div class="flex items-center space-x-3">
		<div class="p-2 bg-blue-100 rounded-lg">
			{#if enabled}
				<Bell class="w-5 h-5 text-blue-600" />
			{:else}
				<BellOff class="w-5 h-5 text-gray-600" />
			{/if}
		</div>
		
		<div>
			<h3 class="font-medium text-gray-900">Reminder Notifikasi</h3>
			<p class="text-sm text-gray-500">
				Dapatkan notifikasi untuk tagihan yang akan jatuh tempo
			</p>
		</div>
	</div>

	<div class="flex items-center space-x-3">
		<span class="text-sm font-medium {getStatusColor()}">
			{getStatusText()}
		</span>
		
		<button
			on:click={toggleReminder}
			disabled={permissionStatus === 'denied'}
			class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed {enabled ? 'bg-blue-600' : 'bg-gray-200'}"
		>
			<span
				class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {enabled ? 'translate-x-6' : 'translate-x-1'}"
			/>
		</button>
	</div>
</div>

{#if permissionStatus === 'denied'}
	<div class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
		<p class="text-sm text-red-700">
			<strong>Notifikasi ditolak.</strong> 
			Untuk mengaktifkan, buka pengaturan browser dan izinkan notifikasi untuk situs ini.
		</p>
	</div>
{:else if permissionStatus === 'default'}
	<div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
		<p class="text-sm text-yellow-700">
			Klik tombol di atas untuk mengaktifkan reminder notifikasi.
		</p>
	</div>
{/if}
