<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	import { currentUser, isAdminMode } from '$lib/stores';
	import { formatDate } from '$lib/utils';
	import Navbar from '$lib/components/Navbar.svelte';
	import AuditLog from '$lib/components/AuditLog.svelte';
	import { Shield, Mail, AlertCircle, CheckCircle, LogOut } from 'lucide-svelte';
	import type { BillWithMembers, AuditLogWithDetails } from '$lib/types';

	let loading = true;
	let verifying = false;
	let sendingOtp = false;
	let showOtpInput = false;
	let email = '';
	let otpCode = '';
	let error = '';
	let otpSent = false;

	let allBills: BillWithMembers[] = [];
	let auditLogs: AuditLogWithDetails[] = [];
	let showAuditLog = false;

	onMount(async () => {
		if (!$currentUser) {
			goto('/login');
			return;
		}

		// Check if already in admin mode
		if ($isAdminMode) {
			await loadAdminData();
		} else {
			loading = false;
		}
	});

	async function sendOTP() {
		if (!email) {
			error = 'Masukkan email Anda';
			return;
		}

		if (email !== $currentUser?.email) {
			error = 'Email tidak sesuai dengan akun Anda';
			return;
		}

		sendingOtp = true;
		error = '';

		try {
			const { error: otpError } = await supabase.auth.signInWithOtp({
				email,
				options: {
					shouldCreateUser: false
				}
			});

			if (otpError) throw otpError;

			otpSent = true;
			showOtpInput = true;
		} catch (err: any) {
			error = err.message || 'Gagal mengirim OTP';
		} finally {
			sendingOtp = false;
		}
	}

	async function verifyOTP() {
		if (!otpCode) {
			error = 'Masukkan kode OTP';
			return;
		}

		verifying = true;
		error = '';

		try {
			const { error: verifyError } = await supabase.auth.verifyOtp({
				email,
				token: otpCode,
				type: 'email'
			});

			if (verifyError) throw verifyError;

			// Set admin mode
			isAdminMode.set(true);
			await loadAdminData();
		} catch (err: any) {
			error = 'Kode OTP salah atau sudah kadaluarsa';
		} finally {
			verifying = false;
		}
	}

	async function loadAdminData() {
		loading = true;

		try {
			// Load all bills
			const { data: billsData } = await supabase
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
				.order('created_at', { ascending: false });

			if (billsData) {
				allBills = billsData as BillWithMembers[];
			}

			// Load audit logs
			const { data: logsData } = await supabase
				.from('audit_logs')
				.select(
					`
          *,
          actor:users!audit_logs_actor_id_fkey(id, full_name, email),
          member:users!audit_logs_member_id_fkey(id, full_name, email),
          bill:bills(id, title)
        `
				)
				.order('timestamp', { ascending: false })
				.limit(50);

			if (logsData) {
				auditLogs = logsData as AuditLogWithDetails[];
			}
		} catch (err) {
			console.error('Error loading admin data:', err);
		} finally {
			loading = false;
		}
	}

	async function handleStatusChange(billId: string, memberId: string, currentStatus: string) {
		const newStatus = currentStatus === 'lunas' ? 'belum' : 'lunas';
		const confirmMsg = `Ubah status pembayaran menjadi "${newStatus}"?`;

		if (!confirm(confirmMsg)) return;

		try {
			const { error: updateError } = await supabase
				.from('bill_members')
				.update({ status: newStatus })
				.eq('bill_id', billId)
				.eq('member_id', memberId);

			if (updateError) throw updateError;

			// Reload data
			await loadAdminData();
		} catch (err: any) {
			alert('Gagal mengubah status: ' + err.message);
		}
	}

	function exitAdminMode() {
		isAdminMode.set(false);
		goto('/dashboard');
	}
</script>

<Navbar />

