// Authentication Module

let currentUser = null;
let currentProfile = null;
let currentUserChild = null;

// Check if user is logged in
async function checkAuth() {
    // PUBLIC MODE: Allow access without login
    // Dashboard is public, login only required for specific actions

    // Wait for Supabase client to initialize
    let retries = 0;
    while (!window.supabaseClient && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
    }

    if (!window.supabaseClient) {
        console.log('Running in public mode (no authentication)');

        // Check for local session fallback
        const localUser = localStorage.getItem('localCurrentUser');
        if (localUser) {
            try {
                currentUser = JSON.parse(localUser);
                console.log('Restored local session:', currentUser.name);

                // Create mock profile for local user
                currentProfile = {
                    id: currentUser.id,
                    email: currentUser.email,
                    full_name: currentUser.name || currentUser.email.split('@')[0],
                    role: currentUser.role || 'ortu',
                    is_active: true
                };

                if (currentProfile.role === 'ortu') {
                    refreshUserChildLink();
                }

                updateUIBasedOnRole();
                return;
            } catch (e) {
                console.error('Error parsing local session:', e);
                localStorage.removeItem('localCurrentUser');
            }
        }

        currentUser = null;
        currentProfile = null;
        showPublicUI();
        return; // Continue without auth
    }

    // Check for local session first (priority over Supabase check if offline/mixed)
    const localUser = localStorage.getItem('localCurrentUser');
    if (localUser) {
        try {
            currentUser = JSON.parse(localUser);
            // Create mock profile for local user
            currentProfile = {
                id: currentUser.id,
                email: currentUser.email,
                full_name: currentUser.name || currentUser.email.split('@')[0],
                role: currentUser.role || 'ortu',
                is_active: true
            };

            if (currentProfile.role === 'ortu') {
                refreshUserChildLink();
            }
            updateUIBasedOnRole();
            return;
        } catch (e) {
            localStorage.removeItem('localCurrentUser');
        }
    }

    const { data: { session } } = await window.supabaseClient.auth.getSession();

    if (session) {
        currentUser = session.user;
        await loadUserProfile();
        // Cari data anak jika role adalah orang tua
        if (currentProfile && currentProfile.role === 'ortu') {
            refreshUserChildLink();
        }
        updateUIBasedOnRole();
    } else {
        // No session - public mode
        console.log('Public mode: Dashboard accessible without login');
        currentUser = null;
        currentProfile = null;
        showPublicUI();
    }
}

