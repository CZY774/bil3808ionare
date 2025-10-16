<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores';
	import {
		formatCurrency,
		formatDateShort,
		daysUntilDeadline,
		isDeadlineApproaching,
		isDeadlinePassed
	} from '$lib/utils';
	import { Calendar, DollarSign, Users, AlertTriangle } from 'lucide-svelte';
	import type { BillWithMembers } from '$lib/types';

	export let bill: BillWithMembers;

	$: myMembership = bill.members.find((m) => m.member_id === $currentUser?.id);
	$: isPaid = myMembership?.status === 'lunas';
	$: paidCount = bill.members.filter((m) => m.status === 'lunas').length;
	$: totalMembers = bill.members.length;
	$: daysLeft = daysUntilDeadline(bill.deadline);
	$: isUrgent = isDeadlineApproaching(bill.deadline);
	$: isPastDue = isDeadlinePassed(bill.deadline);
</script>

<button
	on:click={() => goto(`/bills/${bill.id}`)}
	class="glass-card group cursor-pointer p-6 text-left transition-all hover:bg-white/10"
>
	<!-- Header -->
	<div class="mb-4 flex items-start justify-between">
		<div class="flex-1">
			<h3 class="mb-1 text-lg font-semibold transition-colors group-hover:text-primary-pink">
				{bill.title}
			</h3>
			{#if bill.description}
				<p class="line-clamp-2 text-sm text-white/60">{bill.description}</p>
			{/if}
		</div>

		<div class="ml-3">
			{#if isPaid}
				<span class="badge-lunas">Lunas</span>
			{:else}
				<span class="badge-belum">Belum</span>
			{/if}
		</div>
	</div>

	<!-- Amount -->
	<div class="mb-3 flex items-center gap-2">
		<DollarSign class="h-4 w-4 text-white/40" />
		<div>
			<div class="text-2xl font-bold text-primary-pink">
				{formatCurrency(bill.per_person)}
			</div>
			<div class="text-xs text-white/60">
				Total: {formatCurrency(bill.amount)}
			</div>
		</div>
	</div>

	<!-- Deadline -->
	<div class="mb-3 flex items-center gap-2 text-sm">
		<Calendar class="h-4 w-4 text-white/40" />
		<span class={isPastDue ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-white/60'}>
			{formatDateShort(bill.deadline)}
			{#if isPastDue}
				(Lewat {Math.abs(daysLeft)} hari)
			{:else if isUrgent}
				(Segera!)
			{:else}
				({daysLeft} hari lagi)
			{/if}
		</span>
	</div>

	<!-- Members Progress -->
	<div class="flex items-center justify-between text-sm">
		<div class="flex items-center gap-2 text-white/60">
			<Users class="h-4 w-4" />
			<span>{paidCount}/{totalMembers} sudah bayar</span>
		</div>

		{#if !isPaid && isUrgent}
			<AlertTriangle class="h-4 w-4 text-yellow-400" />
		{/if}
	</div>

	<!-- Progress Bar -->
	<div class="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
		<div
			class="h-full bg-status-lunas transition-all duration-500"
			style="width: {(paidCount / totalMembers) * 100}%"
		></div>
	</div>
</button>
