<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { isAdminMode } from '$lib/stores';
	import { Shield, Mail, Key, Users, FileText } from 'lucide-svelte';
	import AuditLog from '$lib/components/AuditLog.svelte';
	import type { BillWithMembers, AuditLogWithDetails } from '$lib/types';

	let adminEmail = '';
	let otpCode = '';
	let step: 'email' | 'otp' | 'dashboard' = 'email';
	let loading = false;
	let error = '';
	let bills: BillWithMembers[] = [];
	let auditLogs: AuditLogWithDetails[] = [];

	onMount(() => {
		if ($isAdminMode) {
			step = 'dashboard';
			loadAdminData();
		}
	});

	async function sendOTP() {
		if (!adminEmail) {
			error = 'Email harus diisi';
			return;
		}

		loading = true;
		error = '';

		try {
			const { error: otpError } = await supabase.auth.signInWithOtp({
				email: adminEmail
			});

			if (otpError) throw otpError;

			step = 'otp';
		} catch (err: any) {
			error = err.message || 'Gagal mengirim OTP';
		} finally {
			loading = false;
		}
	}

	async function verifyOTP() {
		if (!otpCode) {
			error = 'Kode OTP harus diisi';
			return;
		}

		loading = true;
		error = '';

		try {
			const { data, error: verifyError } = await supabase.auth.verifyOtp({
				email: adminEmail,
				token: otpCode,
				type: 'email'
			});

			if (verifyError) throw verifyError;

			isAdminMode.set(true);
			step = 'dashboard';
			await loadAdminData();
		} catch (err: any) {
			error = err.message || 'Kode OTP tidak valid';
		} finally {
			loading = false;
		}
	}

	async function loadAdminData() {
		try {
			// Load all bills
			const { data: billsData, error: billsError } = await supabase
				.from('bills')
				.select(`
					*,
					creator:users!bills_creator_id_fkey(*),
					members:bill_members(
						*,
						user:users!bill_members_member_id_fkey(*)
					)
				`)
				.order('created_at', { ascending: false });

			if (billsError) throw billsError;
			bills = (billsData || []).map(bill => ({
				...bill,
				members: bill.members.map(member => ({
					...member,
					status: member.status as 'lunas' | 'belum'
				}))
			}));

			// Load audit logs
			const { data: logsData, error: logsError } = await supabase
				.from('audit_logs')
				.select(`
					*,
					actor:users!audit_logs_actor_id_fkey(*),
					bill:bills!audit_logs_bill_id_fkey(id, title),
					member:users!audit_logs_member_id_fkey(*)
				`)
				.order('timestamp', { ascending: false })
				.limit(50);

			if (logsError) throw logsError;
			auditLogs = logsData || [];
		} catch (err) {
			console.error('Error loading admin data:', err);
		}
	}

	async function updateMemberStatus(billId: string, memberId: string, newStatus: 'lunas' | 'belum') {
		loading = true;
		error = '';

		try {
			const { error: updateError } = await supabase
				.from('bill_members')
				.update({ status: newStatus })
				.eq('bill_id', billId)
				.eq('member_id', memberId);

			if (updateError) throw updateError;

			await loadAdminData(); // Refresh data
		} catch (err: any) {
			error = err.message || 'Gagal mengubah status';
		} finally {
			loading = false;
		}
	}

	function exitAdminMode() {
		isAdminMode.set(false);
		step = 'email';
		adminEmail = '';
		otpCode = '';
		bills = [];
		auditLogs = [];
	}
</script>

