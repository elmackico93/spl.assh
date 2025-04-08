/**
 * Matrix.css Documentation
 * Main JavaScript file for the Matrix.css documentation site
 */

document.addEventListener('DOMContentLoaded', function() {
    // ===== Navigation System =====
    initMatrixNavigation();
    
    // ===== Matrix Rain Effects =====
    initMatrixRain();
    initNavMatrixRain();
    
    // ===== UI Interactions =====
    initThemeSwitcher();
    initMobileMenu();
    initCopyButtons();
    initSmoothScrolling();
    
    // ===== Advanced Components =====
    initTerminalInteraction();
    initNeuralNetworkVisualizer();
    
    /**
     * Initialize Matrix navigation system with scroll detection
     */
    function initMatrixNavigation() {
        // Navigation configuration - Maps sections to their parent categories
        const navigationMapping = {
            // Getting Started sections
            'introduction': 'getting-started',
            'installation': 'getting-started',
            'colors': 'getting-started', 
            'typography': 'getting-started',
            
            // Components sections
            'buttons': 'components',
            'alerts': 'components',
            'cards': 'components',
            'badges': 'components',
            'progress': 'components',
            'spinners': 'components',
            
            // Advanced Components sections
            'neural-network': 'examples',
            'terminal': 'examples',
            'glitch-text': 'examples',
            'identity-card': 'examples',
            'code-rain': 'examples',

            // Utilities sections
            'effects': 'utilities',
            'animations': 'utilities',
            'transforms': 'utilities',
            'responsive': 'utilities'
        };

        // Set up scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';

        // References to navigation elements
        const navLinks = document.querySelectorAll('.nav-link');
        const sidebarLinks = document.querySelectorAll('.docs-sidebar a');
        const sections = document.querySelectorAll('section[id]');
        const docsContent = document.querySelector('.docs-content');
        const docsSidebar = document.querySelector('.docs-sidebar');
        const mobileMenuToggle = document.getElementById('matrixMenuToggle');
        
        // Calculate header height for scroll offset
        const headerHeight = document.querySelector('.matrix-nav')?.offsetHeight || 70;
        document.documentElement.style.setProperty('--docs-header-height', headerHeight + 'px');

        // Active section tracking
        let activeSection = '';
        
        // Function to update active navigation elements
        function updateActiveNavigation() {
            // Get current scroll position with offset
            const scrollPosition = window.scrollY + headerHeight + 10;
            
            // Find the current active section
            let currentSection = null;
            let lastSectionTop = 0;
            
            // Check each section to find the one currently in view
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                
                // Determine if this section is the one currently in view
                if (scrollPosition >= sectionTop && sectionTop > lastSectionTop) {
                    currentSection = section;
                    lastSectionTop = sectionTop;
                }
            });
            
            // If we found a current section and it's different from the active one
            if (currentSection && currentSection.id !== activeSection) {
                activeSection = currentSection.id;
                
                // Remove active class from all navigation links
                navLinks.forEach(link => link.classList.remove('active'));
                sidebarLinks.forEach(link => link.classList.remove('active'));
                
                // Get parent section ID from mapping
                const parentSection = navigationMapping[activeSection] || activeSection;
                
                // Update main navigation link
                const mainNavLink = document.querySelector(`.nav-link[href="#${parentSection}"]`);
                if (mainNavLink) {
                    mainNavLink.classList.add('active');
                    
                    // Optional: Create a "digital pulse" effect for the active link
                    mainNavLink.classList.add('pulse');
                    setTimeout(() => {
                        mainNavLink.classList.remove('pulse');
                    }, 500);
                }
                
                // Update sidebar link for specific section
                const sidebarLink = document.querySelector(`.docs-sidebar a[href="#${activeSection}"]`);
                if (sidebarLink) {
                    sidebarLink.classList.add('active');
                    
                    // Optional: Scroll sidebar to show active link
                    if (docsSidebar) {
                        const linkRect = sidebarLink.getBoundingClientRect();
                        const sidebarRect = docsSidebar.getBoundingClientRect();
                        
                        if (linkRect.top < sidebarRect.top || linkRect.bottom > sidebarRect.bottom) {
                            sidebarLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                }
                
                // Additionally, check if current section is relevant to sidebar
                const isSidebarRelevant = currentSection.hasAttribute('data-sidebar') ? 
                                         currentSection.getAttribute('data-sidebar') === 'true' : 
                                         false;
                                         
                // Update sidebar visibility based on relevance
                const sidebar = document.querySelector('.docs-sidebar');
                if (sidebar) {
                    if (isSidebarRelevant) {
                        sidebar.style.display = '';
                    } else {
                        // Optional: hide sidebar for irrelevant sections
                        // sidebar.style.display = 'none';
                    }
                }
                
                // Optional: Update URL hash without scrolling
                if (history.replaceState) {
                    history.replaceState(null, null, `#${activeSection}`);
                }
            }
        }
        
        // Add click event for sidebar links to handle mobile view
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Close sidebar on mobile if it's open
                if (window.innerWidth <= 992) {
                    const sidebar = document.querySelector('.docs-sidebar');
                    const backdrop = document.querySelector('.sidebar-backdrop');
                    
                    if (sidebar && sidebar.classList.contains('active')) {
                        sidebar.classList.remove('active');
                        if (backdrop) backdrop.classList.remove('active');
                    }
                }
                
                // Smooth scroll to section with offset for header
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    e.preventDefault(); // Prevent default anchor behavior
                    
                    // Calculate position to scroll to (accounting for header)
                    const yOffset = -headerHeight - 20; // Extra padding for comfort
                    const y = targetSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    
                    // Scroll to target
                    window.scrollTo({
                        top: y,
                        behavior: 'smooth'
                    });
                    
                    // Update URL hash
                    if (history.pushState) {
                        history.pushState(null, null, `#${targetId}`);
                    } else {
                        location.hash = `#${targetId}`;
                    }
                }
            });
        });
        
        // Apply "active" class to navigation based on current URL hash on page load
        function setInitialActiveSection() {
            const hash = window.location.hash;
            if (hash) {
                const sectionId = hash.substring(1);
                const section = document.getElementById(sectionId);
                
                if (section) {
                    activeSection = sectionId;
                    
                    // Set active classes
                    const parentSection = navigationMapping[sectionId] || sectionId;
                    const mainNavLink = document.querySelector(`.nav-link[href="#${parentSection}"]`);
                    const sidebarLink = document.querySelector(`.docs-sidebar a[href="${hash}"]`);
                    
                    if (mainNavLink) mainNavLink.classList.add('active');
                    if (sidebarLink) sidebarLink.classList.add('active');
                }
            }
        }
        
        // Setup matrix-style scroll progress indicator
        function setupScrollProgressIndicator() {
            // Create progress element
            const progressIndicator = document.createElement('div');
            progressIndicator.className = 'matrix-scroll-progress';
            progressIndicator.innerHTML = `
                <div class="progress-track">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-text">0%</div>
            `;
            document.body.appendChild(progressIndicator);
            
            // Update progress on scroll
            window.addEventListener('scroll', function() {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrollPercent = (scrollTop / scrollHeight) * 100;
                
                const progressFill = document.querySelector('.progress-fill');
                const progressText = document.querySelector('.progress-text');
                
                if (progressFill && progressText) {
                    progressFill.style.height = `${scrollPercent}%`;
                    progressText.textContent = `${Math.round(scrollPercent)}%`;
                }
            });
        }
        
        // Initialize the enhanced sidebar positioning system
        initSidebarPositioning();
        
        // Set up resize handling
        window.addEventListener('resize', function() {
            // Update header height variable on resize
            const newHeaderHeight = document.querySelector('.matrix-nav')?.offsetHeight || 70;
            document.documentElement.style.setProperty('--docs-header-height', newHeaderHeight + 'px');
        });
        
        // Initialize navigation features
        setupScrollProgressIndicator();
        setInitialActiveSection();
        
        // Add scroll event listener to update active navigation
        window.addEventListener('scroll', updateActiveNavigation);
        
        // Initial call to set active navigation
        updateActiveNavigation();
    }
    
    /**
     * Initialize Enhanced Sidebar Positioning
     * Controls sidebar position based on scroll position relative to header and footer
     */
    function initSidebarPositioning() {
        const sidebar = document.querySelector('.docs-sidebar');
        if (!sidebar) return;
        
        // Wrap sidebar content in a container for positioning
        const sidebarContent = sidebar.innerHTML;
        sidebar.innerHTML = `<div class="sidebar-content">${sidebarContent}</div>`;
        
        // Wrap the docs-layout section to allow absolute positioning
        const docsLayout = document.querySelector('.docs-layout');
        if (docsLayout) {
            // Create a wrapper element
            const wrapper = document.createElement('div');
            wrapper.className = 'sidebar-wrapper';
            
            // Move docsLayout's parent node's children into wrapper
            docsLayout.parentNode.insertBefore(wrapper, docsLayout);
            wrapper.appendChild(docsLayout);
        }
        
        // Elements for positioning calculation
        const header = document.querySelector('.matrix-nav');
        const footer = document.querySelector('.site-footer');
        const sidebarParent = sidebar.parentElement;
        
        // Store initial measurements
        let headerHeight = header ? header.offsetHeight : 0;
        let sidebarTop = sidebar.getBoundingClientRect().top + window.scrollY;
        let footerTop = footer ? footer.getBoundingClientRect().top + window.scrollY : Infinity;
        let sidebarHeight = sidebar.offsetHeight;
        
        // Define content sections that are relevant to sidebar
        const relevantSections = [
            'getting-started',
            'layout',
            'components',
            'utilities',
            'examples'
        ];
        
        // Find the bottom of the last relevant section
        function getRelevantContentBottom() {
            let lastSectionBottom = 0;
            
            relevantSections.forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section) {
                    const sectionBottom = section.getBoundingClientRect().top + 
                                        window.scrollY + 
                                        section.offsetHeight;
                    lastSectionBottom = Math.max(lastSectionBottom, sectionBottom);
                }
            });
            
            // If we didn't find relevant sections, use footer position
            return lastSectionBottom || (footerTop - 50);
        }
        
        // Update sidebar position on scroll
        function updateSidebarPosition() {
            // Recalculate positions (they may change on window resize)
            headerHeight = header ? header.offsetHeight : 0;
            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;
            
            // Update footer position (may change as content loads)
            footerTop = footer ? footer.getBoundingClientRect().top + window.scrollY : Infinity;
            
            // Get bottom of relevant content
            const relevantContentBottom = getRelevantContentBottom();
            
            // Get sidebar dimensions
            sidebarHeight = sidebar.offsetHeight;
            
            // Determine sidebar position:
            if (scrollY < sidebarTop - headerHeight) {
                // 1. Above header - normal flow
                sidebar.classList.remove('sidebar-fixed', 'sidebar-absolute');
            } 
            else if (scrollY + headerHeight + sidebarHeight < relevantContentBottom) {
                // 2. Between header and footer - fixed position
                sidebar.classList.add('sidebar-fixed');
                sidebar.classList.remove('sidebar-absolute');
                sidebar.style.top = `${headerHeight}px`;
            } 
            else {
                // 3. At footer - absolute position from bottom
                sidebar.classList.add('sidebar-absolute');
                sidebar.classList.remove('sidebar-fixed');
                
                // Calculate position from bottom of relevant content
                const bottomOffset = document.body.offsetHeight - relevantContentBottom;
                sidebar.style.bottom = `${bottomOffset}px`;
                sidebar.style.top = 'auto';
            }
        }
        
        // Handle resize events - recalculate measurements
        function handleResize() {
            // Reset sidebar to normal flow to get natural dimensions
            sidebar.classList.remove('sidebar-fixed', 'sidebar-absolute');
            
            // Recalculate positions after reset
            sidebarTop = sidebar.getBoundingClientRect().top + window.scrollY;
            footerTop = footer ? footer.getBoundingClientRect().top + window.scrollY : Infinity;
            sidebarHeight = sidebar.offsetHeight;
            
            // Update position
            updateSidebarPosition();
        }
        
        // Add event listeners
        window.addEventListener('scroll', updateSidebarPosition);
        window.addEventListener('resize', handleResize);
        
        // Initialize position
        setTimeout(updateSidebarPosition, 100); // Small delay to ensure DOM is ready
    }
    
    /**
     * Initialize Matrix Rain animation
     */
    function initMatrixRain() {
        const canvas = document.getElementById('matrixRain');
        if (!canvas) return;
        
        // Matrix rain implementation from original code
        // This function would contain all the Matrix rain animation code
    }

    /**
     * Initialize Matrix Rain for the navigation
     */
    function initNavMatrixRain() {
        const canvas = document.getElementById('matrixNavRain');
        if (!canvas) return;
        
        // Nav Matrix rain implementation from original code
        // This function would contain all the nav Matrix rain animation code
    }
    
    /**
     * Initialize theme switcher functionality
     */
    function initThemeSwitcher() {
        const themeSwitch = document.getElementById('themeSwitch');
        if (!themeSwitch) return;
        
        // Theme switcher implementation from original code
        // This function would contain all the theme switching code
    }
    
    /**
     * Initialize mobile menu
     */
    function initMobileMenu() {
        const menuToggle = document.getElementById('matrixMenuToggle');
        const linksContainer = document.querySelector('.nav-links-container');
        const sidebar = document.querySelector('.docs-sidebar');
        const backdrop = document.querySelector('.sidebar-backdrop');
        
        // Mobile menu implementation from original code
        // This function would contain all the mobile menu handling code
    }
    
    /**
     * Initialize copy buttons for code snippets
     */
    function initCopyButtons() {
        const copyButtons = document.querySelectorAll('.copy-button');
        
        // Copy buttons implementation from original code
        // This function would contain all the code copy functionality
    }
    
    /**
     * Initialize smooth scrolling for anchor links
     */
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            // Smooth scrolling implementation from original code
            // This function would contain all the smooth scrolling code
        });
    }
    
    /**
     * Initialize Terminal component interactions
     */
    function initTerminalInteraction() {
        // Implementation for terminal component
    }
    
    /**
     * Initialize Neural Network Visualizer
     */
    function initNeuralNetworkVisualizer() {
        // Implementation for neural network visualizer
    }
    
    // Add other functions from original scripts as needed
});
