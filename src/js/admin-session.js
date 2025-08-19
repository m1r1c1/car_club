/**
 * Admin Session Manager for Ford Model A Club - FIXED VERSION
 * Handles persistent authentication across all admin pages
 * Stores session in localStorage and manages automatic login/logout
 * 
 * FIXES APPLIED:
 * - Removed automatic page reload that caused infinite reload loop
 * - Added proper state management to prevent redirect cycles
 * - Improved error handling and initialization logic
 */

class AdminSessionManager {
    constructor() {
        // Configuration constants for session management
        this.SESSION_KEY = 'model_a_admin_session';
        this.SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        this.ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity before warning
        
        // Current user state
        this.currentUser = null;
        this.sessionExpiry = null;
        this.lastActivity = Date.now();
        
        // Flag to prevent infinite redirects
        this.isInitialized = false;
        
        // Initialize session management
        this.initializeSession();
        this.setupActivityTracking();
    }

    /**
     * Initialize session state when page loads
     * Checks for existing valid session and restores authentication
     * FIXED: No longer triggers automatic redirects that cause reload loops
     */
    initializeSession() {
        // Prevent multiple initializations
        if (this.isInitialized) {
            return this.isAuthenticated();
        }
        
        const savedSession = this.getStoredSession();
        
        // Check if we have a valid stored session
        if (savedSession && this.isSessionValid(savedSession)) {
            // Restore authenticated state
            this.currentUser = savedSession.user;
            this.sessionExpiry = savedSession.expiry;
            this.lastActivity = savedSession.lastActivity || Date.now();
            
            console.log('🔓 Session restored for user:', this.currentUser.username);
            
            // Update last activity and extend session
            this.updateActivity();
            this.isInitialized = true;
            
            return true; // User is authenticated
        } else {
            // No valid session found - clear any corrupted data
            this.clearSession();
            console.log('🔒 No valid session found');
            this.isInitialized = true;
            
            return false; // User needs to login
        }
    }

    /**
     * Handle successful login and create persistent session
     * @param {Object} user - User object with id, username, email, etc.
     * @returns {boolean} - True if session created successfully
     */
    createSession(user) {
        try {
            // Validate user object has required properties
            if (!user || !user.username || !user.id) {
                console.error('❌ Invalid user object provided to createSession');
                return false;
            }
            
            // Create session data with expiration
            const sessionData = {
                user: user,
                loginTime: Date.now(),
                expiry: Date.now() + this.SESSION_TIMEOUT,
                lastActivity: Date.now()
            };
            
            // Store session in localStorage for persistence across pages
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
            
            // Set current state
            this.currentUser = user;
            this.sessionExpiry = sessionData.expiry;
            this.lastActivity = sessionData.lastActivity;
            
            console.log('✅ Session created for user:', user.username);
            
            return true;
        } catch (error) {
            console.error('❌ Error creating session:', error);
            return false;
        }
    }

    /**
     * Check if user is currently authenticated with valid session
     * FIXED: No longer calls logout() which was causing page reloads
     * @returns {boolean} - True if user is authenticated
     */
    isAuthenticated() {
        // Check if we have current user data
        if (!this.currentUser || !this.sessionExpiry) {
            return false;
        }
        
        // Check if session has expired
        if (Date.now() >= this.sessionExpiry) {
            console.log('⏰ Session expired');
            this.clearSession(); // Only clear session, don't reload page
            return false;
        }
        
        // Check for inactivity timeout
        if (Date.now() - this.lastActivity > this.ACTIVITY_TIMEOUT) {
            console.log('💤 Session expired due to inactivity');
            this.showInactivityWarning();
            return false;
        }
        
        return true;
    }

    /**
     * Check if current session data is valid
     * @param {Object} sessionData - Session data from storage
     * @returns {boolean} - True if session is valid
     */
    isSessionValid(sessionData) {
        // Validate session data structure
        if (!sessionData || !sessionData.user || !sessionData.expiry) {
            console.log('❌ Invalid session data structure');
            return false;
        }
        
        // Check if session has expired
        if (Date.now() >= sessionData.expiry) {
            console.log('⏰ Stored session has expired');
            return false;
        }
        
        // Check if user object has required properties
        if (!sessionData.user.username || !sessionData.user.id) {
            console.log('❌ Invalid user data in session');
            return false;
        }
        
        return true;
    }

    /**
     * Retrieve stored session data from localStorage
     * @returns {Object|null} - Session data or null if none exists
     */
    getStoredSession() {
        try {
            const sessionStr = localStorage.getItem(this.SESSION_KEY);
            
            if (!sessionStr) {
                return null;
            }
            
            return JSON.parse(sessionStr);
        } catch (error) {
            console.error('❌ Error parsing stored session:', error);
            // Clear corrupted session data
            localStorage.removeItem(this.SESSION_KEY);
            return null;
        }
    }

