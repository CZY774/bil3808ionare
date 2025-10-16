<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { currentUser } from '$lib/stores';
	import { NotificationManager } from '$lib/notification';
	import { Upload, X, Check, AlertCircle } from 'lucide-svelte';

	export let billId: string;
	export let memberId: string;
	export let billTitle: string = '';
	export let currentProofUrl: string | null = null;
	export let onUploadSuccess: (url: string) => void = () => {};

	let uploading = false;
	let error = '';
	let success = false;
	let fileInput: HTMLInputElement;

	const notificationManager = NotificationManager.getInstance();

	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (!file) return;

		// Validate file
		if (!file.type.startsWith('image/')) {
			error = 'Hanya file gambar yang diperbolehkan';
			return;
		}

		if (file.size > 5 * 1024 * 1024) { // 5MB limit
			error = 'Ukuran file maksimal 5MB';
			return;
		}

		uploading = true;
		error = '';
		success = false;

		try {
			const fileExt = file.name.split('.').pop();
			const fileName = `${$currentUser!.id}/${billId}_${Date.now()}.${fileExt}`;

			// Upload to Supabase Storage
			const { data: uploadData, error: uploadError } = await supabase.storage
				.from('proofs')
				.upload(fileName, file);

			if (uploadError) throw uploadError;

			// Update bill_members with proof URL
			const { error: updateError } = await supabase
				.from('bill_members')
				.update({ 
					proof_url: fileName,
					status: 'lunas'
				})
				.eq('bill_id', billId)
				.eq('member_id', memberId);

			if (updateError) throw updateError;

			success = true;
			onUploadSuccess(fileName);
			
			// Show notification
			if (billTitle) {
				await notificationManager.showPaymentConfirmation(billTitle);
			}
			
		} catch (err: any) {
			error = err.message || 'Upload gagal';
		} finally {
			uploading = false;
		}
	}

	async function removeProof() {
		if (!currentProofUrl) return;

		uploading = true;
		error = '';

		try {
			// Delete from storage
			const { error: deleteError } = await supabase.storage
				.from('proofs')
				.remove([currentProofUrl]);

			if (deleteError) throw deleteError;

			// Update bill_members
			const { error: updateError } = await supabase
				.from('bill_members')
				.update({ 
					proof_url: null,
					status: 'belum'
				})
				.eq('bill_id', billId)
				.eq('member_id', memberId);

			if (updateError) throw updateError;

			currentProofUrl = null;
			success = false;
			
		} catch (err: any) {
			error = err.message || 'Hapus bukti gagal';
		} finally {
			uploading = false;
		}
	}
</script>

<div class="space-y-4">
	{#if currentProofUrl}
		<div class="glass-card p-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2 text-status-lunas">
					<Check class="h-5 w-5" />
					<span class="font-medium">Bukti pembayaran sudah diupload</span>
				</div>
				<button
					on:click={removeProof}
					class="text-red-400 hover:text-red-300"
					disabled={uploading}
				>
					<X class="h-5 w-5" />
				</button>
			</div>
		</div>
	{:else}
		<div class="glass-card p-6">
			<div class="text-center">
				<div class="mb-4">
					<Upload class="mx-auto h-12 w-12 text-white/40" />
				</div>
				
				<h3 class="mb-2 text-lg font-semibold">Upload Bukti Pembayaran</h3>
				<p class="mb-4 text-sm text-white/60">
					Upload foto transfer atau bukti pembayaran lainnya
				</p>

				<input
					bind:this={fileInput}
					type="file"
					accept="image/*"
					on:change={handleFileUpload}
					class="hidden"
					disabled={uploading}
				/>

				<button
					on:click={() => fileInput.click()}
					class="btn-primary"
					disabled={uploading}
				>
					{#if uploading}
						<span class="animate-spin">⏳</span>
						Mengupload...
					{:else}
						<Upload class="mr-2 h-5 w-5" />
						Pilih File
					{/if}
				</button>

				<p class="mt-2 text-xs text-white/40">
					Format: JPG, PNG, WebP. Maksimal 5MB
				</p>
			</div>
		</div>
	{/if}

	{#if error}
		<div class="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-red-200">
			<AlertCircle class="h-5 w-5" />
			<span class="text-sm">{error}</span>
		</div>
	{/if}

	{#if success}
		<div class="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-green-200">
			<Check class="h-5 w-5" />
			<span class="text-sm">Bukti pembayaran berhasil diupload!</span>
		</div>
	{/if}
</div>
