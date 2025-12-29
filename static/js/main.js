// static/js/main.js - Premium Interactions
document.addEventListener('DOMContentLoaded', function () {
    // Navigation Scroll Effect
    const nav = document.getElementById('mainNav');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // GSAP Animations
    if (typeof gsap !== 'undefined') {
        // Hero Section Animation
        gsap.from('.hero-title', {
            duration: 1,
            y: 50,
            opacity: 0,
            ease: 'power3.out'
        });

        gsap.from('.hero-subtitle', {
            duration: 1,
            y: 30,
            opacity: 0,
            delay: 0.3,
            ease: 'power3.out'
        });

        gsap.from('.hero-actions', {
            duration: 1,
            y: 30,
            opacity: 0,
            delay: 0.6,
            ease: 'power3.out'
        });

        // Category Cards Animation
        gsap.utils.toArray('.category-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                delay: i * 0.1,
                ease: 'power3.out'
            });
        });

        // Product Cards Animation
        gsap.utils.toArray('.product-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                y: 40,
                opacity: 0,
                duration: 0.8,
                delay: i * 0.1,
                ease: 'power3.out'
            });
        });
    }

    // Form Enhancements
    const forms = document.querySelectorAll('.premium-form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('.premium-input');
        inputs.forEach(input => {
            // Add focus effect
            input.addEventListener('focus', function () {
                this.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', function () {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });
        });
    });

    // Image Lazy Loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Add to Favorites Function
    window.addToFavorites = function (productId) {
        // Implementation for favorites
        console.log('Added product', productId, 'to favorites');
        // Could use localStorage or API call
    };

    // Quantity Selector for Product Pages
    const quantitySelectors = document.querySelectorAll('.quantity-selector');
    quantitySelectors.forEach(selector => {
        const minusBtn = selector.querySelector('.qty-minus');
        const plusBtn = selector.querySelector('.qty-plus');
        const input = selector.querySelector('.qty-input');

        minusBtn.addEventListener('click', () => {
            let value = parseInt(input.value) || 1;
            if (value > 1) {
                input.value = value - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            let value = parseInt(input.value) || 1;
            input.value = value + 1;
        });

        input.addEventListener('change', () => {
            let value = parseInt(input.value) || 1;
            if (value < 1) input.value = 1;
        });
    });
});
// Mumbai-Tech Industrial JavaScript
document.addEventListener('DOMContentLoaded', function () {

    // Initialize GSAP
    gsap.registerPlugin(ScrollTrigger);

    // ===== PRODUCT CARD INTERACTIONS =====
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                duration: 0.3,
                y: -8,
                ease: 'power2.out',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                duration: 0.3,
                y: 0,
                ease: 'power2.out',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
            });
        });
    });

    // ===== NAVIGATION HOVER EFFECTS =====
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            gsap.to(link, {
                duration: 0.2,
                color: '#f5f5f5',
                ease: 'power2.out'
            });
        });

        link.addEventListener('mouseleave', () => {
            gsap.to(link, {
                duration: 0.2,
                color: '#b0b0b0',
                ease: 'power2.out'
            });
        });
    });

    // ===== SCROLL-BASED ANIMATIONS =====
    const sections = document.querySelectorAll('.section-animate');
    sections.forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
            },
            duration: 1,
            y: 50,
            opacity: 0,
            ease: 'power3.out'
        });
    });

    // ===== FORM VALIDATION ENHANCEMENT =====
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // Focus effect
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
                gsap.to(input, {
                    duration: 0.2,
                    borderColor: '#f5b301',
                    boxShadow: '0 0 0 3px rgba(245, 179, 1, 0.15)',
                    ease: 'power2.out'
                });
            });

            // Blur effect
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
                gsap.to(input, {
                    duration: 0.2,
                    borderColor: '#2c2c2c',
                    boxShadow: 'none',
                    ease: 'power2.out'
                });
            });
        });
    });

    // ===== LAZY LOADING FOR PRODUCT IMAGES =====
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });

    // ===== SEARCH BAR ENHANCEMENT =====
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function (e) {
            const query = e.target.value.trim();
            if (query.length > 2) {
                // You can implement AJAX search here
                console.log('Searching for:', query);
            }
        }, 300));
    }

    // ===== DEBOUNCE UTILITY =====
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ===== INDUSTRIAL THEME TOGGLE (FOR FUTURE) =====
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-industry"></i>';
    themeToggle.style.position = 'fixed';
    themeToggle.style.bottom = '2rem';
    themeToggle.style.right = '2rem';
    themeToggle.style.zIndex = '1000';
    themeToggle.style.background = 'var(--accent-primary)';
    themeToggle.style.color = 'black';
    themeToggle.style.border = 'none';
    themeToggle.style.width = '50px';
    themeToggle.style.height = '50px';
    themeToggle.style.borderRadius = '50%';
    themeToggle.style.cursor = 'pointer';
    themeToggle.style.fontSize = '1.25rem';
    themeToggle.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('industrial-dark');
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('industrial-dark')) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-industry';
        }
    });

    // Uncomment to enable theme toggle
    // document.body.appendChild(themeToggle);
});

// ===== GSAP INITIALIZATION =====
window.addEventListener('load', () => {
    // Initial page load animation
    gsap.from('body', {
        duration: 0.5,
        opacity: 0,
        ease: 'power2.inOut'
    });
});
// Add to main.js
document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            this.innerHTML = navMenu.classList.contains('active')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });

        // Close menu on click outside
        document.addEventListener('click', function (event) {
            if (!navMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                navMenu.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
});