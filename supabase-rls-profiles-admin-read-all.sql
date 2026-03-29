-- =============================================================================
-- Admin dapat melihat & kelola SEMUA baris di `profiles` (Manajemen User)
-- =============================================================================
-- Masalah: RLS hanya (auth.uid() = id) → admin hanya melihat akunnya sendiri.
-- Policy dengan subquery ke `profiles` sering memicu infinite recursion.
-- Solusi: fungsi SECURITY DEFINER membaca `profiles` tanpa RLS.
--
-- Jalankan di Supabase → SQL Editor → Run (satu kali).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_current_user_admin() IS 'True jika user login adalah admin; dipakai RLS tanpa rekursi';

REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can select all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can modify all profiles" ON public.profiles;

CREATE POLICY "Admins full access profiles" ON public.profiles
  FOR ALL
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());
