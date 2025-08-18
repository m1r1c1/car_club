// Updated initialization for ALL admin pages
document.addEventListener('DOMContentLoaded', function() {
    // Check for existing session first
    if (checkExistingSession()) {
        console.log('Using existing session');
        return; // User already logged in, skip login setup
    }
    
    // Only set up login form if no existing session
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        showDebugInfo(); // Only for dashboard
    }
    
    console.log('Admin page loaded - please log in');
});