    /**
     * Update user activity timestamp and extend session
     * Called whenever user performs an action
     */
    updateActivity() {
        if (this.isAuthenticated()) {
            this.lastActivity = Date.now();
            
            // Update stored session with new activity time
            const sessionData = this.getStoredSession();
            if (sessionData) {
                sessionData.lastActivity = this.lastActivity;
                // Optionally extend session expiry on activity
                sessionData.expiry = Date.now() + this.SESSION_TIMEOUT;
                this.sessionExpiry = sessionData.expiry;
                
                try {
                    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
                } catch (error) {
                    console.error('❌ Error updating session activity:', error);
                }
            }
        }
    }

    /**
     * Clear session data and reset authentication state
     * FIXED: Only clears data, doesn't trigger page reloads
     */
    clearSession() {
        try {
            // Remove from localStorage
            localStorage.removeItem(this.SESSION_KEY);
        } catch (error) {
            console.error('❌ Error removing session from storage:', error);
        }
        
        // Reset state variables
        this.currentUser = null;
        this.sessionExpiry = null;
        this.lastActivity = Date.now();
        
        console.log('🗑️ Session cleared');
    }

    /**
     * Handle user logout
     * FIXED: Removed automatic page reload that caused infinite loops
     * @param {boolean} redirect - Whether to redirect to dashboard after logout
     */
    logout(redirect = false) {
        console.log('👋 User logging out:', this.currentUser?.username);
        
        // Clear session data
        this.clearSession();
        
        // Only redirect if explicitly requested and not already on dashboard
        if (redirect && !window.location.pathname.includes('admin-dashboard.html')) {
            console.log('🔄 Redirecting to dashboard after logout');
            window.location.href = 'admin-dashboard.html';
        } else {
            // If on dashboard, just show login form without reloading
            console.log('📝 Showing login form');
            this.showLoginForm();
        }
    }

    /**
     * Get current authenticated user data
     * @returns {Object|null} - Current user object or null if not authenticated
     */
    getCurrentUser() {
        if (this.isAuthenticated()) {
            return this.currentUser;
        }
        return null;
    }

    /**
     * Check if current page requires authentication
     * @returns {boolean} - True if page requires authentication
     */
    requiresAuthentication() {
        // Check if current page is an admin page
        const adminPages = [
            'admin-dashboard.html',
            'admin-events.html', 
            'admin-news.html',
            'admin-members.html',
            'admin-photos.html',
            'admin-users.html',
            'admin-settings.html'
        ];
        
        const currentPage = window.location.pathname.split('/').pop();
        return adminPages.includes(currentPage) || window.location.pathname.includes('/admin');
    }

    /**
     * Protect current page - show appropriate UI based on authentication
     * FIXED: No longer causes redirects that trigger reload loops
     * Call this function on each admin page to ensure proper UI state
     */
    protectPage() {
        // Only proceed if page requires authentication
        if (!this.requiresAuthentication()) {
            return true; // Page doesn't require auth
        }
        
        // Check if user is authenticated
        if (this.isAuthenticated()) {
            console.log('✅ User authenticated, showing admin content');
            this.showAdminContent();
            return true;
        } else {
            console.log('❌ User not authenticated, showing login form');
            this.showLoginForm();
            return false;
        }
    }

    /**
     * Show login form (only works on admin-dashboard.html)
     * FIXED: Added error handling for missing elements
     */
    showLoginForm() {
        const loginScreen = document.getElementById('loginScreen');
        const adminDashboard = document.getElementById('adminDashboard');
        
        if (loginScreen && adminDashboard) {
            // Show login screen and hide dashboard
            loginScreen.classList.remove('hidden');
            loginScreen.style.display = 'block';
            adminDashboard.classList.add('hidden');
            adminDashboard.style.display = 'none';
            
            console.log('📝 Login form displayed');
        } else {
            // Elements not found - likely not on dashboard page
            console.log('⚠️ Login form elements not found on this page');
        }
    }

    /**
     * Show admin content (only works on admin-dashboard.html)
     * FIXED: Added error handling for missing elements
     */
    showAdminContent() {
        const loginScreen = document.getElementById('loginScreen');
        const adminDashboard = document.getElementById('adminDashboard');
        
        if (loginScreen && adminDashboard) {
            // Hide login screen and show dashboard
            loginScreen.classList.add('hidden');
            loginScreen.style.display = 'none';
            adminDashboard.classList.remove('hidden');
            adminDashboard.style.display = 'block';
            
            // Update user display
            this.updateUserDisplay();
            
            console.log('🏠 Admin content displayed');
        } else {
            // Elements not found - likely not on dashboard page
            console.log('⚠️ Admin content elements not found on this page');
        }
    }

