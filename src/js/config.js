// ===== FORD MODEL A CLUB - SHARED CONFIGURATION =====
// This file contains all configuration settings for the website and admin panel
// Update your Supabase credentials here and they will be used across all pages

// ===== SUPABASE DATABASE CONFIGURATION =====
// Replace these with your actual Supabase project credentials
// You can find these in your Supabase Dashboard > Settings > API
const CONFIG = {
    // Your Supabase project URL (format: https://your-project-id.supabase.co)
    SUPABASE_URL: 'https://ndoqsbvsgfokkygqvole.supabase.co',
    
    // Your Supabase anon/public key (starts with 'eyJ')
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kb3FzYnZzZ2Zva2t5Z3F2b2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTA2NTAsImV4cCI6MjA3MTAyNjY1MH0._tMhn6v3pvyC7W6VnvVOm3Pr4Fnq5e-vt4My6jorR3w',
    
    // Website configuration
    SITE_NAME: 'Ford Model A Club',
    SITE_DESCRIPTION: 'Ford Model A enthusiasts community',
    
    // Admin configuration
    ADMIN_EMAIL: 'admin@modelaclub.org',
    
    // Demo mode settings (used when Supabase is not configured)
    DEMO_MODE: {
        enabled: true, // Set to false in production
        adminUsername: 'admin',
        adminPassword: 'demo123'
    },
    
    // Club information
    CLUB_INFO: {
        name: 'Ford Model A Club',
        foundedYear: 1985,
        meetingLocation: 'Community Center',
        meetingAddress: '123 Main Street, Your City, ST 12345',
        meetingTime: 'Third Saturday of each month, 10:00 AM',
        contactEmail: 'info@modelaclub.org',
        contactPhone: '(555) 123-4567'
    },
    
    // Social media links
    SOCIAL_MEDIA: {
        facebook: '#',
        instagram: '#',
        youtube: '#',
        email: 'info@modelaclub.org'
    }
};

// ===== CONFIGURATION FUNCTIONS =====

// Function to check if Supabase credentials are configured
function isSupabaseConfigured() {
    return CONFIG.SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL' && 
           CONFIG.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY' &&
           CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY;
}

// Function to initialize Supabase client (call this in each HTML file)
function initializeSupabase() {
    if (isSupabaseConfigured() && window.supabase) {
        return window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    } else {
        console.warn('Supabase not configured or not loaded. Running in demo mode.');
        return null;
    }
}

// Function to get demo credentials for admin login
function getDemoCredentials() {
    return {
        username: CONFIG.DEMO_MODE.adminUsername,
        password: CONFIG.DEMO_MODE.adminPassword
    };
}

// Function to log configuration status
function logConfigStatus() {
    console.log('🔧 Ford Model A Club Configuration:');
    console.log('📊 Supabase:', isSupabaseConfigured() ? 'Configured' : 'Demo Mode');
    console.log('🏢 Club:', CONFIG.CLUB_INFO.name);
    console.log('📧 Contact:', CONFIG.CLUB_INFO.contactEmail);
    
    if (!isSupabaseConfigured()) {
        console.warn('⚠️  SETUP REQUIRED: Configure your Supabase credentials in config.js');
        console.warn('🔑 Demo login:', getDemoCredentials());
    }
}

// ===== UTILITY FUNCTIONS =====

// Function to format dates consistently across the application
function formatDate(dateString, options = {}) {
    const defaultOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const finalOptions = { ...defaultOptions, ...options };
    return new Date(dateString).toLocaleDateString('en-US', finalOptions);
}