<div class="min-h-screen p-4 sm:p-6 lg:p-8">
	<div class="mx-auto max-w-6xl">
		{#if step === 'email'}
			<div class="flex min-h-screen items-center justify-center">
				<div class="glass-card w-full max-w-md p-8">
					<div class="mb-8 text-center">
						<Shield class="mx-auto mb-4 h-16 w-16 text-primary-pink" />
						<h1 class="mb-2 text-3xl font-bold">Mode Admin</h1>
						<p class="text-white/60">Masukkan email admin untuk verifikasi</p>
					</div>

					{#if error}
						<div class="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-200">
							{error}
						</div>
					{/if}

					<form on:submit|preventDefault={sendOTP} class="space-y-4">
						<div>
							<label for="adminEmail" class="mb-2 block text-sm font-medium">Email Admin</label>
							<div class="relative">
								<Mail class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-white/40" />
								<input
									id="adminEmail"
									type="email"
									bind:value={adminEmail}
									placeholder="admin@email.com"
									class="w-full rounded-lg border border-white/10 bg-white/5 py-3 pr-4 pl-11
									transition-colors focus:border-primary-pink focus:outline-none"
									disabled={loading}
								/>
							</div>
						</div>

						<button type="submit" class="btn-primary w-full" disabled={loading}>
							{#if loading}
								<span class="animate-spin">⏳</span>
								Mengirim OTP...
							{:else}
								Kirim Kode OTP
							{/if}
						</button>
					</form>
				</div>
			</div>
		{:else if step === 'otp'}
			<div class="flex min-h-screen items-center justify-center">
				<div class="glass-card w-full max-w-md p-8">
					<div class="mb-8 text-center">
						<Key class="mx-auto mb-4 h-16 w-16 text-primary-pink" />
						<h1 class="mb-2 text-3xl font-bold">Verifikasi OTP</h1>
						<p class="text-white/60">Masukkan kode OTP yang dikirim ke {adminEmail}</p>
					</div>

					{#if error}
						<div class="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-200">
							{error}
						</div>
					{/if}

					<form on:submit|preventDefault={verifyOTP} class="space-y-4">
						<div>
							<label for="otpCode" class="mb-2 block text-sm font-medium">Kode OTP</label>
							<input
								id="otpCode"
								type="text"
								bind:value={otpCode}
								placeholder="123456"
								class="w-full rounded-lg border border-white/10 bg-white/5 py-3 px-4
								transition-colors focus:border-primary-pink focus:outline-none text-center text-2xl tracking-widest"
								disabled={loading}
								maxlength="6"
							/>
						</div>

						<div class="flex gap-3">
							<button
								type="button"
								on:click={() => (step = 'email')}
								class="btn-secondary flex-1"
								disabled={loading}
							>
								Kembali
							</button>
							<button type="submit" class="btn-primary flex-1" disabled={loading}>
								{#if loading}
									<span class="animate-spin">⏳</span>
									Verifikasi...
								{:else}
									Verifikasi
								{/if}
							</button>
						</div>
					</form>
				</div>
			</div>
		{:else}
			<!-- Admin Dashboard -->
			<div class="mb-8 flex items-center justify-between">
				<div>
					<h1 class="mb-2 text-3xl font-bold">Admin Dashboard</h1>
					<p class="text-white/60">Kelola semua tagihan dan status pembayaran</p>
				</div>
				<button on:click={exitAdminMode} class="btn-secondary">
					Keluar Mode Admin
				</button>
			</div>

			{#if error}
				<div class="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-200">
					{error}
				</div>
			{/if}

			<!-- Stats -->
			<div class="mb-8 grid gap-4 md:grid-cols-3">
				<div class="glass-card p-6">
					<div class="flex items-center gap-3">
						<FileText class="h-8 w-8 text-primary-pink" />
						<div>
							<p class="text-2xl font-bold">{bills.length}</p>
							<p class="text-sm text-white/60">Total Tagihan</p>
						</div>
					</div>
				</div>
				<div class="glass-card p-6">
					<div class="flex items-center gap-3">
						<Users class="h-8 w-8 text-status-lunas" />
						<div>
							<p class="text-2xl font-bold">
								{bills.reduce((acc, bill) => acc + bill.members.filter(m => m.status === 'lunas').length, 0)}
							</p>
							<p class="text-sm text-white/60">Pembayaran Lunas</p>
						</div>
					</div>
				</div>
				<div class="glass-card p-6">
					<div class="flex items-center gap-3">
						<Users class="h-8 w-8 text-status-belum" />
						<div>
							<p class="text-2xl font-bold">
								{bills.reduce((acc, bill) => acc + bill.members.filter(m => m.status === 'belum').length, 0)}
							</p>
							<p class="text-sm text-white/60">Belum Bayar</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Bills Management -->
			<section class="mb-8">
				<h2 class="mb-4 text-xl font-semibold">Kelola Tagihan</h2>
				<div class="space-y-4">
					{#each bills as bill (bill.id)}
						<div class="glass-card p-6">
							<div class="mb-4 flex items-center justify-between">
								<div>
									<h3 class="text-lg font-semibold">{bill.title}</h3>
									<p class="text-sm text-white/60">
										Dibuat oleh {bill.creator.full_name} • Rp {bill.amount.toLocaleString()}
									</p>
								</div>
							</div>

							<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
								{#each bill.members as member (member.id)}
									<div class="rounded-lg border border-white/10 bg-white/5 p-3">
										<p class="font-medium">{member.user.full_name}</p>
										<p class="text-sm text-white/60">Rp {bill.per_person.toLocaleString()}</p>
										<div class="mt-2 flex items-center gap-2">
											<span class="text-xs px-2 py-1 rounded-full {member.status === 'lunas' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}">
												{member.status}
											</span>
											<button
												on:click={() => updateMemberStatus(bill.id, member.member_id, member.status === 'lunas' ? 'belum' : 'lunas')}
												class="text-xs text-primary-pink hover:underline"
												disabled={loading}
											>
												Ubah
											</button>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</section>

			<!-- Audit Logs -->
			<section>
				<h2 class="mb-4 text-xl font-semibold">Log Aktivitas</h2>
				<AuditLog logs={auditLogs} />
			</section>
		{/if}
	</div>
</div>
