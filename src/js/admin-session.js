/**
 * Admin Session Manager for Ford Model A Club
 * Handles persistent authentication across all admin pages
 * Stores session in localStorage and manages automatic login/logout
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
        
        // Initialize session management
        this.initializeSession();
        this.setupActivityTracking();
    }

    /**
     * Initialize session state when page loads
     * Checks for existing valid session and restores authentication
     */
    initializeSession() {
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
            
            return true; // User is authenticated
        } else {
            // No valid session found
            this.clearSession();
            console.log('🔒 No valid session found');
            
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
            this.clearSession();
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
                
                localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
            }
        }
    }

    /**
     * Clear session data and reset authentication state
     */
    clearSession() {
        // Remove from localStorage
        localStorage.removeItem(this.SESSION_KEY);
        
        // Reset state variables
        this.currentUser = null;
        this.sessionExpiry = null;
        this.lastActivity = Date.now();
        
        console.log('🗑️ Session cleared');
    }

    /**
     * Handle user logout
     * Clears session and optionally redirects to login
     * @param {boolean} redirect - Whether to redirect to dashboard after logout
     */
    logout(redirect = true) {
        console.log('👋 User logging out:', this.currentUser?.username);
        
        // Clear session data
        this.clearSession();
        
        // Redirect to main admin dashboard if requested
        if (redirect && window.location.pathname !== '/admin-dashboard.html') {
            window.location.href = 'admin-dashboard.html';
        } else if (redirect) {
            // If already on dashboard, just reload to show login form
            window.location.reload();
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
     * Protect current page - redirect to login if not authenticated
     * Call this function on each admin page to ensure authentication
     */
    protectPage() {
        if (this.requiresAuthentication() && !this.isAuthenticated()) {
            console.log('🚫 Access denied - redirecting to login');
            
            // If not on dashboard, redirect there for login
            if (window.location.pathname !== '/admin-dashboard.html') {
                window.location.href = 'admin-dashboard.html';
                return false;
            }
            
            // If on dashboard, ensure login form is shown
            this.showLoginForm();
            return false;
        }
        
        // User is authenticated or page doesn't require auth
        return true;
    }

    /**
     * Show login form (only works on admin-dashboard.html)
     */
    showLoginForm() {
        const loginScreen = document.getElementById('loginScreen');
        const adminDashboard = document.getElementById('adminDashboard');
        
        if (loginScreen && adminDashboard) {
            loginScreen.classList.remove('hidden');
            adminDashboard.classList.add('hidden');
        }
    }

    /**
     * Show admin content (only works on admin-dashboard.html)
     */
    showAdminContent() {
        const loginScreen = document.getElementById('loginScreen');
        const adminDashboard = document.getElementById('adminDashboard');
        
        if (loginScreen && adminDashboard) {
            loginScreen.classList.add('hidden');
            adminDashboard.classList.remove('hidden');
        }
        
        // Update user display
        this.updateUserDisplay();
    }

    /**
     * Update user display elements with current user info
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
        }
    }

    /**
     * Show inactivity warning to user
     */
    showInactivityWarning() {
        const shouldExtend = confirm(
            'Your session will expire soon due to inactivity. ' +
            'Click OK to extend your session or Cancel to logout.'
        );
        
        if (shouldExtend) {
            // User wants to extend session
            this.updateActivity();
            console.log('⏱️ Session extended by user request');
        } else {
            // User chose to logout
            this.logout();
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
}

// Create global session manager instance
const adminSession = new AdminSessionManager();

// Make it available globally for other scripts
window.adminSession = adminSession;

// Auto-protect page if it's an admin page
document.addEventListener('DOMContentLoaded', function() {
    // Check if current page requires authentication
    if (adminSession.requiresAuthentication()) {
        const isAuthenticated = adminSession.protectPage();
        
        if (isAuthenticated) {
            console.log('✅ User authenticated, showing admin content');
            
            // If on dashboard page, show admin content
            if (window.location.pathname.includes('admin-dashboard.html')) {
                adminSession.showAdminContent();
            }
        } else {
            console.log('❌ Authentication required');
        }
    }
});

// Export for use in ES6 modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminSessionManager;
}
