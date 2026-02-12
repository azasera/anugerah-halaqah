-- =====================================================
-- MIGRATION: Add Setoran Harian Table
-- Purpose: Track daily setoran history with timestamps
-- Date: 2026-02-12
-- =====================================================

-- 1. Create setoran_harian table
CREATE TABLE IF NOT EXISTS public.setoran_harian (
    id BIGINT PRIMARY KEY,
    santri_id BIGINT NOT NULL,
    halaqah_id BIGINT NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    waktu_setor TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    poin INTEGER NOT NULL DEFAULT 0,
    keterangan TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_santri FOREIGN KEY (santri_id) REFERENCES public.students(id) ON DELETE CASCADE,
    CONSTRAINT fk_halaqah FOREIGN KEY (halaqah_id) REFERENCES public.halaqahs(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT check_poin_range CHECK (poin >= -1 AND poin <= 2)
);

-- 2. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_setoran_santri_id ON public.setoran_harian(santri_id);
CREATE INDEX IF NOT EXISTS idx_setoran_halaqah_id ON public.setoran_harian(halaqah_id);
CREATE INDEX IF NOT EXISTS idx_setoran_tanggal ON public.setoran_harian(tanggal);
CREATE INDEX IF NOT EXISTS idx_setoran_waktu ON public.setoran_harian(waktu_setor);
CREATE INDEX IF NOT EXISTS idx_setoran_created_by ON public.setoran_harian(created_by);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_setoran_santri_tanggal ON public.setoran_harian(santri_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_setoran_halaqah_tanggal ON public.setoran_harian(halaqah_id, tanggal);

-- 3. Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_setoran_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger for auto-update timestamp
DROP TRIGGER IF EXISTS trigger_update_setoran_updated_at ON public.setoran_harian;
CREATE TRIGGER trigger_update_setoran_updated_at
    BEFORE UPDATE ON public.setoran_harian
    FOR EACH ROW
    EXECUTE FUNCTION update_setoran_updated_at();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.setoran_harian ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.setoran_harian;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.setoran_harian;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.setoran_harian;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.setoran_harian;

-- 7. Create RLS Policies
-- Allow authenticated users to read all setoran
CREATE POLICY "Enable read access for authenticated users"
    ON public.setoran_harian
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert setoran
CREATE POLICY "Enable insert for authenticated users"
    ON public.setoran_harian
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update their own setoran
CREATE POLICY "Enable update for authenticated users"
    ON public.setoran_harian
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete setoran (admin only in app logic)
CREATE POLICY "Enable delete for authenticated users"
    ON public.setoran_harian
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- 8. Create view for daily ranking
CREATE OR REPLACE VIEW v_ranking_harian AS
SELECT 
    h.id as halaqah_id,
    h.name as nama_halaqah,
    DATE(s.tanggal) as tanggal,
    COUNT(s.id) as total_setoran,
    SUM(s.poin) as total_poin,
    RANK() OVER (PARTITION BY DATE(s.tanggal) ORDER BY SUM(s.poin) DESC) as peringkat
FROM public.halaqahs h
LEFT JOIN public.setoran_harian s ON h.id = s.halaqah_id
GROUP BY h.id, h.name, DATE(s.tanggal)
ORDER BY DATE(s.tanggal) DESC, total_poin DESC;

-- 9. Create view for top setoran (fastest)
CREATE OR REPLACE VIEW v_top_setoran_harian AS
SELECT 
    st.name as nama_santri,
    h.name as nama_halaqah,
    s.waktu_setor,
    s.poin,
    s.tanggal,
    ROW_NUMBER() OVER (PARTITION BY DATE(s.tanggal) ORDER BY s.waktu_setor ASC) as urutan
FROM public.setoran_harian s
JOIN public.students st ON s.santri_id = st.id
JOIN public.halaqahs h ON s.halaqah_id = h.id
WHERE s.poin > 0
ORDER BY s.tanggal DESC, s.waktu_setor ASC;

-- 10. Create function to get santri setoran history
CREATE OR REPLACE FUNCTION get_santri_setoran_history(
    p_santri_id BIGINT,
    p_limit INTEGER DEFAULT 30
)
RETURNS TABLE (
    tanggal DATE,
    waktu_setor TIMESTAMP WITH TIME ZONE,
    poin INTEGER,
    keterangan TEXT,
    halaqah_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.tanggal,
        s.waktu_setor,
        s.poin,
        s.keterangan,
        h.name as halaqah_name
    FROM public.setoran_harian s
    JOIN public.halaqahs h ON s.halaqah_id = h.id
    WHERE s.santri_id = p_santri_id
    ORDER BY s.tanggal DESC, s.waktu_setor DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 11. Create function to get halaqah daily stats
CREATE OR REPLACE FUNCTION get_halaqah_daily_stats(
    p_halaqah_id BIGINT,
    p_tanggal DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_setoran BIGINT,
    total_poin BIGINT,
    avg_poin NUMERIC,
    santri_setor BIGINT,
    santri_tidak_setor BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(s.id) as total_setoran,
        COALESCE(SUM(s.poin), 0) as total_poin,
        COALESCE(AVG(s.poin), 0) as avg_poin,
        COUNT(DISTINCT s.santri_id) as santri_setor,
        (SELECT COUNT(*) FROM public.students WHERE halaqah = (SELECT name FROM public.halaqahs WHERE id = p_halaqah_id)) - COUNT(DISTINCT s.santri_id) as santri_tidak_setor
    FROM public.setoran_harian s
    WHERE s.halaqah_id = p_halaqah_id
    AND DATE(s.tanggal) = p_tanggal;
END;
$$ LANGUAGE plpgsql;

-- 12. Grant permissions
GRANT ALL ON public.setoran_harian TO authenticated;
GRANT ALL ON public.setoran_harian TO service_role;
GRANT SELECT ON v_ranking_harian TO authenticated;
GRANT SELECT ON v_top_setoran_harian TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify tables
SELECT 'setoran_harian table created' as status, COUNT(*) as row_count FROM public.setoran_harian;
SELECT 'Views created' as status, COUNT(*) as view_count FROM information_schema.views WHERE table_schema = 'public' AND table_name LIKE 'v_%';
