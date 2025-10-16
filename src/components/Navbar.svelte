<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabaseClient';
	import { currentUser, userProfile, isAdminMode } from '$lib/stores';
	import { Bell, Settings, LogOut, Home, FileText, Shield } from 'lucide-svelte';
	import { getInitials } from '$lib/utils';

	let showUserMenu = false;

	async function handleLogout() {
		await supabase.auth.signOut();
		goto('/login');
	}

	$: initials = $userProfile ? getInitials($userProfile.full_name) : '?';
	$: currentPath = $page.url.pathname;
</script>

{#if $currentUser}
	<nav class="glass-card sticky top-0 z-50">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<!-- Logo & Brand -->
				<div class="flex items-center gap-8">
					<a href="/dashboard" class="flex items-center gap-2">
						<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-pink">
							<span class="text-lg font-bold text-primary-dark">B</span>
						</div>
						<span class="hidden text-xl font-bold sm:block">Bil3808ionaire</span>
					</a>

					<!-- Navigation Links -->
					<div class="hidden gap-1 md:flex">
						<a
							href="/dashboard"
							class="rounded-lg px-4 py-2 transition-colors {currentPath === '/dashboard'
								? 'bg-white/10 text-primary-pink'
								: 'text-white/60 hover:bg-white/5 hover:text-white'}"
						>
							<div class="flex items-center gap-2">
								<Home class="h-4 w-4" />
								Dashboard
							</div>
						</a>

						<a
							href="/bills/create"
							class="rounded-lg px-4 py-2 transition-colors {currentPath.startsWith('/bills/create')
								? 'bg-white/10 text-primary-pink'
								: 'text-white/60 hover:bg-white/5 hover:text-white'}"
						>
							<div class="flex items-center gap-2">
								<FileText class="h-4 w-4" />
								Buat Tagihan
							</div>
						</a>

						{#if $isAdminMode}
							<a
								href="/admin"
								class="rounded-lg bg-red-500/20 px-4 py-2 text-red-300 transition-colors"
							>
								<div class="flex items-center gap-2">
									<Shield class="h-4 w-4" />
									Admin Mode
								</div>
							</a>
						{/if}
					</div>
				</div>

				<!-- Right Side Actions -->
				<div class="flex items-center gap-3">
					<button
						on:click={() => goto('/settings')}
						class="rounded-lg p-2 transition-colors hover:bg-white/10"
						title="Pengaturan Notifikasi"
					>
						<Bell class="h-5 w-5" />
					</button>

					<!-- User Menu -->
					<div class="relative">
						<button
							on:click={() => (showUserMenu = !showUserMenu)}
							class="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-white/10"
						>
							<div
								class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-pink font-semibold text-primary-dark"
							>
								{initials}
							</div>
						</button>

						{#if showUserMenu}
							<div class="glass-card absolute right-0 mt-2 w-48 p-2">
								<div class="mb-2 border-b border-white/10 px-3 py-2">
									<p class="font-medium">{$userProfile?.full_name}</p>
									<p class="text-xs text-white/60">{$userProfile?.email}</p>
								</div>

								<button
									on:click={() => {
										showUserMenu = false;
										goto('/settings');
									}}
									class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/10"
								>
									<Settings class="h-4 w-4" />
									Pengaturan
								</button>

								<button
									on:click={handleLogout}
									class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-red-300 transition-colors hover:bg-red-500/20"
								>
									<LogOut class="h-4 w-4" />
									Keluar
								</button>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</nav>
{/if}
