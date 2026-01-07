// static/js/main.js - Main JavaScript File

document.addEventListener('DOMContentLoaded', function () {
    console.log('MUMBAI-TECH: Main.js loaded');

    // Debug: Check if menu elements exist
    console.log('Nav toggle element:', document.querySelector('.nav-toggle'));
    console.log('Nav menu element:', document.querySelector('.nav-menu'));

    // ===== MOBILE MENU TOGGLE (FIXED) =====
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        console.log('Mobile menu elements found, adding event listeners');

        navToggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            console.log('Hamburger clicked');
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');

            // Update aria-expanded for accessibility
            const isExpanded = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);

            console.log('Menu active:', isExpanded);
        });

        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                console.log('Menu link clicked, closing menu');
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                if (navMenu.classList.contains('active')) {
                    console.log('Clicked outside, closing menu');
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                console.log('Escape pressed, closing menu');
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    } else {
        console.warn('Mobile menu elements not found. Check HTML structure.');
    }

    // ===== BACK TO TOP BUTTON =====
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        window.addEventListener('scroll', function () {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ===== FLASH MESSAGES AUTO-HIDE =====
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(message => {
        // Auto-hide after 5 seconds
        setTimeout(() => {
            message.style.transition = 'opacity 0.5s ease';
            message.style.opacity = '0';
            setTimeout(() => message.remove(), 500);
        }, 5000);

        // Close button
        const closeBtn = message.querySelector('.flash-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                message.style.transition = 'opacity 0.5s ease';
                message.style.opacity = '0';
                setTimeout(() => message.remove(), 500);
            });
        }
    });

    // ===== PRODUCT IMAGE PREVIEW =====
    const productImages = document.querySelectorAll('.product-card-image img');
    productImages.forEach(img => {
        img.addEventListener('error', function () {
            this.src = '/static/images/default-product.jpg';
            this.alt = 'Product image not available';
            this.style.objectFit = 'contain';
            this.parentElement.style.background = '#1a1d21';
        });
    });

    // ===== FORM VALIDATION ENHANCEMENT =====
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // Skip enquiry form as it has its own validation
        if (form.id === 'enquiryForm') return;

        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // Add focus styles
            input.addEventListener('focus', function () {
                this.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', function () {
                this.parentElement.classList.remove('focused');
                if (this.value.trim() !== '') {
                    this.classList.add('has-value');
                } else {
                    this.classList.remove('has-value');
                }
            });

            // Check initial state
            if (input.value.trim() !== '') {
                input.classList.add('has-value');
            }
        });
    });

    // ===== PRODUCT SEARCH ENHANCEMENT =====
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') {
                this.form.submit();
            }
        });
    }

    // ===== LAZY LOADING IMAGES =====
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== ACTIVE NAV LINK HIGHLIGHT =====
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a, .nav-link');

    navLinks.forEach(link => {
        try {
            const linkUrl = new URL(link.href, window.location.origin);
            const linkPath = linkUrl.pathname;

            if (currentPath === linkPath ||
                (currentPath.startsWith('/product/') && linkPath === '/products') ||
                (currentPath.startsWith('/category/') && linkPath === '/categories')) {
                link.classList.add('active');
            }
        } catch (e) {
            console.log('Error parsing URL:', link.href);
        }
    });

    // ===== ADD TOUCH FEEDBACK =====
    document.querySelectorAll('.btn, .nav-link, .product-card').forEach(element => {
        element.addEventListener('touchstart', function () {
            this.classList.add('touch-active');
        });

        element.addEventListener('touchend', function () {
            setTimeout(() => {
                this.classList.remove('touch-active');
            }, 150);
        });
    });

    // ===== INITIALIZE GSAP ANIMATIONS (if available) =====
    try {
        if (typeof gsap !== 'undefined') {
            // Animate hero elements
            const heroTitle = document.querySelector('.hero-title');
            const heroSubtitle = document.querySelector('.hero-subtitle');

            if (heroTitle || heroSubtitle) {
                gsap.from('.hero-title, .hero-subtitle', {
                    duration: 1,
                    y: 30,
                    opacity: 0,
                    stagger: 0.2,
                    ease: 'power3.out'
                });
            }

            // Animate product cards on scroll
            const productGrid = document.querySelector('.products-grid');
            if (productGrid && typeof ScrollTrigger !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);

                gsap.from('.product-card', {
                    scrollTrigger: {
                        trigger: '.products-grid',
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    },
                    duration: 0.8,
                    y: 30,
                    opacity: 0,
                    stagger: 0.1,
                    ease: 'power3.out'
                });
            }
        }
    } catch (error) {
        console.log('GSAP animations not available:', error);
    }

    // ===== LOADING STATES =====
    // Only apply loading animation to buttons that are NOT form submit buttons
    document.querySelectorAll('button[type="button"], a.btn:not([type="submit"]), .btn:not([type="submit"]):not(form button)').forEach(element => {
        element.addEventListener('click', function (e) {
            // Only process if it's a button and not disabled
            if (this.classList.contains('btn') && !this.hasAttribute('disabled')) {
                // Don't process form submit buttons
                if (this.type === 'submit' || (this.closest('form') && this.type !== 'button')) {
                    return; // Skip - let form submit normally
                }

                const originalText = this.innerHTML;
                const originalClasses = this.className;

                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                this.className = originalClasses + ' loading';
                this.setAttribute('disabled', 'true');

                // Reset after 3 seconds (fallback)
                setTimeout(() => {
                    if (this.innerHTML.includes('Loading')) {
                        this.innerHTML = originalText;
                        this.className = originalClasses;
                        this.removeAttribute('disabled');
                    }
                }, 3000);
            }
        });
    });

    // ===== FIX FOR IOS ZOOM ON INPUT FOCUS =====
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        let viewport = document.querySelector("meta[name=viewport]");
        if (viewport) {
            viewport.content = viewport.content + ", maximum-scale=1.0";
        }

        document.addEventListener('focus', function (event) {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
                document.body.style.zoom = '1';
            }
        }, true);

        document.addEventListener('blur', function (event) {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
                document.body.style.zoom = '';
            }
        }, true);
    }

    // ===== PRODUCT IMAGE SWIPER INITIALIZATION =====
    try {
        if (typeof Swiper !== 'undefined') {
            // Initialize product image swiper if present
            const productSwiper = document.querySelector('.product-main-swiper');
            if (productSwiper && !productSwiper.swiper) {
                const thumbsSwiper = new Swiper('.product-thumbs-swiper', {
                    spaceBetween: 10,
                    slidesPerView: 4,
                    freeMode: true,
                    watchSlidesProgress: true,
                });

                new Swiper('.product-main-swiper', {
                    spaceBetween: 10,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                    thumbs: {
                        swiper: thumbsSwiper,
                    },
                });
            }
        }
    } catch (error) {
        console.log('Swiper not available:', error);
    }

    // ===== DROPDOWN MENUS =====
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseenter', () => {
            const content = dropdown.querySelector('.dropdown-content');
            if (content) content.style.display = 'block';
        });

        dropdown.addEventListener('mouseleave', () => {
            const content = dropdown.querySelector('.dropdown-content');
            if (content) content.style.display = 'none';
        });

        // Touch support for mobile
        dropdown.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const content = dropdown.querySelector('.dropdown-content');
            if (content) {
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            }
        });
    });

    // ===== ENHANCED FORM SUBMISSION =====
    const enquiryForm = document.getElementById('enquiryForm');
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', function (e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;

                // Reset button after 10 seconds (fallback)
                setTimeout(() => {
                    if (submitBtn.innerHTML.includes('Sending')) {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }
                }, 10000);
            }
        });
    }

    // ===== IMAGE MODAL (if needed) =====
    const productDetailImages = document.querySelectorAll('.product-main-image');
    productDetailImages.forEach(img => {
        img.addEventListener('click', function () {
            const modal = document.createElement('div');
            modal.className = 'image-modal';
            modal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <img src="${this.src}" alt="${this.alt}">
                    <button class="modal-close">&times;</button>
                </div>
            `;

            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';

            modal.querySelector('.modal-overlay, .modal-close').addEventListener('click', () => {
                modal.remove();
                document.body.style.overflow = '';
            });
        });
    });

    // ===== STICKY HEADER =====
    const header = document.querySelector('.professional-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        });
    }

    // ===== QUANTITY INPUTS =====
    document.querySelectorAll('.quantity-input').forEach(input => {
        const minusBtn = input.parentElement.querySelector('.quantity-minus');
        const plusBtn = input.parentElement.querySelector('.quantity-plus');

        if (minusBtn) {
            minusBtn.addEventListener('click', () => {
                let value = parseInt(input.value) || 1;
                if (value > 1) {
                    input.value = value - 1;
                    input.dispatchEvent(new Event('change'));
                }
            });
        }

        if (plusBtn) {
            plusBtn.addEventListener('click', () => {
                let value = parseInt(input.value) || 1;
                input.value = value + 1;
                input.dispatchEvent(new Event('change'));
            });
        }
    });

    console.log('MUMBAI-TECH: All JavaScript initialized');
});

// ===== WINDOW LOAD EVENT =====
window.addEventListener('load', function () {
    // Remove loading skeletons
    document.querySelectorAll('.loading-skeleton').forEach(skeleton => {
        skeleton.classList.remove('loading-skeleton');
    });

    // Add loaded class to body for CSS transitions
    document.body.classList.add('loaded');

    // Log performance info
    console.log('Page fully loaded in:', performance.now().toFixed(2), 'ms');
});

// ===== RESIZE HANDLER =====
let resizeTimer;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Close mobile menu on resize to desktop
        const navMenu = document.querySelector('.nav-menu');
        const navToggle = document.querySelector('.nav-toggle');

        if (window.innerWidth > 992 && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (navToggle) {
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        }
    }, 250);
});

document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.querySelector(".nav-links");

    if (!hamburger || !navLinks) return;

    hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        hamburger.classList.toggle("active");
    });
});
