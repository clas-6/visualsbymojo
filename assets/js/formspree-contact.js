/**
 * Formspree Contact Form Handler for visualsbyiammojo
 * Enhanced user experience with validation and feedback
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const loading = document.querySelector('.loading');
    const errorMessage = document.querySelector('.error-message');
    const sentMessage = document.querySelector('.sent-message');
    const messageTextarea = document.getElementById('message');
    const messageCount = document.getElementById('messageCount');

    // Character counter for message field
    if (messageTextarea && messageCount) {
        messageTextarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            messageCount.textContent = currentLength;
            
            // Change color based on character count
            if (currentLength > 1800) {
                messageCount.style.color = '#dc3545'; // Red
            } else if (currentLength > 1500) {
                messageCount.style.color = '#fd7e14'; // Orange
            } else {
                messageCount.style.color = '#6c757d'; // Default gray
            }
        });
    }

    // Form validation functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validateForm() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        
        let isValid = true;
        
        // Clear previous validation states
        document.querySelectorAll('.is-invalid').forEach(field => {
            field.classList.remove('is-invalid');
        });
        
        // Name validation
        if (!name || name.length < 2) {
            showFieldError('name', 'Please enter your full name (at least 2 characters)');
            isValid = false;
        }
        
        // Email validation
        if (!email) {
            showFieldError('email', 'Please enter your email address');
            isValid = false;
        } else if (!validateEmail(email)) {
            showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Subject validation
        if (!subject || subject.length < 3) {
            showFieldError('subject', 'Please enter a subject (at least 3 characters)');
            isValid = false;
        }
        
        // Message validation
        if (!message || message.length < 10) {
            showFieldError('message', 'Please enter your message (at least 10 characters)');
            isValid = false;
        }
        
        return isValid;
    }

    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const feedback = field.parentNode.querySelector('.invalid-feedback');
        
        field.classList.add('is-invalid');
        if (feedback) {
            feedback.textContent = message;
        }
    }

    function hideMessages() {
        loading.style.display = 'none';
        errorMessage.style.display = 'none';
        sentMessage.style.display = 'none';
    }

    function showLoading() {
        hideMessages();
        loading.style.display = 'block';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
    }

    function showSuccess() {
        hideMessages();
        sentMessage.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
        
        // Reset form after success
        setTimeout(() => {
            form.reset();
            messageCount.textContent = '0';
            messageCount.style.color = '#6c757d';
            hideMessages();
        }, 5000);
    }

    function showError(message = 'Sorry, there was an error sending your message. Please try again.') {
        hideMessages();
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
    }

    // Form submission handler
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form before submission
            if (!validateForm()) {
                return;
            }
            
            // Show loading state
            showLoading();
            
            try {
                // Prepare form data
                const formData = new FormData(form);
                
                // Add additional fields for Formspree
                formData.append('_subject', `New Contact from visualsbyiammojo Website: ${document.getElementById('subject').value}`);
                formData.append('_replyto', document.getElementById('email').value);
                
                // Submit to Formspree
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    showSuccess();
                } else {
                    const data = await response.json();
                    if (data.errors) {
                        showError('Please check your form fields and try again.');
                    } else {
                        showError();
                    }
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showError();
            }
        });
    }

    // Real-time validation feedback
    const formFields = ['name', 'email', 'subject', 'message'];
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', function() {
                if (this.classList.contains('is-invalid')) {
                    // Re-validate field when user fixes it
                    if (this.value.trim()) {
                        this.classList.remove('is-invalid');
                    }
                }
            });
            
            // Remove invalid class on input
            field.addEventListener('input', function() {
                if (this.classList.contains('is-invalid') && this.value.trim()) {
                    this.classList.remove('is-invalid');
                }
            });
        }
    });

    // Initialize character counter
    if (messageTextarea && messageCount) {
        messageCount.textContent = messageTextarea.value.length;
    }
});