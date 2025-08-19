/**
 * Header and Footer Component Loader
 * This script automatically loads shared header and footer components into any page
 * 
 * USAGE:
 * 1. Include this script in your HTML pages
 * 2. Add containers with IDs 'header-container' and 'footer-container'
 * 3. The script will automatically load the header.html and footer.html files
 * 
 * REQUIREMENTS:
 * - Must be served through a web server (not file:// protocol)
 * - header.html and footer.html files must be in the same directory or adjust paths below
 */

/**
 * Configuration object for component paths
 * Modify these paths if your header/footer files are in different locations
 */
const COMPONENT_CONFIG = {
    headerPath: 'header.html',      // Path to header component file
    footerPath: 'footer.html',      // Path to footer component file
    headerContainerId: 'header-container',  // ID of container for header
    footerContainerId: 'footer-container'   // ID of container for footer
};

/**
 * Load external HTML component into specified container
 * This function fetches an HTML file and inserts it into a DOM element
 * 
 * @param {string} componentPath - Path to the HTML component file
 * @param {string} containerId - ID of the container element to load content into
 * @param {string} componentName - Name of component for error reporting
 * @returns {Promise<boolean>} - Returns true if successful, false if failed
 */
async function loadHTMLComponent(componentPath, containerId, componentName) {
    try {
        // Find the container element where we'll insert the component
        const container = document.getElementById(containerId);
        
        // Check if container exists on the page
        if (!container) {
            console.warn(`Container with ID '${containerId}' not found. Skipping ${componentName} load.`);
            return false;
        }
        
        // Show loading indicator while fetching component
        container.innerHTML = `<div class="loading-component">Loading ${componentName}...</div>`;
        
        // Fetch the HTML component file from server
        const response = await fetch(componentPath);
        
        // Check if the fetch request was successful
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Get the HTML content from the response
        const htmlContent = await response.text();
        
        // Insert the loaded HTML into the container
        container.innerHTML = htmlContent;
        
        return true;
        
    } catch (error) {
        // Handle any errors that occur during loading
        console.error(`❌ Error loading ${componentName} from ${componentPath}:`, error);
        
        // Show fallback content if component fails to load
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="component-error">
                    <p>Unable to load ${componentName}. Please refresh the page.</p>
                    <small>Error: ${error.message}</small>
                </div>
            `;
        }
        
        return false;
    }
}

/**
 * Load all shared components (header and footer)
 * This function coordinates loading multiple components and handles dependencies
 * 
 * @returns {Promise<void>}
 */
async function loadAllComponents() {
    
    // Track which components loaded successfully
    const loadResults = {
        header: false,
        footer: false
    };
    
    // Load header and footer components in parallel for better performance
    const [headerLoaded, footerLoaded] = await Promise.all([
        loadHTMLComponent(
            COMPONENT_CONFIG.headerPath, 
            COMPONENT_CONFIG.headerContainerId, 
            'header'
        ),
        loadHTMLComponent(
            COMPONENT_CONFIG.footerPath, 
            COMPONENT_CONFIG.footerContainerId, 
            'footer'
        )
    ]);
    
    loadResults.header = headerLoaded;
    loadResults.footer = footerLoaded;
    
    // Log overall loading results
    const successCount = Object.values(loadResults).filter(Boolean).length;
    const totalComponents = Object.keys(loadResults).length;
    
    // Initialize any component-specific functionality after loading
    initializeComponentFeatures();
}

/**
 * Initialize features that depend on loaded components
 * This function sets up event listeners and functionality that requires the components to be loaded
 */
function initializeComponentFeatures() {
    // Initialize mobile menu functionality if header is loaded
    if (document.querySelector('.mobile-menu-toggle')) {
        setupMobileMenu();
    }
    
    // Initialize smooth scrolling for navigation links
    if (document.querySelector('.nav-menu')) {
        setupSmoothScrolling();
    }
    
    // Initialize scroll effects for header
    if (document.querySelector('.header')) {
        setupScrollEffects();
    }
    
    // Load next meeting date in footer if element exists
    if (document.getElementById('nextMeeting')) {
        updateNextMeetingDate();
    }
}

/**
 * Setup mobile menu toggle functionality
 * Handles opening/closing the mobile navigation menu
 */
function setupMobileMenu() {
    // Make toggleMobileMenu function globally available
    window.toggleMobileMenu = function() {
        const menu = document.querySelector('.nav-menu');
        const button = document.querySelector('.mobile-menu-toggle');
        
        if (!menu || !button) return;
        
        // Toggle active class to show/hide mobile menu
        menu.classList.toggle('active');
        
        // Change hamburger icon to X when menu is open
        const icon = button.querySelector('i');
        if (icon) {
            if (menu.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        }
    };
    
    // Close mobile menu when clicking on menu links
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            const menu = document.querySelector('.nav-menu');
            const button = document.querySelector('.mobile-menu-toggle');
            const icon = button?.querySelector('i');
            
            if (menu && icon) {
                // Close menu and reset icon
                menu.classList.remove('active');
                icon.className = 'fas fa-bars';
            }
        });
    });
}

/**
 * Setup smooth scrolling for navigation links
 * Provides smooth scroll behavior when clicking anchor links
 */
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                // Calculate offset to account for fixed header
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                // Smooth scroll to target position
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Setup scroll effects for header
 * Adds visual effects to header when user scrolls
 */
function setupScrollEffects() {
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        
        if (header) {
            // Add blur and transparency effect when scrolled
            if (window.scrollY > 100) {
                header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.backgroundColor = '#ffffff';
                header.style.backdropFilter = 'none';
            }
        }
    });
}

/**
 * Update next meeting date in footer
 * This is a placeholder - would connect to your actual data source
 */
function updateNextMeetingDate() {
    const nextMeetingElement = document.getElementById('nextMeeting');
    
    if (nextMeetingElement) {
        // In a real implementation, this would fetch from your database
        // For now, showing a default message
        nextMeetingElement.innerHTML = 'Saturday, September 16th<br>10:00 AM at Community Center';
    }
}

/**
 * Handle component loading errors gracefully
 * Provides fallback functionality when components fail to load
 * 
 * @param {Error} error - The error that occurred
 * @param {string} context - Context where the error occurred
 */
function handleComponentError(error, context) {
    console.error(`Component loading error in ${context}:`, error);
    
    // In production, you might want to:
    // - Send error reports to a monitoring service
    // - Show user-friendly fallback content
    // - Attempt to reload components
    
    // Show a minimal error notification to users
    const errorNotification = document.createElement('div');
    errorNotification.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #f44336;
        color: white;
        padding: 10px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 9999;
        max-width: 300px;
    `;
    errorNotification.textContent = `Unable to load page components. Please refresh.`;
    
    document.body.appendChild(errorNotification);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
        if (errorNotification.parentNode) {
            errorNotification.parentNode.removeChild(errorNotification);
        }
    }, 5000);
}

/**
 * Check if the page is being served over HTTP/HTTPS
 * Components cannot load using file:// protocol
 * 
 * @returns {boolean} - True if served properly, false if using file protocol
 */
function checkProtocol() {
    if (location.protocol === 'file:') {
        console.error('🚫 Components cannot load using file:// protocol. Please serve this page through a web server.');
        console.info('💡 Try using Live Server extension in VS Code, or run: python -m http.server 8000');
        return false;
    }
    return true;
}

/**
 * Initialize component loading when DOM is ready
 * This is the main entry point that starts the component loading process
 */
document.addEventListener('DOMContentLoaded', function() {
    
    // Check if page is being served properly
    if (!checkProtocol()) {
        handleComponentError(
            new Error('Invalid protocol - must use HTTP/HTTPS'), 
            'protocol check'
        );
        return;
    }
    
    // Start loading all components
    loadAllComponents().catch(error => {
        handleComponentError(error, 'component loading');
    });
});

// Make key functions globally available for debugging
window.CarClubComponents = {
    loadAllComponents,
    loadHTMLComponent,
    COMPONENT_CONFIG
};
