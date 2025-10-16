export interface User {
	id: string;
	email: string;
	full_name: string;
	bank_account_1: string | null;
	bank_account_2: string | null;
	ewallet_method: string | null;
	created_at: string;
}

export interface Bill {
	id: string;
	creator_id: string;
	title: string;
	description: string | null;
	amount: number;
	per_person: number;
	deadline: string;
	created_at: string;
}

export interface BillMember {
	id: string;
	bill_id: string;
	member_id: string;
	proof_url: string | null;
	status: 'lunas' | 'belum';
	updated_at: string;
	paid_at: string | null;
}

export interface BillWithMembers extends Bill {
	creator: User;
	members: (BillMember & { user: User })[];
}

export interface AuditLog {
	id: string;
	actor_id: string;
	bill_id: string;
	action: string;
	old_value: string | null;
	new_value: string | null;
	member_id: string | null;
	timestamp: string;
}

export interface AuditLogWithDetails extends AuditLog {
	actor: User;
	bill: Pick<Bill, 'id' | 'title'>;
	member: User | null;
}

export interface Database {
	public: {
		Tables: {
			users: {
				Row: User;
				Insert: Omit<User, 'created_at'>;
				Update: Partial<Omit<User, 'id' | 'created_at'>>;
			};
			bills: {
				Row: Bill;
				Insert: Omit<Bill, 'id' | 'created_at'>;
				Update: Partial<Omit<Bill, 'id' | 'created_at'>>;
			};
			bill_members: {
				Row: BillMember;
				Insert: Omit<BillMember, 'id' | 'updated_at'>;
				Update: Partial<Omit<BillMember, 'id' | 'bill_id' | 'member_id'>>;
			};
			audit_logs: {
				Row: AuditLog;
				Insert: Omit<AuditLog, 'id' | 'timestamp'>;
				Update: never;
			};
		};
	};
}