// Function to format times consistently across the application
function formatTime(timeString) {
    if (!timeString) return 'Time not set';
    const time = new Date(`1970-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });
}

// Function to get membership pricing
function getMembershipPricing() {
    return {
        individual: { price: 45, label: 'Individual ($45/year)' },
        family: { price: 65, label: 'Family ($65/year)' },
        student: { price: 25, label: 'Student ($25/year)' }
    };
}

// Function to get event types
function getEventTypes() {
    return [
        { value: 'meeting', label: 'Club Meeting' },
        { value: 'tour', label: 'Tour/Drive' },
        { value: 'workshop', label: 'Workshop' },
        { value: 'show', label: 'Car Show' },
        { value: 'social', label: 'Social Event' },
        { value: 'other', label: 'Other' }
    ];
}

// Function to handle errors consistently across the application
function handleError(error, context = 'Operation') {
    console.error(`${context} error:`, error);
    
    // In production, you might want to send errors to a logging service
    // Example: sendToLogService(error, context);
    
    return `${context} failed. Please try again or contact support if the problem persists.`;
}

// Function to show loading state
function showLoadingState(container, message = 'Loading...') {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #8b4513; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 1rem; color: #666;">${message}</p>
            </div>
        `;
    }
}

// Function to validate email addresses
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to sanitize user input
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove basic HTML tags
        .substring(0, 1000); // Limit length
}

// Function to get time ago format
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInDays > 0) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

// Function to generate demo data for testing
function generateDemoData() {
    return {
        events: [
            {
                id: 1,
                title: 'Monthly Club Meeting',
                description: 'Join us for our monthly gathering featuring a tech talk on carburetor maintenance.',
                event_date: '2025-09-16',
                event_time: '10:00',
                location: 'Community Center',
                event_type: 'meeting',
                rsvp_required: true,
                max_attendees: null,
                created_at: '2025-08-01T10:00:00'
            },
            {
                id: 2,
                title: 'Fall Scenic Drive',
                description: 'Experience autumn colors on our annual fall tour through scenic country roads.',
                event_date: '2025-10-08',
                event_time: '09:00',
                location: 'Town Square',
                event_type: 'tour',
                rsvp_required: true,
                max_attendees: 25,
                created_at: '2025-08-05T14:30:00'
            }
        ],
        
        members: [
            {
                id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@email.com',
                phone: '555-0123',
                membership_type: 'individual',
                model_a_owned: true,
                model_year: '1929',
                body_style: 'Tudor Sedan',
                experience_level: 'intermediate',
                status: 'pending',
                join_date: '2025-08-15',
                created_at: '2025-08-15T10:00:00'
            },
            {
                id: 2,
                first_name: 'Jane',
                last_name: 'Smith',
                email: 'jane@email.com',
                phone: '555-0124',
                membership_type: 'family',
                model_a_owned: false,
                model_year: null,
                body_style: null,
                experience_level: 'beginner',
                status: 'active',
                join_date: '2025-07-20',
                created_at: '2025-07-20T14:30:00'
            }
        ],
        
        news: [
            {
                id: 1,
                title: 'Welcome New Members!',
                content: "We're excited to welcome 5 new members this month to our Model A family.",
                author: 'John Smith',
                publish_date: '2025-08-15',
                is_featured: false,
                created_at: '2025-08-15T09:00:00'
            },
            {
                id: 2,
                title: 'Parts Swap Meet Success',
                content: 'Thanks to everyone who participated in last weekend\'s parts swap meet.',
                author: 'Mike Johnson',
                publish_date: '2025-08-10',
                is_featured: true,
                created_at: '2025-08-10T16:00:00'
            }
        ],
        
        photos: [
            {
                id: 1,
                title: '1928 Tudor Sedan',
                description: 'Beautiful restored Tudor Sedan owned by club member',
                image_url: '',
                thumbnail_url: '',
                is_featured: false,
                upload_date: '2025-08-15',
                created_at: '2025-08-15T12:00:00'
            }
        ]
    };
}

// Export configuration and functions for use in other files
// This allows the config to be used in both browser and potential Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        isSupabaseConfigured,
        initializeSupabase,
        getDemoCredentials,
        logConfigStatus,
        formatDate,
        formatTime,
        getMembershipPricing,
        getEventTypes,
        handleError,
        showLoadingState,
        isValidEmail,
        sanitizeInput,
        getTimeAgo,
        generateDemoData
    };
}

// Initialize and log configuration status when this file loads
document.addEventListener('DOMContentLoaded', function() {
    logConfigStatus();
});
