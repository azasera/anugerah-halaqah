// Setoran Harian Module
// Handle daily setoran tracking with history

// Create new setoran
async function createSetoran(santriId, halaqahId, poin, keterangan = '') {
    // Ensure client is available (handle race condition)
    if (!window.supabaseClient && window.initSupabase) {
        console.warn('⚠️ Supabase client not found in createSetoran, attempting to init...');
        await window.initSupabase();
    }

    if (!window.supabaseClient) {
        console.error('❌ Supabase client not initialized in createSetoran');
        return null;
    }

    try {
        // Generate ID
        const id = Date.now() + Math.floor(Math.random() * 1000);

        // Get current user
        const { data: { user } } = await window.supabaseClient.auth.getUser();

        const setoran = {
            id: id,
            santri_id: santriId,
            halaqah_id: halaqahId,
            tanggal: new Date().toISOString().split('T')[0],
            waktu_setor: new Date().toISOString(),
            poin: poin,
            keterangan: keterangan,
            created_by: user?.id || null
        };

        const { data, error } = await window.supabaseClient
            .from('setoran_harian')
            .insert(setoran)
            .select()
            .single();

        if (error) throw error;

        console.log('✅ Setoran created:', data);

        // Update student total points
        await updateStudentPoints(santriId);

        // Update halaqah points
        await updateHalaqahPoints(halaqahId);

        return data;
    } catch (error) {
        console.error('Error creating setoran:', error);
        throw error;
    }
}

// Get setoran history for a student
async function getSetoranHistory(santriId, limit = 30) {
    if (!window.supabaseClient && window.initSupabase) await window.initSupabase();
    if (!window.supabaseClient) return [];

    try {
        const { data, error } = await window.supabaseClient
            .rpc('get_santri_setoran_history', {
                p_santri_id: santriId,
                p_limit: limit
            });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting setoran history:', error);
        return [];
    }
}

// Get daily ranking
async function getDailyRanking(tanggal = null) {
    // Ensure client is available
    if (!window.supabaseClient && window.initSupabase) {
        console.log('🔄 Init Supabase triggered from getDailyRanking');
        await window.initSupabase();
    }

    if (!window.supabaseClient) {
        console.error('❌ Supabase client missing in getDailyRanking');
        return [];
    }

    try {
        let query = window.supabaseClient
            .from('v_ranking_harian')
            .select('*');

        if (tanggal) {
            query = query.eq('tanggal', tanggal);
        }

        const { data, error } = await query.order('peringkat', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting daily ranking:', error);
        return [];
    }
}

// Get top setoran (fastest) for today
async function getTopSetoranToday(limit = 3) {
    if (!window.supabaseClient && window.initSupabase) await window.initSupabase();
    if (!window.supabaseClient) return [];

    try {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await window.supabaseClient
            .from('v_top_setoran_harian')
            .select('*')
            .eq('tanggal', today)
            .lte('urutan', limit)
            .order('urutan', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting top setoran:', error);
        return [];
    }
}

// Get halaqah daily stats
async function getHalaqahDailyStats(halaqahId, tanggal = null) {
    if (!window.supabaseClient && window.initSupabase) await window.initSupabase();
    if (!window.supabaseClient) return null;

    try {
        const date = tanggal || new Date().toISOString().split('T')[0];

        const { data, error } = await window.supabaseClient
            .rpc('get_halaqah_daily_stats', {
                p_halaqah_id: halaqahId,
                p_tanggal: date
            });

        if (error) throw error;
        return data?.[0] || null;
    } catch (error) {
        console.error('Error getting halaqah stats:', error);
        return null;
    }
}

// Update student total points from setoran history
async function updateStudentPoints(santriId) {
    if (!window.supabaseClient) return;

    try {
        // Calculate total points from setoran_harian
        const { data: setoranData, error: setoranError } = await window.supabaseClient
            .from('setoran_harian')
            .select('poin')
            .eq('santri_id', santriId);

        if (setoranError) throw setoranError;

        const totalPoints = setoranData.reduce((sum, s) => sum + s.poin, 0);

        // Update student
        const { error: updateError } = await window.supabaseClient
            .from('students')
            .update({
                total_points: totalPoints,
                updated_at: new Date().toISOString()
            })
            .eq('id', santriId);

        if (updateError) throw updateError;

        console.log(`✅ Student ${santriId} points updated: ${totalPoints}`);
    } catch (error) {
        console.error('Error updating student points:', error);
    }
}

// Update halaqah total points from setoran history
async function updateHalaqahPoints(halaqahId) {
    if (!window.supabaseClient) return;

    try {
        // Calculate total points from setoran_harian
        const { data: setoranData, error: setoranError } = await window.supabaseClient
            .from('setoran_harian')
            .select('poin')
            .eq('halaqah_id', halaqahId);

        if (setoranError) throw setoranError;

        const totalPoints = setoranData.reduce((sum, s) => sum + s.poin, 0);

        // Update halaqah
        const { error: updateError } = await window.supabaseClient
            .from('halaqahs')
            .update({
                points: totalPoints,
                updated_at: new Date().toISOString()
            })
            .eq('id', halaqahId);

        if (updateError) throw updateError;

        console.log(`✅ Halaqah ${halaqahId} points updated: ${totalPoints}`);
    } catch (error) {
        console.error('Error updating halaqah points:', error);
    }
}

// Get setoran for specific date range
async function getSetoranByDateRange(startDate, endDate, halaqahId = null) {
    if (!window.supabaseClient && window.initSupabase) await window.initSupabase();
    if (!window.supabaseClient) return [];

    try {
        let query = window.supabaseClient
            .from('setoran_harian')
            .select(`
                *,
                students:santri_id(name, nisn),
                halaqahs:halaqah_id(name)
            `)
            .gte('tanggal', startDate)
            .lte('tanggal', endDate);

        if (halaqahId) {
            query = query.eq('halaqah_id', halaqahId);
        }

        const { data, error } = await query.order('tanggal', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting setoran by date range:', error);
        return [];
    }
}

// Delete setoran (admin only)
async function deleteSetoran(setoranId) {
    if (!window.supabaseClient) return false;

    try {
        // Get setoran info before delete
        const { data: setoran } = await window.supabaseClient
            .from('setoran_harian')
            .select('santri_id, halaqah_id')
            .eq('id', setoranId)
            .single();

        // Delete setoran
        const { error } = await window.supabaseClient
            .from('setoran_harian')
            .delete()
            .eq('id', setoranId);

        if (error) throw error;

        // Update points
        if (setoran) {
            await updateStudentPoints(setoran.santri_id);
            await updateHalaqahPoints(setoran.halaqah_id);
        }

        console.log('✅ Setoran deleted:', setoranId);
        return true;
    } catch (error) {
        console.error('Error deleting setoran:', error);
        return false;
    }
}

// Export functions
window.SetoranHarian = {
    create: createSetoran,
    getHistory: getSetoranHistory,
    getDailyRanking: getDailyRanking,
    getTopSetoranToday: getTopSetoranToday,
    getHalaqahStats: getHalaqahDailyStats,
    getByDateRange: getSetoranByDateRange,
    delete: deleteSetoran,
    updateStudentPoints: updateStudentPoints,
    updateHalaqahPoints: updateHalaqahPoints
};
