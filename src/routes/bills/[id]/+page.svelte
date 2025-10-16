<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabaseClient';
	import { currentUser } from '$lib/stores';
	import {
		formatCurrency,
		formatDate,
		daysUntilDeadline,
		isDeadlineApproaching,
		isDeadlinePassed,
		parsePaymentMethod
	} from '$lib/utils';
	import Navbar from '$lib/components/Navbar.svelte';
	import ProofUpload from '$lib/components/ProofUpload.svelte';
	import {
		Calendar,
		DollarSign,
		User as UserIcon,
		AlertCircle,
		CheckCircle,
		Clock,
		ArrowLeft
	} from 'lucide-svelte';
	import type { BillWithMembers } from '$lib/types';

	let bill: BillWithMembers | null = null;
	let loading = true;
	let error = '';

	$: billId = $page.params.id;
	$: myMembership = bill?.members.find((m) => m.member_id === $currentUser?.id);
	$: isPaid = myMembership?.status === 'lunas';
	$: isCreator = bill?.creator_id === $currentUser?.id;
	$: daysLeft = bill ? daysUntilDeadline(bill.deadline) : 0;
	$: isUrgent = bill ? isDeadlineApproaching(bill.deadline) : false;
	$: isPastDue = bill ? isDeadlinePassed(bill.deadline) : false;

	onMount(async () => {
		if (!$currentUser) {
			goto('/login');
			return;
		}

		await loadBill();
	});

	async function loadBill() {
		loading = true;
		error = '';

		try {
			const { data, error: fetchError } = await supabase
				.from('bills')
				.select(
					`
          *,
          creator:users!bills_creator_id_fkey(id, full_name, email, bank_account_1, bank_account_2, ewallet_method),
          members:bill_members(
            *,
            user:users!bill_members_member_id_fkey(id, full_name, email, bank_account_1, bank_account_2, ewallet_method)
          )
        `
				)
				.eq('id', billId as string)
				.single();

			if (fetchError) throw fetchError;

			if (data) {
				bill = data as BillWithMembers;
			}
		} catch (err: any) {
			error = err.message || 'Gagal memuat tagihan';
		} finally {
			loading = false;
		}
	}

	async function handleProofUploaded() {
		await loadBill();
	}
</script>

<Navbar />

