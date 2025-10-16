<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabaseClient';
	import { currentUser, userProfile } from '$lib/stores';
	import '../app.css';

	onMount(() => {
		// Check current session
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session?.user) {
				currentUser.set(session.user);

				// Fetch user profile
				supabase
					.from('users')
					.select('*')
					.eq('id', session.user.id)
					.single()
					.then(({ data }) => {
						if (data) userProfile.set(data);
					});
			}
		});

		// Listen to auth changes
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === 'SIGNED_OUT' || !session) {
				currentUser.set(null);
				userProfile.set(null);
				// Redirect to login if on protected route
				if ($page.route.id && !['/', '/login', '/register'].includes($page.route.id)) {
					goto('/login');
				}
			} else if (session?.user) {
				currentUser.set(session.user);

				const { data } = await supabase
					.from('users')
					.select('*')
					.eq('id', session.user.id)
					.single();

				if (data) userProfile.set(data);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	});
</script>

<slot />
