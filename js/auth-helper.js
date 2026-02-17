// ============================================
// AUTH HELPER FUNCTIONS
// ============================================

/**
 * Create Supabase Auth account for imported user
 * @param {Object} userData - User data from import
 * @param {string} userData.email - User email
 * @param {string} userData.name - User full name
 * @param {string} userData.role - User role (guru, ortu, etc)
 * @param {string} password - Password for the account (default: anhaq2026)
 * @returns {Promise<Object>} Result with success status and data/error
 */
async function createAuthAccountForUser(userData, password = 'anhaq2026') {
    try {
        const { email, name, role } = userData;

        console.log(`[AUTH CREATE] Creating account for: ${email}`);

        // Sign up user via Supabase Auth
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name,
                    role: role
                },
                emailRedirectTo: window.location.origin
            }
        });

        if (error) {
            // Check if user already exists
            if (error.message.includes('already registered') || error.message.includes('already exists')) {
                console.log(`[AUTH CREATE] ⚠️ User already exists: ${email}`);
                return { success: false, skipped: true, email, error: 'User already exists' };
            }

            console.error(`[AUTH CREATE] ❌ Error creating account for ${email}:`, error);
            return { success: false, skipped: false, email, error: error.message };
        }

        console.log(`[AUTH CREATE] ✅ Account created for: ${email}`);
        return { success: true, skipped: false, email, data };

    } catch (error) {
        console.error('[AUTH CREATE] Exception:', error);
        return { success: false, skipped: false, email: userData.email, error: error.message };
    }
}

/**
 * Batch create auth accounts with rate limiting and retry logic
 * @param {Array} users - Array of user data objects
 * @param {string} password - Default password for all users
 * @param {Function} progressCallback - Callback for progress updates
 * @returns {Promise<Object>} Results summary
 */
async function batchCreateAuthAccounts(users, password = 'anhaq2026', progressCallback = null) {
    const results = {
        success: [],
        failed: [],
        skipped: [],
        total: users.length
    };

    console.log(`[AUTH BATCH] Starting batch creation for ${users.length} users...`);
    console.log(`[AUTH BATCH] Using 3-second delay between requests to avoid rate limits`);

    for (let i = 0; i < users.length; i++) {
        const user = users[i];

        // Progress callback
        if (progressCallback) {
            progressCallback({
                current: i + 1,
                total: users.length,
                email: user.email
            });
        }

        // Create account with retry logic
        let result = null;
        let retries = 0;
        const maxRetries = 3;

        while (retries <= maxRetries) {
            result = await createAuthAccountForUser(user, password);

            // Check if rate limited
            if (!result.success && result.error &&
                (result.error.includes('rate limit') || result.error.includes('429'))) {

                retries++;
                if (retries <= maxRetries) {
                    const waitTime = Math.pow(2, retries) * 5000; // Exponential backoff: 10s, 20s, 40s
                    console.log(`[AUTH BATCH] ⏳ Rate limited for ${user.email}, waiting ${waitTime / 1000}s before retry ${retries}/${maxRetries}...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                    console.log(`[AUTH BATCH] ❌ Max retries reached for ${user.email}`);
                    break;
                }
            } else {
                // Success or non-rate-limit error, break retry loop
                break;
            }
        }

        // Categorize result
        if (result.success) {
            results.success.push(result.email);
        } else if (result.skipped) {
            results.skipped.push(result.email);
        } else {
            results.failed.push({ email: result.email, error: result.error });
        }

        // Rate limiting: delay between requests (3 seconds)
        // Increased from 1s to avoid hitting Supabase rate limits
        if (i < users.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    console.log(`[AUTH BATCH] Complete - ${results.success.length} created, ${results.skipped.length} skipped, ${results.failed.length} failed`);

    return results;
}

/**
 * Check if email already has Supabase Auth account
 * Note: This requires admin privileges
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} True if account exists
 */
async function checkAuthAccountExists(email) {
    try {
        // Check in profiles table (linked to auth.users)
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('email')
            .eq('email', email)
            .limit(1);

        if (error) {
            console.error('[AUTH CHECK] Error checking account:', error);
            return false;
        }

        return data && data.length > 0;
    } catch (error) {
        console.error('[AUTH CHECK] Exception:', error);
        return false;
    }
}

// Export functions to window
window.createAuthAccountForUser = createAuthAccountForUser;
window.batchCreateAuthAccounts = batchCreateAuthAccounts;
window.checkAuthAccountExists = checkAuthAccountExists;
