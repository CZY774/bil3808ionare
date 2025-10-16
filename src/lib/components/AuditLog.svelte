<script lang="ts">
	import { formatDate } from '$lib/utils';
	import { Clock, User, FileText } from 'lucide-svelte';
	import type { AuditLogWithDetails } from '$lib/types';

	export let logs: AuditLogWithDetails[];

	function getActionLabel(log: AuditLogWithDetails): string {
		if (log.action === 'status_change') {
			const memberName = log.member?.full_name || 'Unknown';
			return `Mengubah status ${memberName}: ${log.old_value} → ${log.new_value}`;
		}
		return log.action;
	}
</script>

{#if logs.length === 0}
	<p class="py-8 text-center text-white/60">Belum ada aktivitas</p>
{:else}
	<div class="space-y-3">
		{#each logs as log (log.id)}
			<div class="flex gap-4 rounded-lg bg-white/5 p-4 transition-colors hover:bg-white/10">
				<div class="flex-shrink-0">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-pink/20">
						{#if log.action === 'status_change'}
							<FileText class="h-5 w-5 text-primary-pink" />
						{:else}
							<User class="h-5 w-5 text-primary-pink" />
						{/if}
					</div>
				</div>

				<div class="min-w-0 flex-1">
					<div class="flex items-start justify-between gap-4">
						<div class="flex-1">
							<p class="mb-1 font-medium">{getActionLabel(log)}</p>
							<div class="flex flex-wrap items-center gap-3 text-sm text-white/60">
								<span class="flex items-center gap-1">
									<User class="h-3 w-3" />
									{log.actor.full_name}
								</span>
								<span class="flex items-center gap-1">
									<FileText class="h-3 w-3" />
									{log.bill.title}
								</span>
							</div>
						</div>

						<div class="flex items-center gap-1 text-xs whitespace-nowrap text-white/40">
							<Clock class="h-3 w-3" />
							{new Date(log.timestamp).toLocaleString('id-ID', {
								day: '2-digit',
								month: 'short',
								hour: '2-digit',
								minute: '2-digit'
							})}
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