// Load user profile with role
async function loadUserProfile() {
    try {
        const { data, error } = await window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (error) {
            // If profile doesn't exist, create a default one
            if (error.code === 'PGRST116') {
                console.log('Profile not found, creating default profile...');
                const { data: newProfile, error: createError } = await window.supabaseClient
                    .from('profiles')
                    .insert({
                        id: currentUser.id,
                        email: currentUser.email,
                        full_name: currentUser.email.split('@')[0],
                        role: 'ortu',
                        is_active: true
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error('Error creating profile:', createError);
                    // Continue without profile
                    currentProfile = null;
                    return;
                }

                currentProfile = newProfile;
                updateUIBasedOnRole();
                return;
            }

            console.error('Error loading profile:', error);
            currentProfile = null;
            return;
        }

        currentProfile = data;
        updateUIBasedOnRole();
    } catch (err) {
        console.error('Unexpected error loading profile:', err);
        currentProfile = null;
    }
}

// Login function
async function login(rawInput, rawPassword) {
    try {
        // Normalize inputs
        const input = String(rawInput).trim();
        const password = String(rawPassword).trim();

        let email = input;

        // Cek apakah input hanya berisi angka (asumsi NIK)
        if (/^\d+$/.test(input)) {
            // Untuk login NIK, kita gunakan email dummy
            email = `${input}@sekolah.id`;
            console.log(`[DEBUG] Attempting NIK login for: ${input} -> ${email}`);

            // Verifikasi format password tanggal lahir (DDMMYYYY)
            if (!/^\d{8}$/.test(password)) {
                throw new Error('Format password harus tanggal lahir (DDMMYYYY)');
            }
        } else {
            // Jika bukan NIK, validasi format email
            if (!input.includes('@')) {
                throw new Error('Format email tidak valid');
            }
        }

        // Try Supabase Login first
        let supabaseSuccess = false;

        if (window.supabaseClient) {
            try {
                console.log(`[DEBUG] Calling Supabase signInWithPassword for ${email}`);
                console.log(`[DEBUG] Password length: ${password.length}`);

                const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                console.log('[DEBUG] Supabase response:', { data, error });

                if (!error && data?.user) {
                    console.log('[DEBUG] Supabase Login Success');
                    currentUser = data.user;
                    await loadUserProfile();
                    showApp();
                    showNotification('✅ Login berhasil!', 'success');
                    supabaseSuccess = true;
                    return;
                } else if (error) {
                    console.log('[DEBUG] Supabase Login Failed with error:', error);
                    console.log('[DEBUG] Error code:', error.code);
                    console.log('[DEBUG] Error message:', error.message);
                    console.log('[DEBUG] Error status:', error.status);

                    // Check if this is a login attempt with NIK/Default Password
                    // If login fails but credentials match student data, assume first-time login -> Auto Register
                    if (/^\d+$/.test(input)) {
                        console.log('Login failed (400), attempting NIK recovery for:', input);

                        // Normalize input
                        const nikInput = String(input).trim();

                        // 1. Try finding in local data
                        let student = null;
                        if (dashboardData && dashboardData.students) {
                            student = dashboardData.students.find(s =>
                                String(s.nik).trim() === nikInput ||
                                String(s.nisn).trim() === nikInput
                            );
                        }

                        // 2. Fallback: Try finding in Supabase directly (if not found locally)
                        if (!student && window.supabaseClient) {
                            console.log('Student not found locally, querying Supabase directly...');
                            try {
                                // Use maybeSingle() to avoid 406 error if not found
                                // Also try with both quoted (string) and unquoted (numeric) format just in case
                                const { data, error } = await window.supabaseClient
                                    .from('students')
                                    .select('*')
                                    .or(`nik.eq."${nikInput}",nisn.eq."${nikInput}",nik.eq.${nikInput},nisn.eq.${nikInput}`)
                                    .maybeSingle();

                                if (error) {
                                    console.warn('Error querying student direct:', error.message);
                                } else if (data) {
                                    console.log('Student found in Supabase:', data.name);
                                    student = data;
                                } else {
                                    console.log('Student not found in Supabase (result is null).');
                                }
                            } catch (err) {
                                console.error('Exception querying student:', err);
                            }
                        }

                        if (student) {
                            console.log('Student identified:', student.name);

                            if (student.tanggal_lahir) {
                                // Robust Date Parsing
                                let day, month, year;
                                if (student.tanggal_lahir.includes('-')) {
                                    // YYYY-MM-DD
                                    const parts = student.tanggal_lahir.split('-');
                                    if (parts[0].length === 4) {
                                        [year, month, day] = parts;
                                    } else {
                                        // DD-MM-YYYY
                                        [day, month, year] = parts;
                                    }
                                } else if (student.tanggal_lahir.includes('/')) {
                                    // DD/MM/YYYY or MM/DD/YYYY
                                    const parts = student.tanggal_lahir.split('/');
                                    // Assume DD/MM/YYYY for ID locale
                                    [day, month, year] = parts;
                                }

                                // Ensure padding
                                if (day && month && year) {
                                    day = day.toString().padStart(2, '0');
                                    month = month.toString().padStart(2, '0');
                                    year = year.toString();

                                    const birthDatePass = `${day}${month}${year}`;

                                    // If password matches birth date (Default Password)
                                    if (password === birthDatePass) {
                                        console.log('Credentials valid. Registering account...');
                                        showNotification('🔄 Mendaftarkan akun baru...', 'info');

                                        const { data: signUpData, error: signUpError } = await window.supabaseClient.auth.signUp({
                                            email: email,
                                            password: password,
                                            options: {
                                                data: {
                                                    full_name: student.name,
                                                    role: 'ortu',
                                                    student_id: student.id,
                                                    nik: student.nik
                                                }
                                            }
                                        });

                                        if (!signUpError && signUpData?.user) {
                                            currentUser = signUpData.user;

                                            // Ensure profile is created
                                            await new Promise(r => setTimeout(r, 1000));
                                            await loadUserProfile();

                                            showApp();
                                            showNotification('✅ Akun berhasil dibuat & Login berhasil!', 'success');
                                            supabaseSuccess = true;
                                            return;
                                        } else {
                                            console.warn('Auto-registration failed:', signUpError?.message);
                                            if (signUpError?.message?.includes('already registered')) {
                                                // Retry login if already registered (race condition)
                                                const { data: retryData, error: retryError } = await window.supabaseClient.auth.signInWithPassword({
                                                    email: email,
                                                    password: password
                                                });
                                                if (!retryError && retryData?.user) {
                                                    currentUser = retryData.user;
                                                    await loadUserProfile();
                                                    showApp();
                                                    showNotification('✅ Login berhasil!', 'success');
                                                    supabaseSuccess = true;
                                                    return;
                                                }
                                                throw new Error('Password salah atau akun bermasalah.');
                                            }
                                        }
                                    } else {
                                        console.log('Password mismatch. Input:', password, 'Expected:', birthDatePass);
                                        // Throw specific error to inform user
                                        throw new Error(`Password salah. Gunakan Tanggal Lahir (DDMMYYYY).`);
                                    }
                                }
                            } else {
                                console.log('Student found but no tanggal_lahir in DB');
                                throw new Error('Data tanggal lahir kosong. Hubungi Admin.');
                            }
                        } else {
                            console.log('No student found with this NIK.');
                            throw new Error('NIK tidak ditemukan dalam database santri.');
                        }
                    }

                    // If not handled by auto-reg, throw original error
                    throw error;
                }
            } catch (err) {
                console.warn('Supabase login failed:', err.message);
                // Don't return here, let it fall through to local fallback
            }
        }

        if (!supabaseSuccess) {
            // Fallback: Check Local Storage Users
            console.log('Checking local users...');
            const savedUsers = localStorage.getItem('usersData');
            let localUserFound = false;

            if (savedUsers) {
                try {
                    const localData = JSON.parse(savedUsers);
                    const users = localData.users || [];

                    const user = users.find(u => {
                        const emailMatch = u.email.toLowerCase() === email.toLowerCase();
                        const passwordMatch = u.password === password;
                        return emailMatch && passwordMatch && u.status === 'active';
                    });

                    if (user) {
                        loginAsUser(user);
                        localUserFound = true;
                        return;
                    }
                } catch (e) {
                    console.error('Error checking local users:', e);
                }
            }

            // Fallback 2: Check Student Data (Login via NIK & Tanggal Lahir)
            if (!localUserFound && /^\d+$/.test(input) && dashboardData && dashboardData.students) {
                console.log('Checking student data for NIK login...');
                // Normalize input
                const nikInput = String(input).trim();
                const student = dashboardData.students.find(s =>
                    String(s.nik).trim() === nikInput ||
                    String(s.nisn).trim() === nikInput
                );

                if (student && student.tanggal_lahir) {
                    // Robust Date Parsing
                    let day, month, year;
                    if (student.tanggal_lahir.includes('-')) {
                        // YYYY-MM-DD
                        const parts = student.tanggal_lahir.split('-');
                        if (parts[0].length === 4) {
                            [year, month, day] = parts;
                        } else {
                            // DD-MM-YYYY
                            [day, month, year] = parts;
                        }
                    } else if (student.tanggal_lahir.includes('/')) {
                        // DD/MM/YYYY or MM/DD/YYYY
                        const parts = student.tanggal_lahir.split('/');
                        // Assume DD/MM/YYYY for ID locale
                        [day, month, year] = parts;
                    }

                    if (day && month && year) {
                        day = day.toString().padStart(2, '0');
                        month = month.toString().padStart(2, '0');
                        year = year.toString();

                        const birthDatePass = `${day}${month}${year}`;

                        if (password === birthDatePass) {
                            console.log('Student found, logging in as parent of:', student.name);

                            // Create virtual parent user
                            const virtualUser = {
                                id: 'parent_' + student.id,
                                email: `${input}@sekolah.id`,
                                name: `Wali Santri ${student.name}`,
                                role: 'ortu',
                                childId: student.id, // Special field to link directly
                                status: 'active'
                            };

                            // Try to register to Supabase in background for next time
                            if (window.supabaseClient) {
                                window.supabaseClient.auth.signUp({
                                    email: virtualUser.email,
                                    password: password,
                                    options: { data: { full_name: student.name, role: 'ortu', student_id: student.id, nik: student.nik } }
                                }).then(({ data, error }) => {
                                    if (!error && data?.user) console.log('Background registration success');
                                });
                            }

                            loginAsUser(virtualUser);
                            return;
                        } else {
                            console.log('Local fallback: Password mismatch', password, birthDatePass);
                        }
                    }
                }
            }

            // If all fail
            showNotification('❌ Login gagal: Email/NIK atau Password salah', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('❌ ' + error.message, 'error');
    }
}

function loginAsUser(user) {
    console.log('User logged in:', user.name);

    // Set current user
    currentUser = user;
    localStorage.setItem('localCurrentUser', JSON.stringify(user));

    // Create mock profile
    currentProfile = {
        id: user.id,
        email: user.email,
        full_name: user.name,
        role: user.role,
        is_active: true
    };

    if (user.childId) {
        // If directly linked to a child (Virtual Parent)
        currentUserChild = dashboardData.students.find(s => s.id == user.childId);
    } else if (currentProfile.role === 'ortu') {
        refreshUserChildLink();
    }

    updateUIBasedOnRole();
    showApp();
    showNotification('✅ Login berhasil!', 'success');
}

// Signup function
async function signup(email, password, fullName, role = 'ortu') {
    try {
        const { data, error } = await window.supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    role: role
                }
            }
        });

        if (error) throw error;

        showNotification('✅ Registrasi berhasil! Silakan cek email untuk verifikasi.', 'success');
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('❌ Registrasi gagal: ' + error.message, 'error');
    }
}

