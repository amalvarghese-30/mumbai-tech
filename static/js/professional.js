// Professional Enhancements for Mumbai-Tech
document.addEventListener('DOMContentLoaded', function () {

    // Mobile Navigation Elements
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('mainNav');
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
    const mobileSearchOverlay = document.getElementById('mobileSearchOverlay');
    const mobileSearchClose = document.getElementById('mobileSearchClose');
    const body = document.body;

    // Create mobile menu backdrop
    const mobileBackdrop = document.createElement('div');
    mobileBackdrop.className = 'mobile-menu-backdrop';
    document.body.appendChild(mobileBackdrop);

    // ===== MOBILE NAVIGATION FUNCTIONALITY =====
    if (mobileToggle && navMenu) {
        // Toggle mobile menu on hamburger click
        mobileToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();

            if (navMenu.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Close menu when clicking backdrop
        mobileBackdrop.addEventListener('click', function () {
            closeMobileMenu();
        });

        // Handle mobile dropdowns
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.nav-link');
            if (trigger) {
                trigger.addEventListener('click', function (e) {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        e.stopPropagation();

                        // Toggle current dropdown
                        const isActive = dropdown.classList.contains('active');

                        // Close all dropdowns first
                        dropdowns.forEach(d => {
                            d.classList.remove('active');
                        });

                        // Open current one if it wasn't active
                        if (!isActive) {
                            dropdown.classList.add('active');
                        }
                    }
                });
            }
        });

        // Close mobile menu when clicking a link
        navMenu.addEventListener('click', function (e) {
            if (window.innerWidth <= 768) {
                const link = e.target.closest('.nav-link');
                if (link && !link.querySelector('.dropdown-arrow')) {
                    setTimeout(() => {
                        closeMobileMenu();
                    }, 300);
                }
            }
        });
    }

    // ===== MOBILE DROPDOWN HANDLING =====
    function setupMobileDropdowns() {
        if (window.innerWidth <= 768) {
            const dropdowns = document.querySelectorAll('.nav-dropdown');

            dropdowns.forEach(dropdown => {
                const link = dropdown.querySelector('.nav-link');
                if (link) {
                    // Add dropdown indicator
                    link.classList.add('has-dropdown');

                    // Add click handler for mobile
                    link.addEventListener('click', function (e) {
                        if (window.innerWidth <= 768) {
                            e.preventDefault();
                            e.stopPropagation();

                            // Close other dropdowns
                            dropdowns.forEach(other => {
                                if (other !== dropdown) {
                                    other.classList.remove('active');
                                    const otherLink = other.querySelector('.nav-link');
                                    if (otherLink) otherLink.classList.remove('active');
                                }
                            });

                            // Toggle current dropdown
                            dropdown.classList.toggle('active');
                            link.classList.toggle('active');
                        }
                    });
                }
            });

            // Close dropdowns when clicking outside
            document.addEventListener('click', function (e) {
                if (!e.target.closest('.nav-dropdown') && window.innerWidth <= 768) {
                    dropdowns.forEach(dropdown => {
                        dropdown.classList.remove('active');
                        const link = dropdown.querySelector('.nav-link');
                        if (link) link.classList.remove('active');
                    });
                }
            });

            // Handle window resize
            let resizeTimer;
            window.addEventListener('resize', function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function () {
                    if (window.innerWidth > 768) {
                        // Reset on desktop
                        dropdowns.forEach(dropdown => {
                            dropdown.classList.remove('active');
                            const link = dropdown.querySelector('.nav-link');
                            if (link) link.classList.remove('active');
                        });
                    }
                }, 250);
            });
        }
    }

    // Call setup function
    setupMobileDropdowns();

    // ===== MOBILE SEARCH FUNCTIONALITY =====
    if (mobileSearchBtn && mobileSearchOverlay && mobileSearchClose) {
        mobileSearchBtn.addEventListener('click', function () {
            mobileSearchOverlay.classList.add('active');
            body.style.overflow = 'hidden';

            // Focus on search input
            setTimeout(() => {
                const searchInput = mobileSearchOverlay.querySelector('.mobile-search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }, 100);
        });

        mobileSearchClose.addEventListener('click', function () {
            mobileSearchOverlay.classList.remove('active');
            body.style.overflow = '';
        });

        // Close search when clicking outside
        mobileSearchOverlay.addEventListener('click', function (e) {
            if (e.target === mobileSearchOverlay) {
                mobileSearchOverlay.classList.remove('active');
                body.style.overflow = '';
            }
        });

        // Close on escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                if (mobileSearchOverlay.classList.contains('active')) {
                    mobileSearchOverlay.classList.remove('active');
                    body.style.overflow = '';
                }
                if (navMenu.classList.contains('active')) {
                    closeMobileMenu();
                }
            }
        });
    }

    // ===== RESIZE HANDLER =====
    function handleResize() {
        if (window.innerWidth > 768) {
            // Reset everything on desktop
            closeMobileMenu();
            if (mobileSearchOverlay) {
                mobileSearchOverlay.classList.remove('active');
                body.style.overflow = '';
            }

            // Close all dropdowns
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    // ===== BACK TO TOP BUTTON =====
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function () {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ===== ENHANCED SEARCH =====
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
        });

        searchInput.addEventListener('blur', function () {
            this.parentElement.classList.remove('focused');
        });

        // Debounced search
        let searchTimeout;
        searchInput.addEventListener('input', function (e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (e.target.value.length > 2) {
                    console.log('Searching for:', e.target.value);
                    // Implement AJAX search here
                }
            }, 500);
        });
    }

    // ===== MOBILE SEARCH INPUT DEBOUNCE =====
    const mobileSearchInput = document.querySelector('.mobile-search-input');
    if (mobileSearchInput) {
        let mobileSearchTimeout;
        mobileSearchInput.addEventListener('input', function (e) {
            clearTimeout(mobileSearchTimeout);
            mobileSearchTimeout = setTimeout(() => {
                if (e.target.value.length > 2) {
                    console.log('Mobile searching for:', e.target.value);
                    // Implement AJAX search here
                }
            }, 500);
        });
    }

    // ===== ACTIVE NAV LINK HIGHLIGHTING =====
    function setActiveNav() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.classList.remove('active');

            // Check if this link matches current path
            const linkPath = link.getAttribute('href');
            if (linkPath === currentPath ||
                (linkPath !== '/' && currentPath.startsWith(linkPath))) {
                link.classList.add('active');

                // Also activate parent dropdown if exists
                const dropdown = link.closest('.dropdown');
                if (dropdown) {
                    dropdown.classList.add('active');
                }
            }
        });
    }
    setActiveNav();

    // ===== TOUCH SUPPORT FOR MOBILE =====
    if ('ontouchstart' in window) {
        // Add touch feedback to interactive elements
        const touchElements = document.querySelectorAll('.nav-link, .dropdown-item, .btn-quote, .mobile-search-btn, .mobile-toggle');

        touchElements.forEach(element => {
            element.addEventListener('touchstart', function () {
                this.classList.add('touch-active');
            });

            element.addEventListener('touchend', function () {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 150);
            });
        });

        // Prevent body scroll when mobile menu is open
        document.addEventListener('touchmove', function (e) {
            if (navMenu.classList.contains('active')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // ===== GSAP ANIMATIONS =====
    if (typeof gsap !== 'undefined') {
        // Header animation
        gsap.from('.professional-header', {
            duration: 0.5,
            y: -50,
            opacity: 0,
            ease: 'power2.out'
        });

        // Footer animation
        gsap.from('.professional-footer', {
            scrollTrigger: {
                trigger: '.professional-footer',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            y: 50,
            opacity: 0,
            ease: 'power3.out'
        });

        // Animate cards on scroll
        const cards = document.querySelectorAll('.product-card, .category-card');
        cards.forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                duration: 0.6,
                y: 30,
                opacity: 0,
                delay: i * 0.1,
                ease: 'power2.out'
            });
        });
    }

    // ===== FORM ENHANCEMENTS =====
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // Check if input has value
            if (input.value.trim() !== '') {
                input.parentElement.classList.add('has-value');
            }

            input.addEventListener('focus', function () {
                this.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', function () {
                this.parentElement.classList.remove('focused');
                if (this.value.trim() !== '') {
                    this.parentElement.classList.add('has-value');
                } else {
                    this.parentElement.classList.remove('has-value');
                }
            });
        });
    });

    // ===== LAZY LOADING =====
    const lazyImages = document.querySelectorAll('img[data-src]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    }

    // ===== HELPER FUNCTIONS =====
    function openMobileMenu() {
        navMenu.classList.add('active');
        mobileToggle.classList.add('active');
        mobileBackdrop.classList.add('active');
        body.classList.add('menu-open');
        body.style.overflow = 'hidden';

        // Close any open search
        if (mobileSearchOverlay) {
            mobileSearchOverlay.classList.remove('active');
        }
    }

    function closeMobileMenu() {
        navMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        mobileBackdrop.classList.remove('active');
        body.classList.remove('menu-open');
        body.style.overflow = '';

        // Close all dropdowns
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }

    // ===== CLICK OUTSIDE TO CLOSE =====
    document.addEventListener('click', function (event) {
        if (window.innerWidth <= 768) {
            // Close mobile menu if clicking outside
            if (navMenu.classList.contains('active') &&
                !navMenu.contains(event.target) &&
                !mobileToggle.contains(event.target) &&
                !mobileBackdrop.contains(event.target)) {
                closeMobileMenu();
            }
        }
    });

    // ===== PERFORMANCE OPTIMIZATION =====
    // Debounce scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function () {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Update any scroll-based calculations here
        }, 100);
    });

    // ===== INITIALIZATION =====
    console.log('Mumbai-Tech Professional JS loaded successfully');

    // Force mobile menu button to be visible
    if (window.innerWidth <= 768 && mobileToggle) {
        mobileToggle.style.display = 'flex';
        mobileToggle.style.visibility = 'visible';
        mobileToggle.style.opacity = '1';
    }
});

// ===== WINDOW LOAD EVENT =====
window.addEventListener('load', function () {
    // Page is fully loaded
    document.body.classList.add('loaded');

    // Remove loading skeletons if any
    const skeletons = document.querySelectorAll('.loading-skeleton');
    skeletons.forEach(skeleton => {
        skeleton.classList.remove('loading-skeleton');
    });

    // Log performance
    const perfEntries = performance.getEntriesByType("navigation");
    if (perfEntries.length > 0) {
        const navTiming = perfEntries[0];
        console.log('Page loaded in:', navTiming.loadEventEnd - navTiming.loadEventStart, 'ms');
    }
});

// ===== ERROR HANDLING =====
window.addEventListener('error', function (e) {
    console.error('JavaScript Error:', e.error);
    // You could send this to analytics service
});

// ===== OFFLINE DETECTION =====
window.addEventListener('offline', function () {
    console.warn('You are offline. Some features may not work.');
    // Show offline notification
});

window.addEventListener('online', function () {
    console.log('You are back online.');
    // Hide offline notification
});

// ===== PRINT STYLES =====
window.addEventListener('beforeprint', function () {
    document.body.classList.add('printing');
});

window.addEventListener('afterprint', function () {
    document.body.classList.remove('printing');
});