    /**
     * Update user display elements with current user info
     * FIXED: Added error handling for missing elements
     */
    updateUserDisplay() {
        if (this.currentUser) {
            // Update current user display
            const currentUserElement = document.getElementById('currentUser');
            if (currentUserElement) {
                currentUserElement.textContent = this.currentUser.full_name || this.currentUser.username;
            }
            
            // Update any other user-specific elements
            const userElements = document.querySelectorAll('.admin-user-name');
            userElements.forEach(element => {
                element.textContent = this.currentUser.full_name || this.currentUser.username;
            });
            
            console.log('👤 User display updated');
        }
    }

    /**
     * Show inactivity warning to user
     * FIXED: Improved user experience with clearer messaging
     */
    showInactivityWarning() {
        const shouldExtend = confirm(
            'Your session will expire soon due to inactivity.\n\n' +
            'Click OK to extend your session or Cancel to logout.'
        );
        
        if (shouldExtend) {
            // User wants to extend session
            this.updateActivity();
            console.log('⏱️ Session extended by user request');
        } else {
            // User chose to logout - don't redirect automatically
            console.log('⏱️ User chose to logout due to inactivity');
            this.logout(false); // Don't redirect, just clear session
        }
    }

    /**
     * Set up activity tracking to monitor user interaction
     * Automatically updates activity timestamp on user actions
     */
    setupActivityTracking() {
        // Events to track for user activity
        const activityEvents = ['click', 'keypress', 'mousemove', 'scroll', 'touchstart'];
        
        // Throttle activity updates to avoid excessive localStorage writes
        let activityThrottle = false;
        const throttleDelay = 30000; // Update activity at most once per 30 seconds
        
        /**
         * Handle user activity events
         * Only updates if authenticated and not recently updated
         */
        const handleActivity = () => {
            // Only update if authenticated and not recently updated
            if (this.isAuthenticated() && !activityThrottle) {
                this.updateActivity();
                
                // Set throttle to prevent excessive updates
                activityThrottle = true;
                setTimeout(() => {
                    activityThrottle = false;
                }, throttleDelay);
            }
        };
        
        // Add event listeners for activity tracking
        activityEvents.forEach(eventType => {
            document.addEventListener(eventType, handleActivity, { passive: true });
        });
        
        // Also track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Page became visible - update activity
                handleActivity();
            }
        });
        
        console.log('📊 Activity tracking initialized');
    }

    /**
     * Validate that user has required permissions for current page
     * @param {string} requiredRole - Required role (e.g., 'admin', 'editor')
     * @returns {boolean} - True if user has required permissions
     */
    hasPermission(requiredRole = 'admin') {
        if (!this.isAuthenticated()) {
            return false;
        }
        
        // For now, all authenticated users have admin access
        // You can expand this based on your role system
        return this.currentUser.role === requiredRole || this.currentUser.role === 'admin';
    }

    /**
     * Force refresh of session state from localStorage
     * Useful for debugging or manual session recovery
     */
    refreshSession() {
        console.log('🔄 Manually refreshing session state');
        this.isInitialized = false;
        return this.initializeSession();
    }

    /**
     * Get session information for debugging
     * @returns {Object} - Session debug information
     */
    getSessionInfo() {
        return {
            isAuthenticated: this.isAuthenticated(),
            currentUser: this.currentUser,
            sessionExpiry: this.sessionExpiry ? new Date(this.sessionExpiry) : null,
            lastActivity: new Date(this.lastActivity),
            timeUntilExpiry: this.sessionExpiry ? this.sessionExpiry - Date.now() : null,
            isInitialized: this.isInitialized
        };
    }
}

// Create global session manager instance
const adminSession = new AdminSessionManager();

// Make it available globally for other scripts
window.adminSession = adminSession;

// FIXED: Improved auto-protection logic to prevent reload loops
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 AdminSessionManager DOMContentLoaded handler starting');
    
    // Only proceed if this is an admin page
    if (adminSession.requiresAuthentication()) {
        console.log('📋 Admin page detected, checking authentication');
        
        // Simply protect the page without forcing redirects
        const isProtected = adminSession.protectPage();
        
        if (isProtected) {
            console.log('✅ Page protection successful - user authenticated');
        } else {
            console.log('🔒 Page protection applied - login required');
        }
    } else {
        console.log('📄 Non-admin page detected, no protection needed');
    }
    
    console.log('✨ AdminSessionManager initialization complete');
});

// Export for use in ES6 modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminSessionManager;
}
