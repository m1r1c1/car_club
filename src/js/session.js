// ===== SESSION MANAGEMENT =====

// Function to save login session
function saveAdminSession(adminUser) {
    sessionStorage.setItem('adminUser', JSON.stringify(adminUser));
    sessionStorage.setItem('adminLoginTime', Date.now().toString());
}

// Function to get saved session
function getAdminSession() {
    const adminUser = sessionStorage.getItem('adminUser');
    const loginTime = sessionStorage.getItem('adminLoginTime');
    
    if (!adminUser || !loginTime) {
        return null;
    }
    
    // Check if session is expired (24 hours)
    const sessionAge = Date.now() - parseInt(loginTime);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (sessionAge > maxAge) {
        clearAdminSession();
        return null;
    }
    
    return JSON.parse(adminUser);
}

// Function to clear session
function clearAdminSession() {
    sessionStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminLoginTime');
}

// Function to check if user is already logged in
function checkExistingSession() {
    const savedSession = getAdminSession();
    
    if (savedSession) {
        console.log('Found existing admin session:', savedSession.username);
        currentAdminUser = savedSession;
        
        // Hide login screen and show dashboard
        const loginScreen = document.getElementById('loginScreen');
        const adminDashboard = document.getElementById('adminDashboard');
        
        if (loginScreen && adminDashboard) {
            loginScreen.classList.add('hidden');
            adminDashboard.classList.remove('hidden');
            
            // Update user display
            const currentUserEl = document.getElementById('currentUser');
            if (currentUserEl) {
                currentUserEl.textContent = savedSession.full_name || savedSession.username;
            }
            
            // Load page-specific data
            loadPageData();
        }
        
        return true;
    }
    
    return false;
}

// Updated showDashboard function to save session
function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    document.getElementById('currentUser').textContent = currentAdminUser.full_name || currentAdminUser.username;
    
    // Save session
    saveAdminSession(currentAdminUser);
    
    // Load dashboard data
    loadPageData();
}

// Updated logout function to clear session
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('User logged out');
        clearAdminSession();
        currentAdminUser = null;
        
        // Redirect to dashboard login
        window.location.href = 'admin-dashboard.html';
    }
}

// Function to load page-specific data (override in each page)
function loadPageData() {
    // This will be different for each admin page
    // Dashboard: loadDashboardStats(), loadRecentActivity()
    // Events: loadEvents()
    // Members: loadMembers()
    console.log('Loading page data...');
}
