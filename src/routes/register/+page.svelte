<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	import { Mail, Lock, User, CreditCard, Wallet } from 'lucide-svelte';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let fullName = '';
	let bankAccount1 = '';
	let bankAccount2 = '';
	let ewalletMethod = '';

	let loading = false;
	let error = '';
	let step = 1; // Step 1: Account, Step 2: Payment Methods

	async function handleRegister() {
		// Validation
		if (!email || !password || !fullName) {
			error = 'Email, password, dan nama lengkap harus diisi';
			return;
		}

		if (password.length < 6) {
			error = 'Password minimal 6 karakter';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Password tidak cocok';
			return;
		}
		if (!bankAccount1 || !bankAccount2 || !ewalletMethod) {
			error = 'Semua metode pembayaran harus diisi';
			return;
		}
		loading = true;
		error = '';

		try {
			// Step 1: Create auth user
			const { data: authData, error: signUpError } = await supabase.auth.signUp({
				email,
				password
			});

			if (signUpError) throw signUpError;

			if (!authData.user) {
				throw new Error('Registrasi gagal');
			}

			// Step 2: Insert user profile
			const { error: profileError } = await supabase.from('users').insert({
				id: authData.user.id,
				email,
				full_name: fullName,
				bank_account_1: bankAccount1 || null,
				bank_account_2: bankAccount2 || null,
				ewallet_method: ewalletMethod || null
			});

			if (profileError) throw profileError;

			// Success - redirect to login
			goto('/login?registered=true');
		} catch (err: any) {
			error = err.message || 'Registrasi gagal. Silakan coba lagi.';
		} finally {
			loading = false;
		}
	}

	function nextStep() {
		if (!email || !password || !fullName) {
			error = 'Lengkapi data akun terlebih dahulu';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Password tidak cocok';
			return;
		}

		error = '';
		step = 2;
	}
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<div class="glass-card w-full max-w-md p-8">
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-3xl font-bold">Daftar Akun Baru</h1>
			<p class="text-white/60">
				{step === 1 ? 'Langkah 1: Data Akun' : 'Langkah 2: Metode Pembayaran'}
			</p>
		</div>

		<!-- Progress Indicator -->
		<div class="mb-6 flex gap-2">
			<div class="h-2 flex-1 rounded-full {step >= 1 ? 'bg-primary-pink' : 'bg-white/10'}"></div>
			<div class="h-2 flex-1 rounded-full {step >= 2 ? 'bg-primary-pink' : 'bg-white/10'}"></div>
		</div>

		{#if error}
			<div class="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-200">
				{error}
			</div>
		{/if}

		<form on:submit|preventDefault={step === 1 ? nextStep : handleRegister} class="space-y-4">
			{#if step === 1}
				<!-- Step 1: Account Info -->
				<div>
					<label for="fullName" class="mb-2 block text-sm font-medium">Nama Lengkap</label>
					<div class="relative">
						<User class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-white/40" />
						<input
							id="fullName"
							type="text"
							bind:value={fullName}
							placeholder="Nama lengkap Anda"
							class="w-full rounded-lg border border-white/10 bg-white/5 py-3 pr-4 pl-11
                     transition-colors focus:border-primary-pink focus:outline-none"
							disabled={loading}
						/>
					</div>
				</div>

				<div>
					<label for="email" class="mb-2 block text-sm font-medium">Email</label>
					<div class="relative">
						<Mail class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-white/40" />
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="nama@email.com"
							class="w-full rounded-lg border border-white/10 bg-white/5 py-3 pr-4 pl-11
                     transition-colors focus:border-primary-pink focus:outline-none"
							disabled={loading}
						/>
					</div>
				</div>

				<div>
					<label for="password" class="mb-2 block text-sm font-medium">Password</label>
					<div class="relative">
						<Lock class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-white/40" />
						<input
							id="password"
							type="password"
							bind:value={password}
							placeholder="Minimal 6 karakter"
							class="w-full rounded-lg border border-white/10 bg-white/5 py-3 pr-4 pl-11
                     transition-colors focus:border-primary-pink focus:outline-none"
							disabled={loading}
						/>
					</div>
				</div>

				<div>
					<label for="confirmPassword" class="mb-2 block text-sm font-medium"
						>Konfirmasi Password</label
					>
					<div class="relative">
						<Lock class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-white/40" />
						<input
							id="confirmPassword"
							type="password"
							bind:value={confirmPassword}
							placeholder="Ulangi password"
							class="w-full rounded-lg border border-white/10 bg-white/5 py-3 pr-4 pl-11
                     transition-colors focus:border-primary-pink focus:outline-none"
							disabled={loading}
						/>
					</div>
				</div>

				<button type="submit" class="btn-primary w-full"> Lanjut ke Metode Pembayaran </button>
			{:else}
				<!-- Step 2: Payment Methods -->
				<div>
					<label for="bankAccount1" class="mb-2 block text-sm font-medium">
						Rekening Bank 1 <span class="text-white/40">(Wajib)</span>
					</label>
					<div class="relative">
						<CreditCard class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-white/40" />
						<input
							id="bankAccount1"
							type="text"
							bind:value={bankAccount1}
							placeholder="BCA - 1234567890"
							class="w-full rounded-lg border border-white/10 bg-white/5 py-3 pr-4 pl-11
                     transition-colors focus:border-primary-pink focus:outline-none"
							disabled={loading}
                            required
						/>
					</div>
					<p class="mt-1 text-xs text-white/40">Format: Nama Bank - Nomor Rekening</p>
				</div>

				<div>
					<label for="bankAccount2" class="mb-2 block text-sm font-medium">
						Rekening Bank 2 <span class="text-white/40">(Wajib)</span>
					</label>
					<div class="relative">
						<CreditCard class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-white/40" />
						<input
							id="bankAccount2"
							type="text"
							bind:value={bankAccount2}
							placeholder="Aladin - 9876543210"
							class="w-full rounded-lg border border-white/10 bg-white/5 py-3 pr-4 pl-11
                     transition-colors focus:border-primary-pink focus:outline-none"
							disabled={loading}
                            required
						/>
					</div>
				</div>

				<div>
					<label for="ewallet" class="mb-2 block text-sm font-medium">
						E-Wallet <span class="text-white/40">(Wajib)</span>
					</label>
					<div class="relative">
						<Wallet class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-white/40" />
						<input
							id="ewallet"
							type="text"
							bind:value={ewalletMethod}
							placeholder="GoPay - 08123456789"
							class="w-full rounded-lg border border-white/10 bg-white/5 py-3 pr-4 pl-11
                     transition-colors focus:border-primary-pink focus:outline-none"
							disabled={loading}
                            required
						/>
					</div>
					<p class="mt-1 text-xs text-white/40">Format: Nama E-Wallet - Nomor HP</p>
				</div>

				<div class="flex gap-3">
					<button
						type="button"
						on:click={() => (step = 1)}
						class="btn-secondary flex-1"
						disabled={loading}
					>
						Kembali
					</button>

					<button type="submit" class="btn-primary flex-1" disabled={loading}>
						{#if loading}
							<span class="animate-spin">⏳</span>
							Mendaftar...
						{:else}
							Daftar
						{/if}
					</button>
				</div>
			{/if}
		</form>

		<div class="mt-6 text-center text-sm text-white/60">
			Sudah punya akun?
			<a href="/login" class="text-primary-pink hover:underline">Masuk di sini</a>
		</div>
	</div>
</div>
