<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	import { currentUser, userProfile } from '$lib/stores';
	import { Mail, Lock, LogIn } from 'lucide-svelte';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	async function handleLogin() {
		if (!email || !password) {
			error = 'Email dan password harus diisi';
			return;
		}

		loading = true;
		error = '';

		try {
			const { data, error: signInError } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (signInError) throw signInError;

			if (data.user) {
				currentUser.set(data.user);

				// Fetch user profile
				const { data: profile } = await supabase
					.from('users')
					.select('*')
					.eq('id', data.user.id)
					.single();

				if (profile) {
					userProfile.set(profile);
				}

				goto('/dashboard');
			}
		} catch (err: any) {
			error = err.message || 'Login gagal. Silakan coba lagi.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<div class="glass-card w-full max-w-md p-8">
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-3xl font-bold">Bil3808ionaire</h1>
			<p class="text-white/60">Masuk ke akun Anda</p>
		</div>

		{#if error}
			<div class="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-200">
				{error}
			</div>
		{/if}

		<form on:submit|preventDefault={handleLogin} class="space-y-4">
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
						placeholder="••••••••"
						class="w-full rounded-lg border border-white/10 bg-white/5 py-3 pr-4 pl-11
                   transition-colors focus:border-primary-pink focus:outline-none"
						disabled={loading}
					/>
				</div>
			</div>

			<button
				type="submit"
				class="btn-primary flex w-full items-center justify-center gap-2"
				disabled={loading}
			>
				{#if loading}
					<span class="animate-spin">⏳</span>
					Masuk...
				{:else}
					<LogIn class="h-5 w-5" />
					Masuk
				{/if}
			</button>
		</form>

		<div class="mt-6 text-center text-sm text-white/60">
			Belum punya akun?
			<a href="/register" class="text-primary-pink hover:underline">Daftar di sini</a>
		</div>
	</div>
</div>