<div class="min-h-screen p-4 sm:p-6 lg:p-8">
	<div class="mx-auto max-w-7xl">
		{#if !$isAdminMode}
			<!-- OTP Verification Screen -->
			<div class="mx-auto max-w-md">
				<div class="glass-card p-8">
					<div class="mb-6 text-center">
						<Shield class="mx-auto mb-4 h-16 w-16 text-red-400" />
						<h1 class="mb-2 text-2xl font-bold">Mode Admin</h1>
						<p class="text-white/60">Verifikasi identitas Anda dengan OTP</p>
					</div>

					{#if error}
						<div
							class="mb-4 flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-200"
						>
							<AlertCircle class="mt-0.5 h-5 w-5 flex-shrink-0" />
							<div>{error}</div>
						</div>
					{/if}

					{#if !showOtpInput}
						<div class="space-y-4">
							<div>
								<label for="email" class="mb-2 block text-sm font-medium">Email Anda</label>
								<div class="relative">
									<Mail class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-white/40" />
									<input
										id="email"
										type="email"
										bind:value={email}
										placeholder={$currentUser?.email || 'email@example.com'}
										class="w-full rounded-lg border border-white/10 bg-white/5 py-3 pr-4 pl-11
                           transition-colors focus:border-primary-pink focus:outline-none"
										disabled={sendingOtp}
									/>
								</div>
							</div>

							<button on:click={sendOTP} class="btn-primary w-full" disabled={sendingOtp}>
								{#if sendingOtp}
									<span class="mr-2 animate-spin">⏳</span>
									Mengirim OTP...
								{:else}
									Kirim Kode OTP
								{/if}
							</button>
						</div>
					{:else}
						{#if otpSent}
							<div
								class="mb-4 flex items-start gap-3 rounded-lg border border-status-lunas/50 bg-status-lunas/10 px-4 py-3 text-status-lunas"
							>
								<CheckCircle class="mt-0.5 h-5 w-5 flex-shrink-0" />
								<div class="text-sm">
									Kode OTP telah dikirim ke <strong>{email}</strong>. Cek inbox atau folder spam.
								</div>
							</div>
						{/if}

						<div class="space-y-4">
							<div>
								<label for="otp" class="mb-2 block text-sm font-medium">Kode OTP</label>
								<input
									id="otp"
									type="text"
									bind:value={otpCode}
									placeholder="123456"
									maxlength="6"
									class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-2xl tracking-widest
                         transition-colors focus:border-primary-pink focus:outline-none"
									disabled={verifying}
								/>
							</div>

							<button on:click={verifyOTP} class="btn-primary w-full" disabled={verifying}>
								{#if verifying}
									<span class="mr-2 animate-spin">⏳</span>
									Memverifikasi...
								{:else}
									Verifikasi & Masuk Mode Admin
								{/if}
							</button>

							<button
								on:click={() => {
									showOtpInput = false;
									otpSent = false;
									otpCode = '';
								}}
								class="btn-secondary w-full"
								disabled={verifying}
							>
								Kirim Ulang OTP
							</button>
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<!-- Admin Panel -->
			<div class="mb-8 flex items-center justify-between">
				<div>
					<div class="mb-2 flex items-center gap-3">
						<Shield class="h-8 w-8 text-red-400" />
						<h1 class="text-3xl font-bold">Admin Panel</h1>
					</div>
					<p class="text-white/60">Kelola status pembayaran dan lihat audit log</p>
				</div>

				<button on:click={exitAdminMode} class="btn-secondary flex items-center gap-2">
					<LogOut class="h-4 w-4" />
					Keluar Mode Admin
				</button>
			</div>

			{#if loading}
				<div class="flex items-center justify-center py-20">
					<div class="text-center">
						<div class="mb-4 animate-spin text-4xl">⏳</div>
						<p class="text-white/60">Memuat data...</p>
					</div>
				</div>
			{:else}
				<!-- Bill Status Management -->
				<div class="glass-card mb-6 p-6">
					<h2 class="mb-4 text-xl font-semibold">Manajemen Status Tagihan</h2>

					{#if allBills.length === 0}
						<p class="py-8 text-center text-white/60">Belum ada tagihan</p>
					{:else}
						<div class="space-y-6">
							{#each allBills as bill (bill.id)}
								<div class="rounded-lg bg-white/5 p-4">
									<div class="mb-4 flex items-start justify-between">
										<div>
											<h3 class="text-lg font-semibold">{bill.title}</h3>
											<p class="text-sm text-white/60">
												Deadline: {formatDate(bill.deadline)} • Total: Rp {bill.amount.toLocaleString(
													'id-ID'
												)}
											</p>
										</div>
									</div>

									<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
										{#each bill.members as member (member.id)}
											<div class="flex items-center justify-between rounded-lg bg-white/5 p-3">
												<div class="flex items-center gap-2">
													<div
														class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-pink"
													>
														<span class="text-sm font-semibold text-primary-dark">
															{member.user.full_name.charAt(0)}
														</span>
													</div>
													<div class="text-sm">
														<div class="font-medium">{member.user.full_name}</div>
														{#if member.status === 'lunas'}
															<span class="badge-lunas text-xs">Lunas</span>
														{:else}
															<span class="badge-belum text-xs">Belum</span>
														{/if}
													</div>
												</div>

												<button
													on:click={() =>
														handleStatusChange(bill.id, member.member_id, member.status)}
													class="rounded bg-white/10 px-3 py-1 text-xs transition-colors hover:bg-white/20"
												>
													Ubah
												</button>
											</div>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Audit Log Section -->
				<div class="glass-card p-6">
					<button
						on:click={() => (showAuditLog = !showAuditLog)}
						class="flex w-full items-center justify-between text-left"
					>
						<h2 class="text-xl font-semibold">
							Audit Log ({auditLogs.length})
						</h2>
						<span class="text-2xl transition-transform {showAuditLog ? 'rotate-180' : ''}">
							▼
						</span>
					</button>

					{#if showAuditLog}
						<div class="mt-6">
							<AuditLog logs={auditLogs} />
						</div>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
</div>
