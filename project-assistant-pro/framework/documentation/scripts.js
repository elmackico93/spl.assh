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
     * Initialize Matrix Rain animation
     */
    function initMatrixRain() {
        const canvas = document.getElementById('matrixRain');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Make canvas full-screen
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Characters to be used in the rain (including katakana for the Matrix feel)
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,./<>?~あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";
        
        // Set font and color
        const fontSize = 16;
        ctx.font = fontSize + 'px monospace';
        
        // Calculate columns
        const columns = Math.ceil(canvas.width / fontSize);
        
        // Array to track the y-coordinate of each column
        const drops = [];
        
        // Initialize all columns to start at random positions
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.floor(Math.random() * -canvas.height);
        }
        
        // Drawing function
        function draw() {
            // Add semi-transparent black rectangle on top of previous frame
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Set text color to matrix green
            ctx.fillStyle = '#00ff41';
            
            // Loop through each column
            for (let i = 0; i < drops.length; i++) {
                // Get random character
                const char = chars[Math.floor(Math.random() * chars.length)];
                
                // Occasionally add a brighter character (glowing effect)
                if (Math.random() < 0.05) {
                    ctx.fillStyle = '#00ff97'; // Brighter green
                    ctx.shadowColor = 'rgba(0, 255, 65, 0.8)';
                    ctx.shadowBlur = 10;
                } else {
                    ctx.fillStyle = '#00ff41'; // Regular matrix green
                    ctx.shadowBlur = 0;
                }
                
                // Draw character
                ctx.fillText(char, i * fontSize, drops[i]);
                
                // Move drop down
                drops[i] += fontSize;
                
                // Reset drop to top with randomization when it reaches bottom
                if (drops[i] > canvas.height && Math.random() > 0.975) {
                    drops[i] = Math.floor(Math.random() * -100);
                }
            }
            
            // Call animation recursively
            requestAnimationFrame(draw);
        }
        
        // Handle window resize
        window.addEventListener('resize', function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Recalculate columns
            const newColumns = Math.ceil(canvas.width / fontSize);
            
            // Adjust drops array
            if (newColumns > columns) {
                // Add new columns
                for (let i = drops.length; i < newColumns; i++) {
                    drops[i] = Math.floor(Math.random() * -canvas.height);
                }
            }
            
            // Reset font size
            ctx.font = fontSize + 'px monospace';
        });
        
        // Start animation
        draw();
    }

    /**
     * Initialize Matrix Rain for the navigation
     */
    function initNavMatrixRain() {
        const canvas = document.getElementById('matrixNavRain');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Canvas dimensions match container
        function resizeCanvas() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Matrix rain characters
        const matrixChars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
        
        // Rain setup
        const fontSize = 12;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = [];
        
        // Initialize drops
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.floor(Math.random() * -20);
        }
        
        // Draw matrix rain
        function draw() {
            // Semi-transparent fade effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Green text
            ctx.fillStyle = '#00ff41';
            ctx.font = fontSize + 'px monospace';
            
            // Draw each droplet
            for (let i = 0; i < drops.length; i++) {
                // Random character
                const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
                
                // Drawing position
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                
                // Random brightness
                if (Math.random() < 0.1) {
                    ctx.fillStyle = '#00ff97';
                } else {
                    ctx.fillStyle = '#00ff41';
                }
                
                // Draw the character
                ctx.fillText(char, x, y);
                
                // Move drop
                drops[i]++;
                
                // Reset to top with randomness
                if (y > canvas.height && Math.random() > 0.98) {
                    drops[i] = Math.floor(Math.random() * -20);
                }
            }
            
            // Loop animation
            requestAnimationFrame(draw);
        }
        
        // Start drawing
        draw();
    }
    
    /**
     * Initialize theme switcher functionality
     */
    function initThemeSwitcher() {
        const themeSwitch = document.getElementById('themeSwitch');
        if (!themeSwitch) return;
        
        // Check if user has a saved preference
        const savedTheme = localStorage.getItem('matrixTheme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            
            // Update button text
            themeSwitch.innerHTML = savedTheme === 'light' 
                ? '<div class="m-badge m-badge-primary">D</div>' 
                : '<div class="m-badge m-badge-primary">L</div>';
        }
        
        // Add click event
        themeSwitch.addEventListener('click', function() {
            const currentTheme = document.body.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            // Update theme
            document.body.setAttribute('data-theme', newTheme);
            
            // Save preference
            localStorage.setItem('matrixTheme', newTheme);
            
            // Update button text
            this.innerHTML = newTheme === 'light' 
                ? '<div class="m-badge m-badge-primary">D</div>' 
                : '<div class="m-badge m-badge-primary">L</div>';
            
            // Add animation effect
            document.body.classList.add('theme-transition');
            setTimeout(() => {
                document.body.classList.remove('theme-transition');
            }, 1000);
        });
    }
    
    /**
     * Initialize mobile menu
     */
    function initMobileMenu() {
        const menuToggle = document.getElementById('matrixMenuToggle');
        const linksContainer = document.querySelector('.nav-links-container');
        const sidebar = document.querySelector('.docs-sidebar');
        const backdrop = document.querySelector('.sidebar-backdrop');
        
        if (menuToggle && linksContainer) {
            menuToggle.addEventListener('click', function() {
                this.classList.toggle('active');
                linksContainer.classList.toggle('active');
                
                // Prevent body scrolling when menu is open
                if (linksContainer.classList.contains('active')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            });
        }
        
        // Mobile sidebar functionality
        if (backdrop) {
            backdrop.addEventListener('click', function() {
                if (sidebar) sidebar.classList.remove('active');
                backdrop.classList.remove('active');
            });
        }
        
        // Toggle sidebar on mobile
        document.addEventListener('click', function(e) {
            const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
            
            if (mobileMenuToggle && mobileMenuToggle.contains(e.target)) {
                if (sidebar) {
                    sidebar.classList.toggle('active');
                    if (backdrop) backdrop.classList.toggle('active');
                }
            }
        });
    }
    
    /**
     * Initialize copy buttons for code snippets
     */
    function initCopyButtons() {
        const copyButtons = document.querySelectorAll('.copy-button');
        
        copyButtons.forEach(button => {
            button.addEventListener('click', function() {
                const codeBlock = this.nextElementSibling.querySelector('code');
                if (!codeBlock) return;
                
                const textToCopy = codeBlock.textContent;
                
                // Use modern clipboard API with fallback
                try {
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        // Visual feedback
                        const originalText = this.textContent;
                        const originalBg = this.style.backgroundColor;
                        
                        this.textContent = 'Copied!';
                        this.style.backgroundColor = 'var(--m-success)';
                        this.style.color = 'var(--m-bg)';
                        
                        setTimeout(() => {
                            this.textContent = originalText;
                            this.style.backgroundColor = originalBg;
                            this.style.color = '';
                        }, 2000);
                    });
                } catch (err) {
                    // Fallback
                    const textarea = document.createElement('textarea');
                    textarea.value = textToCopy;
                    textarea.style.position = 'fixed';
                    document.body.appendChild(textarea);
                    textarea.select();
                    
                    try {
                        document.execCommand('copy');
                        
                        // Visual feedback
                        const originalText = this.textContent;
                        this.textContent = 'Copied!';
                        setTimeout(() => {
                            this.textContent = originalText;
                        }, 2000);
                    } catch (e) {
                        console.error('Failed to copy: ', e);
                        this.textContent = 'Failed!';
                        setTimeout(() => {
                            this.textContent = 'Copy';
                        }, 2000);
                    }
                    
                    document.body.removeChild(textarea);
                }
            });
        });
    }
    
    /**
     * Initialize smooth scrolling for anchor links
     */
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    
                    // Close mobile menu if open
                    const navLinksContainer = document.querySelector('.nav-links-container');
                    const matrixMenuToggle = document.getElementById('matrixMenuToggle');
                    
                    if (navLinksContainer && navLinksContainer.classList.contains('active')) {
                        navLinksContainer.classList.remove('active');
                        if (matrixMenuToggle) matrixMenuToggle.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                    
                    // Calculate header height for offset
                    const headerHeight = document.querySelector('.matrix-nav')?.offsetHeight || 0;
                    
                    // Smooth scroll with offset
                    const yOffset = -headerHeight - 20; // Extra padding
                    const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    
                    window.scrollTo({
                        top: y,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without jump
                    history.pushState(null, null, targetId);
                    
                    // Add highlight effect to target
                    targetElement.classList.add('highlight-target');
                    setTimeout(() => {
                        targetElement.classList.remove('highlight-target');
                    }, 2000);
                }
            });
        });
    }
    
    /**
     * Initialize Terminal component interactions
     */
    function initTerminalInteraction() {
        // Implement terminal interactions
        // For brevity, this function implementation is omitted but would contain
        // all terminal component interactivity
    }
    
    /**
     * Initialize Neural Network Visualizer
     */
    function initNeuralNetworkVisualizer() {
        // Implement neural network visualizations
        // For brevity, this function implementation is omitted but would contain
        // all neural network visualization code
    }
});