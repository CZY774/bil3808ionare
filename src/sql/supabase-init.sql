-- =====================================================
-- Bil3808ionaire - Database Schema
-- Copy-paste ke Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: users (extends auth.users)
-- =====================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  bank_account_1 TEXT,
  bank_account_2 TEXT,
  ewallet_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: bills
-- =====================================================
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  per_person NUMERIC(12, 2) NOT NULL CHECK (per_person > 0),
  deadline DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: bill_members
-- =====================================================
CREATE TABLE public.bill_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'belum' CHECK (status IN ('lunas', 'belum')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bill_id, member_id)
);

-- =====================================================
-- TABLE: audit_logs (immutable)
-- =====================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================
CREATE INDEX idx_bills_creator ON public.bills(creator_id);
CREATE INDEX idx_bills_deadline ON public.bills(deadline);
CREATE INDEX idx_bill_members_bill ON public.bill_members(bill_id);
CREATE INDEX idx_bill_members_member ON public.bill_members(member_id);
CREATE INDEX idx_bill_members_status ON public.bill_members(status);
CREATE INDEX idx_audit_logs_bill ON public.audit_logs(bill_id);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS Policies
-- =====================================================

-- Users can read all users (untuk select roommates)
CREATE POLICY "Users can read all users"
  ON public.users
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- BILLS Policies
-- =====================================================

-- Users can read bills where they are creator or member
CREATE POLICY "Users can read their bills"
  ON public.bills
  FOR SELECT
  USING (
    auth.uid() = creator_id 
    OR EXISTS (
      SELECT 1 FROM public.bill_members 
      WHERE bill_id = bills.id AND member_id = auth.uid()
    )
  );

-- Users can create bills
CREATE POLICY "Users can create bills"
  ON public.bills
  FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own bills
CREATE POLICY "Creators can update own bills"
  ON public.bills
  FOR UPDATE
  USING (auth.uid() = creator_id);

-- Creators can delete their own bills
CREATE POLICY "Creators can delete own bills"
  ON public.bills
  FOR DELETE
  USING (auth.uid() = creator_id);

-- =====================================================
-- BILL_MEMBERS Policies
-- =====================================================

-- Users can read bill_members for bills they're part of
CREATE POLICY "Users can read bill members"
  ON public.bill_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bills 
      WHERE id = bill_id 
      AND (creator_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.bill_members bm2 
        WHERE bm2.bill_id = bills.id AND bm2.member_id = auth.uid()
      ))
    )
  );

-- Bill creators can insert members
CREATE POLICY "Creators can insert bill members"
  ON public.bill_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bills 
      WHERE id = bill_id AND creator_id = auth.uid()
    )
  );

-- Members can update their own payment proof
CREATE POLICY "Members can update own payment"
  ON public.bill_members
  FOR UPDATE
  USING (auth.uid() = member_id);

-- =====================================================
-- AUDIT_LOGS Policies
-- =====================================================

-- Users can read audit logs for bills they're part of
CREATE POLICY "Users can read audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bills 
      WHERE id = bill_id 
      AND (creator_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.bill_members 
        WHERE bill_id = bills.id AND member_id = auth.uid()
      ))
    )
  );

-- Only system can insert audit logs (via triggers)
CREATE POLICY "System can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Audit logs cannot be deleted (immutable)
-- No DELETE policy = no one can delete

-- =====================================================
-- TRIGGERS: Auto-update timestamps
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bill_members_updated_at
  BEFORE UPDATE ON public.bill_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER: Auto-create audit log on status change
-- =====================================================

CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_logs (
      actor_id,
      bill_id,
      member_id,
      action,
      old_value,
      new_value
    ) VALUES (
      auth.uid(),
      NEW.bill_id,
      NEW.member_id,
      'status_change',
      OLD.status,
      NEW.status
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_status_change
  AFTER UPDATE ON public.bill_members
  FOR EACH ROW
  EXECUTE FUNCTION log_status_change();

-- =====================================================
-- TRIGGER: Auto-set paid_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION set_paid_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'lunas' AND OLD.status = 'belum' THEN
    NEW.paid_at = NOW();
  ELSIF NEW.status = 'belum' AND OLD.status = 'lunas' THEN
    NEW.paid_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_paid_at_trigger
  BEFORE UPDATE ON public.bill_members
  FOR EACH ROW
  EXECUTE FUNCTION set_paid_at();

-- =====================================================
-- STORAGE: Bucket for payment proofs
-- =====================================================

-- Create bucket via SQL (alternative to dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('proofs', 'proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for proofs bucket
CREATE POLICY "Users can upload their own proofs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'proofs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read proofs for their bills"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'proofs'
    AND EXISTS (
      SELECT 1 FROM public.bill_members bm
      JOIN public.bills b ON b.id = bm.bill_id
      WHERE bm.proof_url = storage.objects.name
      AND (b.creator_id = auth.uid() OR bm.member_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete their own proofs"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Note: Uncomment below to insert test users
-- You'll need to register users first via Supabase Auth
-- Then update the UUIDs here

/*
-- Example: Insert test users profiles
INSERT INTO public.users (id, email, full_name, bank_account_1, ewallet_method)
VALUES 
  ('uuid-user-1', 'andi@test.com', 'Andi', 'BCA - 1234567890', 'GoPay - 08123456789'),
  ('uuid-user-2', 'budi@test.com', 'Budi', 'Mandiri - 9876543210', 'OVO - 08198765432'),
  ('uuid-user-3', 'citra@test.com', 'Citra', 'BNI - 5555666677', 'DANA - 08111222333');

-- Example: Insert test bill
INSERT INTO public.bills (id, creator_id, title, amount, per_person, deadline)
VALUES (
  'bill-uuid-1',
  'uuid-user-1',
  'Beras Bulan Ini',
  240000,
  30000,
  '2024-11-01'
);

-- Example: Insert bill members
INSERT INTO public.bill_members (bill_id, member_id, status)
VALUES 
  ('bill-uuid-1', 'uuid-user-1', 'lunas'),
  ('bill-uuid-1', 'uuid-user-2', 'belum'),
  ('bill-uuid-1', 'uuid-user-3', 'belum');
*/

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Bil3808ionaire database schema created successfully!';
  RAISE NOTICE '📋 Tables: users, bills, bill_members, audit_logs';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '🪣 Storage bucket "proofs" configured';
  RAISE NOTICE '⚡ Triggers for audit logs and timestamps active';
END $$;


-- Copy-paste di SQL Editor:
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

CREATE POLICY "Users can insert own profile during registration"
  ON public.users
  FOR INSERT
  WITH CHECK (true);