// Logout function
async function logout() {
    try {
        // Clear local session
        localStorage.removeItem('localCurrentUser');

        if (window.supabaseClient) {
            const { error } = await window.supabaseClient.auth.signOut();
            if (error) console.warn('Supabase logout error:', error);
        }

        currentUser = null;
        currentProfile = null;
        currentUserChild = null;

        // Reload page to show public dashboard
        showNotification('👋 Logout berhasil - Kembali ke dashboard publik', 'info');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        console.error('Logout error:', error);
        // Force logout locally anyway
        localStorage.removeItem('localCurrentUser');
        window.location.reload();
    }
}

// Show login page
function showLoginPage() {
    document.body.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-teal/10 flex items-center justify-center p-4">
            <div class="max-w-md w-full">
                <!-- Logo & Title -->
                <div class="text-center mb-8">
                    <div class="inline-flex p-4 bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl shadow-2xl shadow-primary-200 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h1 class="font-display font-extrabold text-3xl text-slate-900 mb-2">REKAP SETORAN</h1>
                    <p class="text-sm text-slate-600">Dashboard Poin Halaqah</p>
                </div>
                
                <!-- Login Form -->
                <div class="glass rounded-3xl p-8 shadow-2xl border border-slate-200">
                    <div class="mb-6 text-center">
                        <h2 class="text-xl font-bold text-slate-800">Login Aplikasi</h2>
                        <p class="text-sm text-slate-500">Masuk menggunakan Email atau NIK Santri</p>
                    </div>
                    
                    <!-- Login Form -->
                    <form id="loginForm" onsubmit="handleLogin(event)" class="space-y-4">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">NIK / Email</label>
                            <input type="text" name="email" required 
                                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="Masukkan NIK atau Email">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">Password</label>
                            <input type="password" name="password" required 
                                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="Tanggal Lahir (DDMMYYYY) atau Password">
                        </div>
                        
                        <button type="submit" 
                            class="w-full bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
                            🔐 Masuk
                        </button>
                    </form>
                    
                    <div class="mt-6 pt-6 border-t border-slate-200">
                        <p class="text-xs text-slate-500 text-center">
                            Butuh bantuan? Hubungi Admin
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Show main app
function showApp() {
    location.reload(); // Reload to show main app
}

// Update UI based on role
function updateUIBasedOnRole() {
    const sidebar = document.querySelector('aside');
    const existingUserInfo = sidebar?.querySelector('.user-info-section');
    if (existingUserInfo) existingUserInfo.remove();

    if (!currentProfile && !currentUser) {
        // Public/Guest Mode - no login
        // This is handled by showPublicUI() function
        return;
    }

    if (!currentProfile) {
        // Logged in but no profile yet
        return;
    }

    // Hide "Masuk Dashboard" button when logged in
    const loginSidebarBtn = document.querySelector('[data-sidebar-section="login"]');
    if (loginSidebarBtn) {
        if (loginSidebarBtn.tagName === 'BUTTON' || loginSidebarBtn.tagName === 'A') {
            loginSidebarBtn.style.display = 'none';
            // Also hide parent wrapper if it exists and only contains this button (optional, but safer to just hide button)
            if (loginSidebarBtn.parentElement.classList.contains('border-t')) {
                loginSidebarBtn.parentElement.style.display = 'none';
            }
        }
    }

    const role = currentProfile.role;

    // Hide admin-only features for non-admin
    if (role !== 'admin') {
        // Hide admin settings
        document.querySelectorAll('[onclick*="showAdminSettings"]').forEach(el => {
            el.style.display = 'none';
        });

        // Hide sidebar admin items
        const usersBtn = document.getElementById('sidebar-users');
        if (usersBtn) usersBtn.style.display = 'none';

        const settingsBtn = document.getElementById('sidebar-settings');
        if (settingsBtn) settingsBtn.parentElement.style.display = 'none';

        // Hide delete buttons
        document.querySelectorAll('[onclick*="confirmDelete"]').forEach(el => {
            el.style.display = 'none';
        });

        // Hide import/export for ortu and guru
        if (role === 'ortu' || role === 'guru') {
            document.querySelectorAll('[onclick*="Import"], [onclick*="Export"]').forEach(el => {
                el.style.display = 'none';
            });
        }

        // Logic for Ortu (Parent) - Find their child
        refreshUserChildLink();
    } else {
        currentUserChild = null;

        // SHOW admin features
        document.querySelectorAll('[onclick*="showAdminSettings"]').forEach(el => {
            el.style.display = 'block'; // Or 'flex' depending on layout, ensuring visibility
            // Reset parent visibility if hidden
            if (el.parentElement.style.display === 'none') {
                el.parentElement.style.display = 'block';
            }
        });

        const usersBtn = document.getElementById('sidebar-users');
        if (usersBtn) usersBtn.style.display = 'flex'; // sidebar items are flex

        const settingsBtn = document.getElementById('sidebar-settings');
        if (settingsBtn) {
            settingsBtn.parentElement.style.display = 'block';
        }

        // Show delete buttons
        document.querySelectorAll('[onclick*="confirmDelete"]').forEach(el => {
            el.style.display = 'inline-block';
        });

        // Show import/export
        document.querySelectorAll('[onclick*="Import"], [onclick*="Export"]').forEach(el => {
            el.style.display = 'inline-flex';
        });
    }

    // Show user info in sidebar
    const userInfo = `
        <div class="user-info-section p-4 bg-emerald-800/50 rounded-xl border border-emerald-700/50 backdrop-blur-sm">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20">
                    ${currentProfile.full_name.charAt(0).toUpperCase()}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-bold text-sm text-white truncate">${currentProfile.full_name}</div>
                    <div class="text-xs text-emerald-200/70">${getRoleLabel(role)}</div>
                </div>
            </div>
            <button onclick="logout()" class="w-full mt-3 px-3 py-2 bg-emerald-900/50 text-emerald-100 rounded-lg text-sm font-semibold hover:bg-emerald-900 transition-colors border border-emerald-700/30">
                🚪 Logout
            </button>
        </div>
    `;

    // Add to sidebar
    if (sidebar) {
        const firstChild = sidebar.querySelector('.p-6');
        if (firstChild) {
            firstChild.insertAdjacentHTML('beforeend', userInfo);
        }
    }
}

// Helper to link parent to student
function refreshUserChildLink() {
    if (!currentUser || !currentProfile || currentProfile.role !== 'ortu') {
        currentUserChild = null;
        return;
    }

    const nikOrNisn = currentUser.email.split('@')[0];

    // 1. Try to find student by NIK or NISN (Exact Match)
    let student = dashboardData.students.find(s =>
        (s.nik && s.nik === nikOrNisn) ||
        (s.nisn && s.nisn === nikOrNisn)
    );

    // 2. If not found, try fuzzy match by name (using email prefix)
    if (!student) {
        const emailPrefix = nikOrNisn.toLowerCase();
        // Exact name match first
        student = dashboardData.students.find(s => s.name.toLowerCase() === emailPrefix);

        // Then contains match
        if (!student) {
            student = dashboardData.students.find(s => s.name.toLowerCase().includes(emailPrefix));
        }
    }

    if (student) {
        currentUserChild = student;
        console.log('Parent logged in. Linked to student:', student.name);
    } else {
        console.warn('Parent logged in but no matching student found for ID:', nikOrNisn);
        currentUserChild = null;
    }
}

// Export for external use
window.refreshUserChildLink = refreshUserChildLink;

// Helper to get current user's lembaga (for filtering)
function getUserLembaga() {
    if (!currentProfile) return null; // Public/Guest sees all (or restricted elsewhere)

    // Admin & Guru sees all
    if (currentProfile.role === 'admin' || currentProfile.role === 'guru') return null;

    // Parent: Get from linked child
    if (currentProfile.role === 'ortu') {
        if (currentUserChild) {
            return currentUserChild.lembaga;
        }
        // If parent but no child linked yet, strict security: return 'NONE' or similar to show nothing?
        // Or default to 'MTA'? Let's return a special value.
        return 'RESTRICTED_NO_CHILD';
    }

    return null;
}
window.getUserLembaga = getUserLembaga;

function getRoleLabel(role) {
    const labels = {
        'admin': '👑 Administrator',
        'guru': '👨‍🏫 Guru Halaqah',
        'ortu': '👨‍👩‍👧 Orang Tua'
    };
    return labels[role] || role;
}

// Handle login form
function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    login(formData.get('email'), formData.get('password'));
}

