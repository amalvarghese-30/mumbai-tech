// static/js/admin.js - Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Auto-hide flash messages after 5 seconds
    const flashMessages = document.querySelectorAll('.alert');
    flashMessages.forEach(message => {
        setTimeout(() => {
            message.style.transition = 'opacity 0.5s ease';
            message.style.opacity = '0';
            setTimeout(() => message.remove(), 500);
        }, 5000);
    });

    // Confirm delete actions
    document.querySelectorAll('[data-confirm]').forEach(element => {
        element.addEventListener('click', function (e) {
            const message = this.getAttribute('data-confirm') || 'Are you sure?';
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });

    // Initialize tooltips
    const tooltips = document.querySelectorAll('[title]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function () {
            // Add tooltip implementation if needed
        });
    });

    // Table row click
    document.querySelectorAll('.data-table tr[data-href]').forEach(row => {
        row.addEventListener('click', function () {
            window.location.href = this.dataset.href;
        });
    });

    // Form validation enhancement
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function (e) {
            const requiredFields = this.querySelectorAll('[required]');
            let valid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('is-invalid');
                    valid = false;
                } else {
                    field.classList.remove('is-invalid');
                }
            });

            if (!valid) {
                e.preventDefault();
                alert('Please fill in all required fields.');
            }
        });
    });
});