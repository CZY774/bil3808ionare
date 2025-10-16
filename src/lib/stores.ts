import { writable, derived, type Readable } from 'svelte/store';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User, BillWithMembers } from './types.js';

// Auth store
export const currentUser = writable<SupabaseUser | null>(null);
export const userProfile = writable<User | null>(null);

// Admin mode store
export const isAdminMode = writable<boolean>(false);

// Bills store
export const bills = writable<BillWithMembers[]>([]);
export const currentBill = writable<BillWithMembers | null>(null);

// Derived stores
export const isAuthenticated: Readable<boolean> = derived(
	currentUser,
	($currentUser) => $currentUser !== null
);

export const unpaidBills: Readable<BillWithMembers[]> = derived(
	[bills, currentUser],
	([$bills, $currentUser]) => {
		if (!$currentUser) return [];
		return $bills.filter((bill) =>
			bill.members.some((m: any) => m.member_id === $currentUser.id && m.status === 'belum')
		);
	}
);