<div class="min-h-screen p-4 sm:p-6 lg:p-8">
	<div class="mx-auto max-w-5xl">
		<!-- Back Button -->
		<button
			on:click={() => goto('/dashboard')}
			class="mb-6 flex items-center gap-2 text-white/60 transition-colors hover:text-white"
		>
			<ArrowLeft class="h-4 w-4" />
			Kembali ke Dashboard
		</button>

		{#if loading}
			<div class="flex items-center justify-center py-20">
				<div class="text-center">
					<div class="mb-4 animate-spin text-4xl">⏳</div>
					<p class="text-white/60">Memuat detail tagihan...</p>
				</div>
			</div>
		{:else if error}
			<div class="glass-card border border-red-500/50 bg-red-500/10 p-6 text-red-200">
				<AlertCircle class="mx-auto mb-3 h-8 w-8" />
				<p class="text-center">{error}</p>
			</div>
		{:else if bill}
			<!-- Bill Header -->
			<div class="glass-card mb-6 p-6">
				<div class="mb-4 flex items-start justify-between">
					<div class="flex-1">
						<h1 class="mb-2 text-3xl font-bold">{bill.title}</h1>
						{#if bill.description}
							<p class="text-white/60">{bill.description}</p>
						{/if}
					</div>

					{#if isPaid}
						<span class="badge-lunas px-4 py-2 text-base">✓ Lunas</span>
					{:else}
						<span class="badge-belum px-4 py-2 text-base">Belum Bayar</span>
					{/if}
				</div>

				<!-- Bill Info Grid -->
				<div class="mt-6 grid gap-4 sm:grid-cols-3">
					<div class="flex items-center gap-3 rounded-lg bg-white/5 p-4">
						<DollarSign class="h-8 w-8 text-primary-pink" />
						<div>
							<div class="text-sm text-white/60">Bagian Anda</div>
							<div class="text-xl font-bold">{formatCurrency(bill.per_person)}</div>
						</div>
					</div>

					<div class="flex items-center gap-3 rounded-lg bg-white/5 p-4">
						<Calendar
							class="h-8 w-8 {isPastDue
								? 'text-red-400'
								: isUrgent
									? 'text-yellow-400'
									: 'text-white/60'}"
						/>
						<div>
							<div class="text-sm text-white/60">Tenggat</div>
							<div
								class="font-semibold {isPastDue
									? 'text-red-400'
									: isUrgent
										? 'text-yellow-400'
										: ''}"
							>
								{formatDate(bill.deadline)}
							</div>
							<div class="text-xs text-white/60">
								{#if isPastDue}
									Lewat {Math.abs(daysLeft)} hari
								{:else if isUrgent}
									{daysLeft} hari lagi!
								{:else}
									{daysLeft} hari lagi
								{/if}
							</div>
						</div>
					</div>

					<div class="flex items-center gap-3 rounded-lg bg-white/5 p-4">
						<UserIcon class="h-8 w-8 text-white/60" />
						<div>
							<div class="text-sm text-white/60">Pembuat</div>
							<div class="font-semibold">{bill.creator.full_name}</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Payment Methods (if not paid) -->
			{#if !isPaid && bill.creator.id !== $currentUser?.id}
				<div class="glass-card mb-6 p-6">
					<h2 class="mb-4 text-xl font-semibold">Metode Pembayaran</h2>

					<div class="space-y-3">
						{#if bill.creator.bank_account_1}
							{@const parsed = parsePaymentMethod(bill.creator.bank_account_1)}
							{#if parsed}
								<div class="rounded-lg bg-white/5 p-4">
									<div class="mb-1 text-sm text-white/60">Bank Transfer</div>
									<div class="font-mono text-lg">{parsed.bank} - {parsed.account}</div>
									<div class="mt-1 text-sm text-white/60">a/n {bill.creator.full_name}</div>
								</div>
							{/if}
						{/if}

						{#if bill.creator.bank_account_2}
							{@const parsed = parsePaymentMethod(bill.creator.bank_account_2)}
							{#if parsed}
								<div class="rounded-lg bg-white/5 p-4">
									<div class="mb-1 text-sm text-white/60">Bank Transfer</div>
									<div class="font-mono text-lg">{parsed.bank} - {parsed.account}</div>
									<div class="mt-1 text-sm text-white/60">a/n {bill.creator.full_name}</div>
								</div>
							{/if}
						{/if}

						{#if bill.creator.ewallet_method}
							{@const parsed = parsePaymentMethod(bill.creator.ewallet_method)}
							{#if parsed}
								<div class="rounded-lg bg-white/5 p-4">
									<div class="mb-1 text-sm text-white/60">E-Wallet</div>
									<div class="font-mono text-lg">{parsed.bank} - {parsed.account}</div>
									<div class="mt-1 text-sm text-white/60">a/n {bill.creator.full_name}</div>
								</div>
							{/if}
						{/if}
					</div>
				</div>
			{/if}

			<!-- Upload Proof Section (if not paid) -->
			{#if !isPaid && myMembership}
				<ProofUpload
					billId={bill.id}
					membershipId={myMembership.id}
					on:uploaded={handleProofUploaded}
				/>
			{/if}

			<!-- Members List -->
			<div class="glass-card p-6">
				<h2 class="mb-4 text-xl font-semibold">
					Status Pembayaran Anggota ({bill.members.filter((m) => m.status === 'lunas').length}/{bill
						.members.length})
				</h2>

				<div class="space-y-3">
					{#each bill.members as member (member.id)}
						<div class="flex items-center justify-between rounded-lg bg-white/5 p-4">
							<div class="flex items-center gap-3">
								<div
									class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-pink"
								>
									<span class="font-semibold text-primary-dark">
										{member.user.full_name.charAt(0)}
									</span>
								</div>
								<div>
									<div class="font-medium">{member.user.full_name}</div>
									<div class="text-sm text-white/60">{member.user.email}</div>
									{#if member.paid_at}
										<div class="mt-1 flex items-center gap-1 text-xs text-white/40">
											<Clock class="h-3 w-3" />
											Dibayar {new Date(member.paid_at).toLocaleDateString('id-ID', {
												day: 'numeric',
												month: 'short',
												hour: '2-digit',
												minute: '2-digit'
											})}
										</div>
									{/if}
								</div>
							</div>

							<div class="flex items-center gap-3">
								<div class="text-right">
									<div class="font-semibold">{formatCurrency(bill.per_person)}</div>
								</div>

								{#if member.status === 'lunas'}
									<CheckCircle class="h-6 w-6 text-status-lunas" />
								{:else}
									<Clock class="h-6 w-6 text-status-belum" />
								{/if}
							</div>
						</div>
					{/each}
				</div>

				<!-- Total Summary -->
				<div class="mt-6 border-t border-white/10 pt-6">
					<div class="flex items-center justify-between text-lg">
						<span class="font-semibold">Total Tagihan:</span>
						<span class="text-2xl font-bold text-primary-pink">{formatCurrency(bill.amount)}</span>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
