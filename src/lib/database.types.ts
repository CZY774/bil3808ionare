export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string
          actor_id: string
          bill_id: string
          action: string
          old_value: string | null
          new_value: string | null
          member_id: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          actor_id: string
          bill_id: string
          action: string
          old_value?: string | null
          new_value?: string | null
          member_id?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          actor_id?: string
          bill_id?: string
          action?: string
          old_value?: string | null
          new_value?: string | null
          member_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      bill_members: {
        Row: {
          id: string
          bill_id: string
          member_id: string
          proof_url: string | null
          status: string
          updated_at: string
          paid_at: string | null
        }
        Insert: {
          id?: string
          bill_id: string
          member_id: string
          proof_url?: string | null
          status?: string
          updated_at?: string
          paid_at?: string | null
        }
        Update: {
          id?: string
          bill_id?: string
          member_id?: string
          proof_url?: string | null
          status?: string
          updated_at?: string
          paid_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bill_members_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      bills: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string | null
          amount: number
          per_person: number
          deadline: string
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string | null
          amount: number
          per_person: number
          deadline: string
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string | null
          amount?: number
          per_person?: number
          deadline?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          bank_account_1: string | null
          bank_account_2: string | null
          ewallet_method: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          bank_account_1?: string | null
          bank_account_2?: string | null
          ewallet_method?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          bank_account_1?: string | null
          bank_account_2?: string | null
          ewallet_method?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
