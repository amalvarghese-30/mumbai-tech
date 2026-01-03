// static/js/main.js - Main JavaScript File

document.addEventListener('DOMContentLoaded', function () {

    // ===== MOBILE MENU TOGGLE =====
    const menuBtn = document.getElementById('menuBtn');
    const siteNav = document.getElementById('siteNav');

    if (menuBtn && siteNav) {
        menuBtn.addEventListener('click', function () {
            siteNav.classList.toggle('active');
            menuBtn.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu when clicking on a link
        const navLinks = siteNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                siteNav.classList.remove('active');
                menuBtn.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (event) {
            if (!siteNav.contains(event.target) && !menuBtn.contains(event.target)) {
                siteNav.classList.remove('active');
                menuBtn.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
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

        backToTopBtn.addEventListener('click', function () {
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
    const navLinks = document.querySelectorAll('.site-nav a');

    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;

        if (currentPath === linkPath ||
            (currentPath.startsWith('/product/') && linkPath === '/products') ||
            (currentPath.startsWith('/category/') && linkPath === '/categories')) {
            link.classList.add('active');
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
    if (typeof gsap !== 'undefined') {
        gsap.from('.hero-title, .hero-subtitle', {
            duration: 1,
            y: 30,
            opacity: 0,
            stagger: 0.2,
            ease: 'power3.out'
        });

        gsap.from('.product-card', {
            scrollTrigger: {
                trigger: '.products-grid',
                start: 'top 80%',
            },
            duration: 0.8,
            y: 30,
            opacity: 0,
            stagger: 0.1,
            ease: 'power3.out'
        });
    }

    // ===== LOADING STATES =====
    document.querySelectorAll('a, button').forEach(element => {
        element.addEventListener('click', function () {
            if (this.classList.contains('btn') && !this.hasAttribute('disabled')) {
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                this.setAttribute('disabled', 'true');

                // Reset after 5 seconds (fallback)
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.removeAttribute('disabled');
                }, 5000);
            }
        });
    });

    // ===== FIX FOR IOS ZOOM ON INPUT FOCUS =====
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.addEventListener('focus', function (event) {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                document.body.style.zoom = '1';
            }
        }, true);

        document.addEventListener('blur', function (event) {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                document.body.style.zoom = '';
            }
        }, true);
    }
});

// ===== WINDOW LOAD EVENT =====
window.addEventListener('load', function () {
    // Remove loading skeletons
    document.querySelectorAll('.loading-skeleton').forEach(skeleton => {
        skeleton.classList.remove('loading-skeleton');
    });

    // Initialize any third-party libraries
    if (typeof Swiper !== 'undefined') {
        // Initialize product image swiper if present
        const productSwiper = document.querySelector('.product-main-swiper');
        if (productSwiper) {
            new Swiper('.product-main-swiper', {
                loop: true,
                spaceBetween: 10,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                thumbs: {
                    swiper: {
                        el: '.product-thumbs-swiper',
                        slidesPerView: 4,
                        spaceBetween: 10,
                        freeMode: true,
                        watchSlidesVisibility: true,
                        watchSlidesProgress: true,
                    }
                }
            });
        }
    }
});