<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { currentUser } from '$lib/stores';
	import { generateProofPath, isValidImage } from '$lib/utils';
	import { Upload, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-svelte';

	export let billId: string;
	export let membershipId: string;

	const dispatch = createEventDispatcher();

	let uploading = false;
	let error = '';
	let success = false;
	let selectedFile: File | null = null;
	let previewUrl: string | null = null;
	let dragOver = false;

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			processFile(input.files[0]);
		}
	}

	function handleDrop(event: DragEvent) {
		dragOver = false;
		event.preventDefault();

		if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
			processFile(event.dataTransfer.files[0]);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}

	function processFile(file: File) {
		error = '';

		if (!isValidImage(file)) {
			error = 'File harus berupa gambar (JPG, PNG, WEBP) dan maksimal 5MB';
			selectedFile = null;
			previewUrl = null;
			return;
		}

		selectedFile = file;

		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			previewUrl = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	async function handleUpload() {
		if (!selectedFile || !$currentUser) return;

		uploading = true;
		error = '';
		success = false;

		try {
			// Step 1: Upload to storage
			const filePath = generateProofPath($currentUser.id, billId, selectedFile.name);

			const { error: uploadError } = await supabase.storage
				.from('proofs')
				.upload(filePath, selectedFile, {
					cacheControl: '3600',
					upsert: false
				});

			if (uploadError) throw uploadError;

			// Step 2: Update bill_members with proof_url and status
			const { error: updateError } = await supabase
				.from('bill_members')
				.update({
					proof_url: filePath,
					status: 'lunas'
				})
				.eq('id', membershipId);

			if (updateError) throw updateError;

			success = true;

			// Dispatch event to parent
			setTimeout(() => {
				dispatch('uploaded');
			}, 1500);
		} catch (err: any) {
			error = err.message || 'Gagal upload bukti pembayaran';
		} finally {
			uploading = false;
		}
	}

	function clearSelection() {
		selectedFile = null;
		previewUrl = null;
		error = '';
		success = false;
	}
</script>

<div class="glass-card mb-6 p-6">
	<h2 class="mb-4 flex items-center gap-2 text-xl font-semibold">
		<Upload class="h-5 w-5" />
		Upload Bukti Pembayaran
	</h2>

	{#if success}
		<div
			class="flex items-center gap-3 rounded-lg border border-status-lunas/50 bg-status-lunas/10 p-4 text-status-lunas"
		>
			<CheckCircle class="h-6 w-6 flex-shrink-0" />
			<div>
				<div class="font-semibold">Bukti pembayaran berhasil diupload!</div>
				<div class="text-sm opacity-80">Status Anda otomatis diubah menjadi "Lunas"</div>
			</div>
		</div>
	{:else}
		{#if error}
			<div
				class="mb-4 flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-200"
			>
				<AlertCircle class="mt-0.5 h-5 w-5 flex-shrink-0" />
				<div>{error}</div>
			</div>
		{/if}

		{#if !selectedFile}
			<!-- Upload Area -->
			<div
				class="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
               {dragOver
					? 'border-primary-pink bg-primary-pink/10'
					: 'border-white/20 hover:border-white/40'}"
				on:drop={handleDrop}
				on:dragover={handleDragOver}
				on:dragleave={handleDragLeave}
				role="button"
				tabindex="0"
			>
				<input
					type="file"
					id="proof-upload"
					accept="image/jpeg,image/jpg,image/png,image/webp"
					on:change={handleFileSelect}
					class="hidden"
					disabled={uploading}
				/>

				<label for="proof-upload" class="cursor-pointer">
					<ImageIcon class="mx-auto mb-4 h-16 w-16 text-white/40" />
					<p class="mb-2 text-lg font-medium">Upload Bukti Transfer</p>
					<p class="mb-4 text-sm text-white/60">Drag and drop atau klik untuk memilih file</p>
					<button
						type="button"
						class="btn-primary inline-flex"
						on:click|preventDefault={() => document.getElementById('proof-upload')?.click()}
					>
						Pilih File
					</button>
					<p class="mt-3 text-xs text-white/40">Format: JPG, PNG, WEBP (Maks. 5MB)</p>
				</label>
			</div>
		{:else}
			<!-- Preview & Upload -->
			<div class="space-y-4">
				<div class="relative">
					<img
						src={previewUrl}
						alt="Preview bukti pembayaran"
						class="max-h-96 w-full rounded-lg bg-black/50 object-contain"
					/>
					<button
						type="button"
						on:click={clearSelection}
						class="absolute top-2 right-2 rounded-lg bg-red-500 p-2 transition-colors hover:bg-red-600"
						disabled={uploading}
					>
						✕
					</button>
				</div>

				<div class="rounded-lg bg-white/5 p-4">
					<div class="mb-2 flex items-center justify-between">
						<span class="text-sm text-white/60">File:</span>
						<span class="font-medium">{selectedFile.name}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-white/60">Ukuran:</span>
						<span class="font-medium">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
					</div>
				</div>

				<button
					type="button"
					on:click={handleUpload}
					class="btn-primary w-full"
					disabled={uploading}
				>
					{#if uploading}
						<span class="mr-2 animate-spin">⏳</span>
						Mengupload...
					{:else}
						<Upload class="mr-2 inline h-5 w-5" />
						Upload & Tandai Lunas
					{/if}
				</button>
			</div>
		{/if}
	{/if}
</div>