// Handle signup form
function handleSignup(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    signup(
        formData.get('email'),
        formData.get('password'),
        formData.get('fullName'),
        formData.get('role')
    );
}

// Switch auth tabs
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(btn => {
        btn.classList.remove('border-primary-600', 'text-primary-600');
        btn.classList.add('border-transparent', 'text-slate-500');
    });

    document.getElementById(`tab-${tab}`).classList.add('border-primary-600', 'text-primary-600');
    document.getElementById(`tab-${tab}`).classList.remove('border-transparent', 'text-slate-500');

    if (tab === 'login') {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('signupForm').classList.add('hidden');
    } else {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('signupForm').classList.remove('hidden');
    }
}

// Check permission
function hasPermission(action) {
    if (!currentProfile) return false;

    const role = currentProfile.role;

    const permissions = {
        'admin': ['view', 'create', 'edit', 'delete', 'manage_users', 'manage_settings'],
        'guru': ['view', 'create'],
        'ortu': ['view']
    };

    return permissions[role]?.includes(action) || false;
}

// Export functions
window.checkAuth = checkAuth;
window.login = login;
window.signup = signup;
window.logout = logout;
window.showLoginPage = showLoginPage;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.switchAuthTab = switchAuthTab;
window.hasPermission = hasPermission;
window.currentUser = () => currentUser;
window.currentProfile = () => currentProfile;
window.getCurrentUserChild = () => currentUserChild;
window.showPublicUI = showPublicUI;


