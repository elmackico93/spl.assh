/**
    * Matrix Documentation UI Effects & Interactions
    * Fully vanilla JavaScript with maximum browser compatibility
    */
document.addEventListener('DOMContentLoaded', function() {
    // ===== 1. Matrix Rain Animation =====
    function initMatrixRain() {
        var canvas = document.getElementById('matrixRain');
        if (!canvas) return;
        
        var ctx = canvas.getContext('2d');
        
        // Make canvas full-screen
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Characters including katakana for Matrix feel
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,./<>?~あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
        
        // Set font and color
        var fontSize = 16;
        ctx.font = fontSize + 'px monospace';
        
        // Calculate columns
        var columns = Math.ceil(canvas.width / fontSize);
        
        // Array to track the y-coordinate of each column
        var drops = [];
        
        // Initialize all columns to start at random positions
        for (var i = 0; i < columns; i++) {
            drops[i] = Math.floor(Math.random() * -canvas.height);
        }
        
        // Drawing function
        function draw() {
            // Add semi-transparent black rectangle for trails
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Loop through each column
            for (var i = 0; i < drops.length; i++) {
                // Get random character
                var char = chars[Math.floor(Math.random() * chars.length)];
                
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
            
            // Use requestAnimationFrame if available, or fallback to setTimeout
            if (window.requestAnimationFrame) {
                requestAnimationFrame(draw);
            } else {
                setTimeout(draw, 50);
            }
        }
        
        // Handle window resize
        window.addEventListener('resize', function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Recalculate columns
            var newColumns = Math.ceil(canvas.width / fontSize);
            
            // Adjust drops array
            if (newColumns > columns) {
                // Add new columns
                for (var i = drops.length; i < newColumns; i++) {
                    drops[i] = Math.floor(Math.random() * -canvas.height);
                }
            }
            
            // Reset font size
            ctx.font = fontSize + 'px monospace';
        });
        
        // Start animation
        draw();
    }
    
    // ===== 2. Theme Switcher =====
    function initThemeSwitcher() {
        var themeSwitch = document.getElementById('themeSwitch');
        if (!themeSwitch) return;
        
        // Check saved preference
        var savedTheme = localStorage.getItem('matrixTheme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            
            // Update button text
            themeSwitch.innerHTML = savedTheme === 'light' 
                ? '<div class="m-badge m-badge-primary">D</div>' 
                : '<div class="m-badge m-badge-primary">L</div>';
        }
        
        // Add click event
        themeSwitch.addEventListener('click', function() {
            var currentTheme = document.body.getAttribute('data-theme') || 'dark';
            var newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            // Update theme
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('matrixTheme', newTheme);
            
            // Update button text
            this.innerHTML = newTheme === 'light' 
                ? '<div class="m-badge m-badge-primary">D</div>' 
                : '<div class="m-badge m-badge-primary">L</div>';
            
            // Add transition effect
            document.body.classList.add('theme-transition');
            setTimeout(function() {
                document.body.classList.remove('theme-transition');
            }, 1000);
        });
    }
    
    // ===== 3. Mobile Menu Toggle =====
    function initMobileMenu() {
        var mobileMenuToggle = document.getElementById('mobileMenuToggle');
        var sidebar = document.querySelector('.docs-sidebar');
        var backdrop = document.querySelector('.sidebar-backdrop');
        
        if (!mobileMenuToggle || !sidebar || !backdrop) return;
        
        // Set up styles
        mobileMenuToggle.style.cursor = 'pointer';
        mobileMenuToggle.style.zIndex = '1001';
        
        // Cache DOM elements
        var spans = mobileMenuToggle.querySelectorAll('span');
        
        // Toggle sidebar handler
        function toggleSidebar(event) {
            event.preventDefault();
            event.stopPropagation();
            
            // Toggle classes
            if (sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                backdrop.classList.remove('active');
            } else {
                sidebar.classList.add('active');
                backdrop.classList.add('active');
            }
            
            // Toggle menu icon visual feedback
            if (spans.length === 3) {
                if (sidebar.classList.contains('active')) {
                    // X shape for close
                    spans[0].style.transform = 'translateY(10px) rotate(45deg)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'translateY(-10px) rotate(-45deg)';
                } else {
                    // Reset to hamburger
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            }
        }
        
        // Reset sidebar function
        function resetSidebar() {
            sidebar.classList.remove('active');
            backdrop.classList.remove('active');
            
            // Reset hamburger icon
            if (spans.length === 3) {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        }
        
        // Attach events
        mobileMenuToggle.addEventListener('click', toggleSidebar);
        backdrop.addEventListener('click', resetSidebar);
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebar.classList.contains('active')) {
                resetSidebar();
            }
        });
    }
    
    // ===== 4. Copy Buttons =====
    function initCopyButtons() {
        var copyButtons = document.querySelectorAll('.copy-button');
        if (!copyButtons.length) return;
        
        for (var i = 0; i < copyButtons.length; i++) {
            var button = copyButtons[i];
            
            // Set up styles
            button.style.cursor = 'pointer';
            button.style.zIndex = '10';
            
            button.addEventListener('click', function() {
                // Find code block
                var codeBlock = this.nextElementSibling;
                if (codeBlock) {
                    codeBlock = codeBlock.querySelector('code');
                }
                
                if (!codeBlock) return;
                
                var textToCopy = codeBlock.textContent;
                
                // Cache original states
                var originalText = this.textContent;
                var originalBg = this.style.backgroundColor;
                
                // Copy text
                copyText(this, textToCopy, originalText, originalBg);
            });
        }
        
        // Copy text to clipboard with fallback
        function copyText(button, text, originalText, originalBg) {
            // Try modern clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text)
                    .then(function() {
                        showFeedback(button, true, originalText, originalBg);
                    })
                    .catch(function() {
                        // Fallback to older method if permission denied
                        fallbackCopy(button, text, originalText, originalBg);
                    });
            } else {
                // No clipboard API, use fallback
                fallbackCopy(button, text, originalText, originalBg);
            }
        }
        
        // Fallback copy method
        function fallbackCopy(button, text, originalText, originalBg) {
            var textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            document.body.appendChild(textarea);
            textarea.select();
            
            var successful = false;
            try {
                successful = document.execCommand('copy');
                showFeedback(button, successful, originalText, originalBg);
            } catch (err) {
                console.error('Failed to copy text:', err);
                showFeedback(button, false, originalText, originalBg);
            }
            
            document.body.removeChild(textarea);
        }
        
        // Show feedback
        function showFeedback(button, success, originalText, originalBg) {
            button.textContent = success ? 'Copied!' : 'Failed!';
            
            if (success) {
                button.style.backgroundColor = 'var(--m-success)';
                button.style.color = 'var(--m-bg)';
            }
            
            setTimeout(function() {
                button.textContent = originalText;
                button.style.backgroundColor = originalBg;
                button.style.color = '';
            }, 2000);
        }
    }
    
    // ===== 5. Smooth Scrolling =====
    function initSmoothScrolling() {
        var anchorLinks = document.querySelectorAll('a[href^="#"]');
        if (!anchorLinks.length) return;
        
        // Cache DOM elements
        var sidebar = document.querySelector('.docs-sidebar');
        var backdrop = document.querySelector('.sidebar-backdrop');
        var mobileMenuToggle = document.getElementById('mobileMenuToggle');
        
        for (var i = 0; i < anchorLinks.length; i++) {
            anchorLinks[i].addEventListener('click', function(e) {
                e.preventDefault();
                
                var targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                var targetElement = document.querySelector(targetId);
                if (!targetElement) return;
                
                // Close mobile menu if open
                if (sidebar && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    if (backdrop) backdrop.classList.remove('active');
                    
                    // Reset hamburger icon
                    var spans = mobileMenuToggle ? mobileMenuToggle.querySelectorAll('span') : null;
                    if (spans && spans.length === 3) {
                        spans[0].style.transform = 'none';
                        spans[1].style.opacity = '1';
                        spans[2].style.transform = 'none';
                    }
                }
                
                // Calculate header height for offset
                var headerHeight = 0;
                var mainNav = document.querySelector('.main-nav');
                if (mainNav) {
                    headerHeight = mainNav.offsetHeight;
                }
                
                // Smooth scroll with offset
                var yOffset = -headerHeight - 20; // Extra padding
                var y = getElementPosition(targetElement).top + window.pageYOffset + yOffset;
                
                // Smooth scroll using either native or fallback
                if ('scrollBehavior' in document.documentElement.style) {
                    window.scrollTo({
                        top: y,
                        behavior: 'smooth'
                    });
                } else {
                    // Fallback smooth scroll for older browsers
                    scrollToSmoothly(y, 500);
                }
                
                // Update URL without jump
                history.pushState(null, null, targetId);
                
                // Add highlight effect
                targetElement.classList.add('highlight-target');
                setTimeout(function() {
                    targetElement.classList.remove('highlight-target');
                }, 2000);
            });
        }
        
        // Get element position (cross-browser)
        function getElementPosition(el) {
            var rect = el.getBoundingClientRect();
            return {
                top: rect.top,
                left: rect.left
            };
        }
        
        // Fallback smooth scroll for older browsers
        function scrollToSmoothly(position, duration) {
            var startPosition = window.pageYOffset;
            var distance = position - startPosition;
            var startTime = null;
            
            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                var timeElapsed = currentTime - startTime;
                var scrollY = easeInOutCubic(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, scrollY);
                if (timeElapsed < duration) requestAnimFrame(animation);
            }
            
            // Easing function
            function easeInOutCubic(t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t*t + b;
                t -= 2;
                return c/2*(t*t*t + 2) + b;
            }
            
            // RequestAnimationFrame polyfill
            var requestAnimFrame = (function() {
                return window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    function(callback) {
                        window.setTimeout(callback, 1000/60);
                    };
            })();
            
            requestAnimFrame(animation);
        }
    }
    
    // ===== 6. Scroll Indicator =====
    function initScrollIndicator() {
        var scrollIndicator = document.querySelector('.hero a[href="#features"]');
        if (!scrollIndicator) return;
        
        scrollIndicator.addEventListener('click', function(e) {
            e.preventDefault();
            var targetSection = document.getElementById('features');
            if (targetSection) {
                // Use same smooth scroll as anchor links
                var y = getElementPosition(targetSection).top + window.pageYOffset;
                
                if ('scrollBehavior' in document.documentElement.style) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                    scrollToSmoothly(y, 500);
                }
            }
        });
        
        // Get element position (cross-browser)
        function getElementPosition(el) {
            var rect = el.getBoundingClientRect();
            return {
                top: rect.top,
                left: rect.left
            };
        }
        
        // Fallback smooth scroll for older browsers
        function scrollToSmoothly(position, duration) {
            var startPosition = window.pageYOffset;
            var distance = position - startPosition;
            var startTime = null;
            
            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                var timeElapsed = currentTime - startTime;
                var scrollY = easeInOutCubic(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, scrollY);
                if (timeElapsed < duration) requestAnimFrame(animation);
            }
            
            // Easing function
            function easeInOutCubic(t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t*t + b;
                t -= 2;
                return c/2*(t*t*t + 2) + b;
            }
            
            // RequestAnimationFrame polyfill
            var requestAnimFrame = (function() {
                return window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    function(callback) {
                        window.setTimeout(callback, 1000/60);
                    };
            })();
            
            requestAnimFrame(animation);
        }
    }
    
    // ===== 7. Active Nav Links =====
    function initActiveNavLinks() {
        var sections = document.querySelectorAll('section[id]');
        var navLinks = document.querySelectorAll('.nav-link');
        
        if (!sections.length || !navLinks.length) return;
        
        // Throttle scroll events
        var isScrolling = false;
        
        function updateActiveNavLinks() {
            if (isScrolling) return;
            
            isScrolling = true;
            
            // Use requestAnimationFrame if available
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(function() {
                    updateNavLinks();
                    isScrolling = false;
                });
            } else {
                setTimeout(function() {
                    updateNavLinks();
                    isScrolling = false;
                }, 66); // ~15fps
            }
        }
        
        function updateNavLinks() {
            // Get current scroll position
            var scrollPosition = window.pageYOffset + 100; // Adding offset
            
            // Find the current section
            for (var i = 0; i < sections.length; i++) {
                var section = sections[i];
                var sectionTop = getOffsetTop(section);
                var sectionHeight = section.offsetHeight;
                var sectionId = section.getAttribute('id');
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    // Remove active class from all links
                    for (var j = 0; j < navLinks.length; j++) {
                        navLinks[j].classList.remove('active');
                    }
                    
                    // Add active class to corresponding link
                    var correspondingLink = document.querySelector('.nav-link[href="#' + sectionId + '"]');
                    if (correspondingLink) {
                        correspondingLink.classList.add('active');
                    }
                }
            }
        }
        
        // Get element's offset from the top (cross-browser)
        function getOffsetTop(element) {
            var offsetTop = 0;
            while(element) {
                offsetTop += element.offsetTop;
                element = element.offsetParent;
            }
            return offsetTop;
        }
        
        // Listen for scroll events
        window.addEventListener('scroll', updateActiveNavLinks);
        
        // Initial call
        updateActiveNavLinks();
    }
    
    // ===== 8. Terminal Effects =====
    function initTerminalEffects() {
        // References to elements
        var matrixNav = document.querySelector('.matrix-nav');
        var mainSections = document.querySelectorAll('section[id]');
        var sidebarLinks = document.querySelectorAll('.docs-sidebar-link');
        var navContainer = document.querySelector('.nav-container');
        var scrollIndicator = document.querySelector('.hero a[href="#features"]');
        var navLogo = document.querySelector('.nav-logo .logo-text');
        
        // Skip if critical elements missing
        if (!navContainer) return;
        
        // Terminal typing state
        var isTyping = false;
        var currentSectionId = '';
        var typeTimeout;
        var elements = {};
        
        // Create terminal UI elements
        function createTerminalElements() {
            // Terminal display
            var terminalDisplay = document.createElement('div');
            terminalDisplay.className = 'matrix-terminal-display';
            terminalDisplay.innerHTML = 
                '<span class="terminal-prefix">></span>' +
                '<div class="terminal-text-box" data-content="MATRIX.CSS">MATRIX.CSS</div>' +
                '<span class="terminal-cursor"></span>';
            
            // Connection lines container
            var connectionLines = document.createElement('div');
            connectionLines.className = 'terminal-connection-lines';
            
            // Status indicator
            var statusIndicator = document.createElement('div');
            statusIndicator.className = 'matrix-status-indicator';
            statusIndicator.style.display = 'none';
            statusIndicator.innerHTML = 
                '<span class="status-dot"></span>' +
                '<span class="status-text">MATRIX.CSS</span>';
            
            // Particles container
            var particlesContainer = document.createElement('div');
            particlesContainer.className = 'matrix-particles-container';
            
            // Add elements to DOM
            navContainer.appendChild(connectionLines);
            document.body.appendChild(statusIndicator);
            document.body.appendChild(particlesContainer);
            
            // Create title container if logo exists
            if (navLogo) {
                // Wrap the logo text in a container
                var logoParent = navLogo.parentElement;
                var titleContainer = document.createElement('div');
                titleContainer.className = 'nav-title-container';
                
                // Keep the original logo text
                navLogo.className += ' nav-logo-title';
                
                // Create the dynamic section title
                var sectionTitle = document.createElement('span');
                sectionTitle.className = 'nav-section-title';
                sectionTitle.style.display = 'none';
                
                // Create terminal cursor
                var cursor = document.createElement('span');
                cursor.className = 'terminal-cursor';
                
                // Create glitch effect element
                var glitchEffect = document.createElement('div');
                glitchEffect.className = 'terminal-glitch';
                
                // Insert all elements
                titleContainer.appendChild(navLogo);
                titleContainer.appendChild(sectionTitle);
                titleContainer.appendChild(cursor);
                titleContainer.appendChild(glitchEffect);
                logoParent.appendChild(titleContainer);
                
                // Create active section box
                var activeSectionBox = document.createElement('div');
                activeSectionBox.className = 'active-section-box';
                activeSectionBox.innerHTML = 
                  '<span class="active-section-indicator"></span>';
                document.body.appendChild(activeSectionBox);
            }
            
            // Create connection lines
            createConnectionLines();
            
            // Return references to created elements
            return {
                terminalDisplay: terminalDisplay,
                connectionLines: connectionLines,
                statusIndicator: statusIndicator,
                particlesContainer: particlesContainer,
                textBox: document.querySelector('.terminal-text-box'),
                statusText: document.querySelector('.status-text')
            };
        }
        
        // Initialize elements
        elements = createTerminalElements();
        
        // Terminal typing effect with glitch
        function typeTerminalText(text, callback) {
            if (!elements.textBox) return;
            
            if (isTyping) {
                clearTimeout(typeTimeout);
            }
            
            isTyping = true;
            
            // Save original text for data-content (used by glitch effect)
            elements.textBox.setAttribute('data-content', text);
            
            // Clear and prepare for typing
            elements.textBox.textContent = '';
            elements.textBox.classList.add('glitch');
            
            // Create digital rain effect during transition
            createMatrixRainParticles();
            
            setTimeout(function() {
                elements.textBox.classList.remove('glitch');
                
                // Type characters one by one
                var i = 0;
                function typeCharacter() {
                    if (i < text.length) {
                        elements.textBox.textContent += text.charAt(i);
                        i++;
                        
                        // Random delay for realistic typing
                        var randomDelay = Math.floor(Math.random() * 50) + 30;
                        typeTimeout = setTimeout(typeCharacter, randomDelay);
                        
                        // Occasionally add glitch during typing
                        if (Math.random() < 0.1) {
                            elements.textBox.classList.add('glitch');
                            setTimeout(function() {
                                elements.textBox.classList.remove('glitch');
                            }, 100);
                        }
                    } else {
                        isTyping = false;
                        if (callback) callback();
                    }
                }
                
                typeCharacter();
            }, 300);
        }
        
        // Create matrix rain particles during transitions
        function createMatrixRainParticles() {
            if (!elements.particlesContainer) return;
            
            // Clear existing particles
            elements.particlesContainer.innerHTML = '';
            
            // Matrix chars
            var chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
            
            // Create particles
            for (var i = 0; i < 50; i++) {
                var particle = document.createElement('div');
                particle.className = 'matrix-particle';
                
                // Random character
                particle.textContent = chars.charAt(Math.floor(Math.random() * chars.length));
                
                // Random position
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 1.5 + 's';
                
                elements.particlesContainer.appendChild(particle);
            }
            
            // Remove particles after animation completes
            setTimeout(function() {
                elements.particlesContainer.innerHTML = '';
            }, 3500);
        }
        
        // Create connection lines between nav and content
        function createConnectionLines() {
            var container = document.querySelector('.terminal-connection-lines');
            if (!container) return;
            
            // Clear existing lines
            container.innerHTML = '';
            
            // Create 8-12 lines
            var lineCount = 8 + Math.floor(Math.random() * 5);
            
            for (var i = 0; i < lineCount; i++) {
                var line = document.createElement('div');
                line.className = 'connection-line';
                
                // Random positioning
                var startX = Math.random() * 100;
                var startY = Math.random() * 70 + 30;
                var endX = 100 + Math.random() * 50;
                
                // Calculate line properties
                var deltaX = endX - startX;
                var length = Math.sqrt(deltaX * deltaX + 900);
                var angle = Math.atan2(30, deltaX) * 180 / Math.PI;
                
                // Set styles
                line.style.left = startX + '%';
                line.style.top = startY + '%';
                line.style.width = length + 'px';
                line.style.transform = 'rotate(' + angle + 'deg)';
                
                // Randomly activate some lines
                if (Math.random() > 0.6) {
                    line.classList.add('active');
                }
                
                container.appendChild(line);
            }
        }
        
        // Update active section while scrolling (throttled)
        var isScrollingSection = false;
        
        function updateActiveSection() {
            if (isScrollingSection) return;
            
            isScrollingSection = true;
            
            // Use requestAnimationFrame or timeout
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(function() {
                    processActiveSection();
                    isScrollingSection = false;
                });
            } else {
                setTimeout(function() {
                    processActiveSection();
                    isScrollingSection = false;
                }, 66); // ~15fps
            }
        }
        
        function processActiveSection() {
            // Get current scroll position with offset
            var scrollPosition = window.pageYOffset + 100;
            
            // Find the current section
            var activeSection = null;
            for (var i = 0; i < mainSections.length; i++) {
                var section = mainSections[i];
                var sectionTop = getOffsetTop(section);
                var sectionHeight = section.offsetHeight;
                var sectionId = section.getAttribute('id');
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    activeSection = {
                        id: sectionId,
                        element: section
                    };
                    
                    // Update sidebar links
                    for (var j = 0; j < sidebarLinks.length; j++) {
                        var link = sidebarLinks[j];
                        var href = link.getAttribute('href');
                        if (href === '#' + sectionId) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    }
                }
            }
            
            // Update navbar and status when entering a new section
            if (activeSection && activeSection.id !== currentSectionId) {
                currentSectionId = activeSection.id;
                
                // Get section title
                var sectionHeading = activeSection.element.querySelector('h2, h3');
                if (!sectionHeading) {
                    sectionHeading = activeSection.element;
                }
                var sectionTitleText = sectionHeading.textContent.trim();
                
                // Shorten if too long
                if (sectionTitleText.length > 20) {
                    sectionTitleText = sectionTitleText.substring(0, 18) + '...';
                }
                
                // Format for terminal style
                var terminalText = sectionTitleText.toUpperCase();
                
                // Type with terminal effect
                typeTerminalText(terminalText, function() {
                    // Activate random connection lines after typing
                    var lines = document.querySelectorAll('.connection-line');
                    for (var k = 0; k < lines.length; k++) {
                        lines[k].classList.remove('active');
                    }
                    
                    setTimeout(function() {
                        // Activate some random lines
                        for (var l = 0; l < lines.length; l++) {
                            if (Math.random() > 0.7) {
                                lines[l].classList.add('active');
                            }
                        }
                    }, 300);
                });
                
                // Update status indicator
                if (elements.statusText) {
                    elements.statusText.textContent = terminalText;
                }
                if (elements.statusIndicator) {
                    elements.statusIndicator.classList.add('visible');
                }
            }
            
            // Reset if back at the top
            if (scrollPosition < 100) {
                currentSectionId = '';
                
                // Type MATRIX.CSS in terminal
                typeTerminalText('MATRIX.CSS');
                
                // Hide status indicator
                if (elements.statusIndicator) {
                    elements.statusIndicator.classList.remove('visible');
                }
            }
            
            // Add scrolled class to navbar
            if (scrollPosition > 100) {
                if (matrixNav) matrixNav.classList.add('scrolled');
            } else {
                if (matrixNav) matrixNav.classList.remove('scrolled');
            }
        }
        
        // Get element's offset from the top (cross-browser)
        function getOffsetTop(element) {
            var offsetTop = 0;
            while(element) {
                offsetTop += element.offsetTop;
                element = element.offsetParent;
            }
            return offsetTop;
        }
        
        // Fix scroll indicator and add animation
        if (scrollIndicator) {
            scrollIndicator.className = 'scroll-indicator';
            scrollIndicator.style.animation = 'bounce 2s infinite';
        }
        
        // Handle sidebar links clicks
        for (var i = 0; i < sidebarLinks.length; i++) {
            sidebarLinks[i].addEventListener('click', function() {
                // Remove active class from all links
                for (var j = 0; j < sidebarLinks.length; j++) {
                    sidebarLinks[j].classList.remove('active');
                }
                
                // Add active class to clicked link
                this.classList.add('active');
                
                // Get target section
                var href = this.getAttribute('href');
                var targetId = href ? href.substring(1) : '';
                if (!targetId) return;
                
                var targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    // Get section heading
                    var sectionHeading = targetSection.querySelector('h2, h3');
                    if (!sectionHeading) {
                        sectionHeading = targetSection;
                    }
                    var sectionTitleText = sectionHeading.textContent.trim().toUpperCase();
                    
                    // Update terminal with typing effect
                    typeTerminalText(sectionTitleText);
                    
                    // Update status indicator
                    if (elements.statusText) {
                        elements.statusText.textContent = sectionTitleText;
                    }
                    if (elements.statusIndicator) {
                        elements.statusIndicator.classList.add('visible');
                    }
                }
                
                // Close mobile sidebar if open
                var sidebar = document.querySelector('.docs-sidebar');
                var backdrop = document.querySelector('.sidebar-backdrop');
                
                if (sidebar && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    if (backdrop) backdrop.classList.remove('active');
                    
                    // Reset hamburger icon
                    var menuToggle = document.getElementById('mobileMenuToggle');
                    if (menuToggle) {
                        var spans = menuToggle.querySelectorAll('span');
                        if (spans && spans.length === 3) {
                            spans[0].style.transform = 'none';
                            spans[1].style.opacity = '1';
                            spans[2].style.transform = 'none';
                        }
                    }
                }
            });
        }
        
        // Random glitch effects at intervals
        function randomGlitchEffects() {
            var textBox = document.querySelector('.terminal-text-box');
            if (textBox && Math.random() > 0.9) {
                textBox.classList.add('glitch');
                setTimeout(function() {
                    textBox.classList.remove('glitch');
                }, 150);
            }
            
            // Randomly activate connection lines
            var lines = document.querySelectorAll('.connection-line');
            if (lines.length > 0 && Math.random() > 0.8) {
                // Pick a random line
                var randomIndex = Math.floor(Math.random() * lines.length);
                var randomLine = lines[randomIndex];
                randomLine.classList.add('active');
                
                setTimeout(function() {
                    if (Math.random() > 0.5) {
                        randomLine.classList.remove('active');
                    }
                }, 2000);
            }
            
            // Schedule next glitch
            setTimeout(randomGlitchEffects, 2000 + Math.random() * 3000);
        }
        
        // Initialize random effects
        randomGlitchEffects();
        
        // Listen for scroll events
        window.addEventListener('scroll', updateActiveSection);
        
        // Initialize on page load
        updateActiveSection();
        
        // Handle window resize
        window.addEventListener('resize', createConnectionLines);
        
        // Initial animation
        setTimeout(function() {
            typeTerminalText('MATRIX.CSS');
        }, 1000);
    }
    
    // ===== 9. Nav Links Enhancement =====
    function enhanceNavLinks() {
        var navLinks = document.querySelectorAll('.nav-link');
        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].addEventListener('click', function() {
                for (var j = 0; j < navLinks.length; j++) {
                    navLinks[j].classList.remove('active');
                }
                this.classList.add('active');
            });
        }
    }
    
    // Initialize all components
    initMatrixRain();
    initThemeSwitcher();
    initMobileMenu();
    initCopyButtons();
    initSmoothScrolling();
    initScrollIndicator();
    initActiveNavLinks();
    initTerminalEffects();
    enhanceNavLinks();
});