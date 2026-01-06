/**
 * Enhanced Contact Form Handler for visualsbyiammojo
 * Features: CSRF Protection, Real-time validation, Rate limiting feedback
 */

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const loadingDiv = document.querySelector('.loading');
    const errorDiv = document.querySelector('.error-message');
    const successDiv = document.querySelector('.sent-message');
    const messageTextarea = document.getElementById('message');
    const messageCount = document.getElementById('messageCount');
    const csrfTokenInput = document.getElementById('csrf_token');
    
    // Initialize form
    initializeForm();
    
    /**
     * Initialize form with CSRF token and event listeners
     */
    async function initializeForm() {
        try {
            // Get CSRF token
            await loadCSRFToken();
            
            // Add event listeners
            setupEventListeners();
            
        } catch (error) {
            console.error('Form initialization error:', error);
            showError('Failed to initialize form. Please refresh the page.');
        }
    }
    
    /**
     * Load CSRF token from server
     */
    async function loadCSRFToken() {
        try {
            const response = await fetch('forms/contact.php?get_token=1');
            const data = await response.json();
            
            if (data.success && data.csrf_token) {
                csrfTokenInput.value = data.csrf_token;
            } else {
                throw new Error('Failed to get CSRF token');
            }
        } catch (error) {
            console.error('CSRF token error:', error);
            throw error;
        }
    }
    
    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        // Form submission
        contactForm.addEventListener('submit', handleFormSubmit);
        
        // Character counter for message
        if (messageTextarea && messageCount) {
            messageTextarea.addEventListener('input', updateCharacterCount);
            updateCharacterCount(); // Initial count
        }
        
        // Real-time validation
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    }
    
    /**
     * Handle form submission
     */
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            showError('Please correct the errors below.');
            return;
        }
        
        // Disable submit button and show loading
        setFormState('loading');
        
        try {
            // Prepare form data
            const formData = new FormData(contactForm);
            
            // Submit form
            const response = await fetch('forms/contact.php', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                setFormState('success');
                showSuccess(result.message);
                contactForm.reset();
                updateCharacterCount();
                // Reload CSRF token for next submission
                await loadCSRFToken();
            } else {
                setFormState('error');
                showError(result.message);
                
                // If it's a CSRF error, reload token
                if (result.message.includes('token') || result.message.includes('CSRF')) {
                    await loadCSRFToken();
                }

                // Handle server-side rate limit response
                if (result.error_code === 'RATE_LIMIT') {
                    handleRateLimit();
                }
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            setFormState('error');
            showError('Network error. Please check your connection and try again.');
        }
    }
    
    /**
     * Validate entire form
     */
    function validateForm() {
        const inputs = contactForm.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    /**
     * Validate individual field
     */
    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            errorMessage = `${getFieldLabel(fieldName)} is required.`;
            isValid = false;
        }
        // Email validation
        else if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errorMessage = 'Please enter a valid email address.';
                isValid = false;
            }
        }
        // Length validation
        else if (field.hasAttribute('maxlength')) {
            const maxLength = parseInt(field.getAttribute('maxlength'));
            if (value.length > maxLength) {
                errorMessage = `${getFieldLabel(fieldName)} must be less than ${maxLength} characters.`;
                isValid = false;
            }
        }
        
        // Show/hide error
        if (isValid) {
            clearFieldError(field);
        } else {
            showFieldError(field, errorMessage);
        }
        
        return isValid;
    }
    
    /**
     * Show field error
     */
    function showFieldError(field, message) {
        const feedback = field.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.textContent = message;
            feedback.style.display = 'block';
        }
        field.classList.add('is-invalid');
    }
    
    /**
     * Clear field error
     */
    function clearFieldError(field) {
        const feedback = field.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.style.display = 'none';
        }
        field.classList.remove('is-invalid');
    }
    
    /**
     * Get user-friendly field label
     */
    function getFieldLabel(fieldName) {
        const labels = {
            'name': 'Name',
            'email': 'Email',
            'subject': 'Subject',
            'message': 'Message'
        };
        return labels[fieldName] || fieldName;
    }
    
    /**
     * Update character counter
     */
    function updateCharacterCount() {
        if (messageTextarea && messageCount) {
            const currentLength = messageTextarea.value.length;
            messageCount.textContent = currentLength;
            
            // Change color based on usage
            const maxLength = 2000;
            const percentage = (currentLength / maxLength) * 100;
            
            if (percentage >= 90) {
                messageCount.style.color = '#dc3545'; // Red
            } else if (percentage >= 75) {
                messageCount.style.color = '#ffc107'; // Yellow
            } else {
                messageCount.style.color = '#6c757d'; // Gray
            }
        }
    }
    
    /**
     * Set form state (loading, success, error, normal)
     */
    function setFormState(state) {
        // Reset all states
        loadingDiv.style.display = 'none';
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';
        submitBtn.disabled = false;
        
        switch (state) {
            case 'loading':
                loadingDiv.style.display = 'block';
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
                break;
            case 'success':
                successDiv.style.display = 'block';
                submitBtn.textContent = 'Send Message';
                break;
            case 'error':
                errorDiv.style.display = 'block';
                submitBtn.textContent = 'Send Message';
                break;
            default:
                submitBtn.textContent = 'Send Message';
        }
    }
    
    /**
     * Show success message
     */
    function showSuccess(message) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        
        // Scroll to message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Hide after 5 seconds
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 5000);
    }
    
    /**
     * Show error message
     */
    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Scroll to message
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Hide after 8 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 8000);
    }
    
    /**
     * Handle rate limiting feedback
     */
    function handleRateLimit() {
        showError('Too many requests. Please wait before sending another message.');
        
        // Disable form for 1 minute
        submitBtn.disabled = true;
        let countdown = 60;
        
        const countdownInterval = setInterval(() => {
            submitBtn.textContent = `Wait ${countdown}s`;
            countdown--;
            
            if (countdown < 0) {
                clearInterval(countdownInterval);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }
        }, 1000);
    }
    
    /**
     * Check if we should show rate limit warning
     */
    function checkRateLimit() {
        const submissions = JSON.parse(localStorage.getItem('visualsbyiammojo_submissions') || '[]');
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        // Clean old submissions
        const recentSubmissions = submissions.filter(time => (now - time) < oneHour);
        
        if (recentSubmissions.length >= 4) { // Warn at 4, block at 5
            showError('You are approaching the submission limit. Please wait before sending another message.');
        }
        
        // Store cleaned submissions
        localStorage.setItem('visualsbyiammojo_submissions', JSON.stringify(recentSubmissions));
    }
    
    /**
     * Track submission
     */
    function trackSubmission() {
        const submissions = JSON.parse(localStorage.getItem('visualsbyiammojo_submissions') || '[]');
        submissions.push(Date.now());
        localStorage.setItem('visualsbyiammojo_submissions', JSON.stringify(submissions));
    }
    
    // Check rate limit on page load
    checkRateLimit();
});