// Show public UI (no login required)
function showPublicUI() {
    console.log('📊 Public Dashboard Mode - Real-time monitoring');

    // Hide admin/sensitive features
    document.querySelectorAll('[onclick*="showAdminSettings"]').forEach(el => {
        el.style.display = 'none';
    });

    document.querySelectorAll('[onclick*="confirmDelete"]').forEach(el => {
        el.style.display = 'none';
    });

    document.querySelectorAll('[onclick*="Import"], [onclick*="Export"]').forEach(el => {
        el.style.display = 'none';
    });

    // Hide user management in sidebar
    const usersBtn = document.getElementById('sidebar-users');
    if (usersBtn) usersBtn.style.display = 'none';

    // Hide settings in sidebar
    const settingsBtn = document.getElementById('sidebar-settings');
    if (settingsBtn) settingsBtn.parentElement.style.display = 'none';

    // Hide user management in burger menu
    document.querySelectorAll('[onclick*="scrollToSection(\'users\')"]').forEach(el => {
        el.style.display = 'none';
    });

    // Hide settings in burger menu
    document.querySelectorAll('[onclick*="scrollToSection(\'settings\')"]').forEach(el => {
        el.style.display = 'none';
    });

    // Add login button to header
    const header = document.querySelector('header .max-w-7xl');
    if (header && !document.getElementById('public-login-btn')) {
        const loginBtn = document.createElement('button');
        loginBtn.id = 'public-login-btn';
        loginBtn.onclick = showLoginPage;
        loginBtn.className = 'px-4 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-colors text-sm shadow-lg';
        loginBtn.innerHTML = '🔐 Login';
        header.appendChild(loginBtn);
    }

    // Add public mode badge to sidebar
    const sidebar = document.querySelector('aside .p-6');
    if (sidebar && !document.getElementById('public-mode-badge')) {
        const badge = document.createElement('div');
        badge.id = 'public-mode-badge';
        badge.className = 'mb-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm';
        badge.innerHTML = `
            <div class="text-center mb-3">
                <div class="text-2xl mb-2">📊</div>
                <div class="text-xs font-bold text-green-800 mb-1">Mode Dashboard Publik</div>
                <div class="text-xs text-green-600">Monitoring real-time tanpa login</div>
            </div>
            <button onclick="showLoginPage()" class="w-full px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg text-sm font-bold hover:from-primary-500 hover:to-primary-600 transition-all shadow-lg shadow-primary-200">
                🔐 Login
            </button>
        `;
        sidebar.insertBefore(badge, sidebar.firstChild);
    }
}
