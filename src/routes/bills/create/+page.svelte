<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	import { currentUser } from '$lib/stores';
	import Navbar from '$lib/components/Navbar.svelte';
	import { FileText, DollarSign, Calendar, Users, AlertCircle } from 'lucide-svelte';
	import type { User } from '$lib/types';

	let title = '';
	let description = '';
	let amount = 0;
	let deadline = '';
	let selectedMembers: string[] = [];

	let allUsers: User[] = [];
	let loading = false;
	let loadingUsers = true;
	let error = '';

	$: perPerson = selectedMembers.length > 0 ? amount / selectedMembers.length : 0;
	$: minDate = new Date().toISOString().split('T')[0];

	onMount(async () => {
		if (!$currentUser) {
			goto('/login');
			return;
		}

		await loadUsers();
	});

	async function loadUsers() {
		try {
			const { data, error: fetchError } = await supabase
				.from('users')
				.select('*')
				.order('full_name');

			if (fetchError) throw fetchError;

			if (data) {
				allUsers = data;
				// Auto-select current user
				selectedMembers = [$currentUser!.id];
			}
		} catch (err) {
			console.error('Error loading users:', err);
		} finally {
			loadingUsers = false;
		}
	}

	function toggleMember(userId: string) {
		if (selectedMembers.includes(userId)) {
			selectedMembers = selectedMembers.filter((id) => id !== userId);
		} else {
			selectedMembers = [...selectedMembers, userId];
		}
	}

	async function handleSubmit() {
		// Validation
		if (!title || !amount || !deadline) {
			error = 'Judul, total biaya, dan tenggat harus diisi';
			return;
		}

		if (amount <= 0) {
			error = 'Total biaya harus lebih dari 0';
			return;
		}

		if (selectedMembers.length === 0) {
			error = 'Pilih minimal 1 anggota';
			return;
		}

		loading = true;
		error = '';

		try {
			// Step 1: Create bill
			const { data: billData, error: billError } = await supabase
				.from('bills')
				.insert({
					creator_id: $currentUser!.id,
					title,
					description: description || null,
					amount,
					per_person: perPerson,
					deadline
				})
				.select()
				.single();

			if (billError) throw billError;

			// Step 2: Create bill members
			const membersToInsert = selectedMembers.map((memberId) => ({
				bill_id: billData.id,
				member_id: memberId,
				status: 'belum' as const
			}));

			const { error: membersError } = await supabase.from('bill_members').insert(membersToInsert);

			if (membersError) throw membersError;

			// Success - redirect to bill detail
			goto(`/bills/${billData.id}`);
		} catch (err: any) {
			error = err.message || 'Gagal membuat tagihan';
		} finally {
			loading = false;
		}
	}
</script>

<Navbar />

<div class="min-h-screen p-4 sm:p-6 lg:p-8">
	<div class="mx-auto max-w-3xl">
		<div class="mb-8">
			<h1 class="mb-2 text-3xl font-bold">Buat Tagihan Baru</h1>
			<p class="text-white/60">Masukkan detail tagihan dan pilih anggota yang terlibat</p>
		</div>

		{#if error}
			<div
				class="glass-card mb-6 flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-200"
			>
				<AlertCircle class="mt-0.5 h-5 w-5 flex-shrink-0" />
				<div>{error}</div>
			</div>
		{/if}

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<!-- Bill Details Card -->
			<div class="glass-card p-6">
				<h2 class="mb-4 flex items-center gap-2 text-xl font-semibold">
					<FileText class="h-5 w-5" />
					Detail Tagihan
				</h2>

				<div class="space-y-4">
					<div>
						<label for="title" class="mb-2 block text-sm font-medium">
							Nama Tagihan <span class="text-red-400">*</span>
						</label>
						<input
							id="title"
							type="text"
							bind:value={title}
							placeholder="Contoh: Beras Bulan November"
							class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3
                     transition-colors focus:border-primary-pink focus:outline-none"
							disabled={loading}
						/>
					</div>

					<div>
						<label for="description" class="mb-2 block text-sm font-medium">
							Deskripsi <span class="text-white/40">(Opsional)</span>
						</label>
						<textarea
							id="description"
							bind:value={description}
							placeholder="Catatan tambahan..."
							rows="3"
							class="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4
                     py-3 transition-colors focus:border-primary-pink focus:outline-none"
							disabled={loading}
						/>
					</div>

					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<label for="amount" class="mb-2 block text-sm font-medium">
								Total Biaya <span class="text-red-400">*</span>
							</label>
							<div class="relative">
								<DollarSign
									class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-white/40"
								/>
								<input
									id="amount"
									type="number"
									bind:value={amount}
									min="0"
									step="1000"
									placeholder="240000"
									class="w-full rounded-lg border border-white/10 bg-white/5 py-3 pr-4 pl-11
                         transition-colors focus:border-primary-pink focus:outline-none"
									disabled={loading}
								/>
							</div>
						</div>

						<div>
							<label for="deadline" class="mb-2 block text-sm font-medium">
								Tenggat Waktu <span class="text-red-400">*</span>
							</label>
							<div class="relative">
								<Calendar class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-white/40" />
								<input
									id="deadline"
									type="date"
									bind:value={deadline}
									min={minDate}
									class="w-full rounded-lg border border-white/10 bg-white/5 py-3 pr-4 pl-11
                         transition-colors focus:border-primary-pink focus:outline-none"
									disabled={loading}
								/>
							</div>
						</div>
					</div>

					{#if amount > 0 && selectedMembers.length > 0}
						<div class="rounded-lg border border-primary-pink/30 bg-primary-pink/10 p-4">
							<p class="text-sm text-white/80">
								Biaya per orang: <span class="text-lg font-bold text-primary-pink">
									Rp {perPerson.toLocaleString('id-ID')}
								</span>
							</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Select Members Card -->
			<div class="glass-card p-6">
				<h2 class="mb-4 flex items-center gap-2 text-xl font-semibold">
					<Users class="h-5 w-5" />
					Pilih Anggota
					<span class="ml-2 text-sm font-normal text-white/40">
						({selectedMembers.length} dipilih)
					</span>
				</h2>

				{#if loadingUsers}
					<div class="py-8 text-center text-white/60">Memuat anggota...</div>
				{:else}
					<div class="grid gap-3 sm:grid-cols-2">
						{#each allUsers as user (user.id)}
							<button
								type="button"
								on:click={() => toggleMember(user.id)}
								class="flex items-center gap-3 rounded-lg border p-3 transition-all
                       {selectedMembers.includes(user.id)
									? 'border-primary-pink bg-primary-pink/20'
									: 'border-white/10 bg-white/5 hover:border-white/30'}"
								disabled={loading}
							>
								<div
									class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-pink"
								>
									<span class="font-semibold text-primary-dark">
										{user.full_name.charAt(0)}
									</span>
								</div>
								<div class="flex-1 text-left">
									<div class="font-medium">{user.full_name}</div>
									<div class="text-xs text-white/60">{user.email}</div>
								</div>
								{#if selectedMembers.includes(user.id)}
									<div class="text-primary-pink">✓</div>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Action Buttons -->
			<div class="flex gap-3">
				<button
					type="button"
					on:click={() => goto('/dashboard')}
					class="btn-secondary flex-1"
					disabled={loading}
				>
					Batal
				</button>

				<button type="submit" class="btn-primary flex-1" disabled={loading || loadingUsers}>
					{#if loading}
						<span class="mr-2 animate-spin">⏳</span>
						Membuat...
					{:else}
						Buat Tagihan
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
