<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	import { currentUser, userProfile, bills } from '$lib/stores';
	import {
		formatCurrency,
		formatDateShort,
		daysUntilDeadline,
		isDeadlineApproaching
	} from '$lib/utils';
	import Navbar from '$lib/components/Navbar.svelte';
	import BillCard from '$lib/components/BillCard.svelte';
	import { Plus, AlertCircle, Shield } from 'lucide-svelte';
	import type { BillWithMembers } from '$lib/types';

	let loading = true;
	let myBills: BillWithMembers[] = [];
	let unpaidBills: BillWithMembers[] = [];
	let paidBills: BillWithMembers[] = [];

	onMount(async () => {
		if (!$currentUser) {
			goto('/login');
			return;
		}

		await loadBills();
	});

	async function loadBills() {
		loading = true;

		try {
			// Fetch bills where user is creator or member
			const { data: billsData, error } = await supabase
				.from('bills')
				.select(
					`
          *,
          creator:users!bills_creator_id_fkey(id, full_name, email),
          members:bill_members(
            *,
            user:users!bill_members_member_id_fkey(id, full_name, email)
          )
        `
				)
				.or(`creator_id.eq.${$currentUser!.id},members.member_id.eq.${$currentUser!.id}`)
				.order('deadline', { ascending: true });

			if (error) throw error;

			if (billsData) {
				myBills = billsData as BillWithMembers[];
				bills.set(myBills);

				// Separate paid and unpaid bills
				unpaidBills = myBills.filter((bill) =>
					bill.members.some((m) => m.member_id === $currentUser!.id && m.status === 'belum')
				);

				paidBills = myBills.filter((bill) =>
					bill.members.every((m) => m.member_id !== $currentUser!.id || m.status === 'lunas')
				);
			}
		} catch (err) {
			console.error('Error loading bills:', err);
		} finally {
			loading = false;
		}
	}
</script>

<Navbar />

<div class="min-h-screen p-4 sm:p-6 lg:p-8">
	<div class="mx-auto max-w-7xl">
		<!-- Header -->
		<div class="mb-8 flex items-center justify-between">
			<div>
				<h1 class="mb-2 text-3xl font-bold">Dashboard</h1>
				<p class="text-white/60">
					Selamat datang kembali, <span class="text-primary-pink">{$userProfile?.full_name}</span>!
				</p>
			</div>

			<div class="flex items-center gap-3">
				<button 
					on:click={() => goto('/admin')} 
					class="btn-secondary flex items-center gap-2"
					title="Masuk Mode Admin"
				>
					<Shield class="h-5 w-5" />
					<span class="hidden sm:inline">Mode Admin</span>
				</button>
				
				<button on:click={() => goto('/bills/create')} class="btn-primary flex items-center gap-2">
					<Plus class="h-5 w-5" />
					<span class="hidden sm:inline">Buat Tagihan Baru</span>
				</button>
			</div>
		</div>

		{#if loading}
			<div class="flex items-center justify-center py-20">
				<div class="text-center">
					<div class="mb-4 animate-spin text-4xl">⏳</div>
					<p class="text-white/60">Memuat tagihan...</p>
				</div>
			</div>
		{:else if myBills.length === 0}
			<div class="glass-card p-12 text-center">
				<div class="mb-4 text-6xl">📋</div>
				<h2 class="mb-2 text-xl font-semibold">Belum Ada Tagihan</h2>
				<p class="mb-6 text-white/60">Mulai dengan membuat tagihan pertama Anda</p>
				<button on:click={() => goto('/bills/create')} class="btn-primary">
					<Plus class="mr-2 inline h-5 w-5" />
					Buat Tagihan Baru
				</button>
			</div>
		{:else}
			<!-- Unpaid Bills Section -->
			{#if unpaidBills.length > 0}
				<section class="mb-8">
					<div class="mb-4 flex items-center gap-2">
						<AlertCircle class="h-5 w-5 text-status-belum" />
						<h2 class="text-xl font-semibold">Tagihan Belum Lunas ({unpaidBills.length})</h2>
					</div>

					<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each unpaidBills as bill (bill.id)}
							<BillCard {bill} />
						{/each}
					</div>
				</section>
			{/if}

			<!-- All Bills Section -->
			<section>
				<h2 class="mb-4 text-xl font-semibold">Semua Tagihan ({myBills.length})</h2>

				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each myBills as bill (bill.id)}
						<BillCard {bill} />
					{/each}
				</div>
			</section>
		{/if}
	</div>
</div>
