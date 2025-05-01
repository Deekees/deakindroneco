// Form validation and submission handling
document.addEventListener('DOMContentLoaded', function() {
    // Initialize both forms if they exist
    const contactForm = document.getElementById('contactForm');
    const bookingForm = document.getElementById('bookingForm');

    // Common validation patterns
    const patterns = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[\d\s\-\+\(\)]{10,}$/,
    };

    // Email configuration
    const config = {
        bookingAutoReply: {
            subject: 'Booking Confirmation - Deakin Drone Co.',
            message: `Thank you for booking with Deakin Drone Co.!

                        We have received your booking request and will review it shortly. You can expect to hear from us within 24 hours with confirmation of your booking.

                        What happens next:
                        1. We'll review your booking details and check availability
                        2. We'll send you a final confirmation email with all details
                        3. We will contact to discuss pricing, location& timing

                        If you have any questions in the meantime, please don't hesitate to contact us.

                        Best regards,
                        Deakin Drone Co. Team`
        },
        contactAutoReply: {
            subject: 'Message Received - Deakin Drone Co.',
            message: `Thank you for contacting Deakin Drone Co.!

                        We have received your message and will get back to you as soon as possible, typically within 1-2 business days.

                        Best regards,
                        DD`
        }
    };

    // Validation feedback styles
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        const existingError = formGroup.querySelector('.error-message');
        
        if (!existingError) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.color = '#dc2626';
            errorDiv.style.fontSize = '0.875rem';
            errorDiv.style.marginTop = '0.25rem';
            errorDiv.textContent = message;
            formGroup.appendChild(errorDiv);
        }
        
        input.style.borderColor = '#dc2626';
    }

    function clearError(input) {
        const formGroup = input.closest('.form-group');
        const errorDiv = formGroup.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.style.borderColor = '#e5e7eb';
    }

    // Validate individual input
    function validateInput(input) {
        clearError(input);
        
        if (input.required && !input.value.trim()) {
            showError(input, `${input.name} is required`);
            return false;
        }

        if (input.type === 'email' && !patterns.email.test(input.value)) {
            showError(input, 'Please enter a valid email address');
            return false;
        }

        if (input.name === 'phone' && !patterns.phone.test(input.value)) {
            showError(input, 'Please enter a valid phone number');
            return false;
        }

        if (input.type === 'checkbox' && input.name === 'terms' && !input.checked) {
            showError(input, 'You must accept the Terms and Conditions to proceed');
            return false;
        }

        return true;
    }

    // Form submission handler
    function handleSubmit(event, formType) {
        event.preventDefault();
        const form = event.target;
        let isValid = true;

        // Validate all inputs
        form.querySelectorAll('input, textarea, select').forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });

        // Additional check for Terms and Conditions on booking form
        if (formType === 'booking') {
            const termsCheckbox = form.querySelector('input[name="terms"]');
            if (!termsCheckbox.checked) {
                showError(termsCheckbox, 'You must accept the Terms and Conditions to proceed');
                isValid = false;
            }
        }

        if (!isValid) {
            return;
        }

        // Disable submit button and show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        // Prepare form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Add form type and autoresponse configuration to the data
        data.formType = formType;
        data._autoresponse = formType === 'booking' 
            ? config.bookingAutoReply.message 
            : config.contactAutoReply.message;
        data._subject = formType === 'booking'
            ? config.bookingAutoReply.subject
            : config.contactAutoReply.subject;
        data._template = 'box';

        // Send form data using FormSubmit.co
        /*fetch('https://formsubmit.co/ideakinster@gmail.com', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        })
            */
        const formDataToSend = new FormData();
        for (const [key, value] of Object.entries(data)) {
            formDataToSend.append(key, value);
        }
        
        fetch('https://formsubmit.co/a551d0ff57de76cd3ef551b3b0347a15', {
            method: "POST",
            body: formDataToSend
        })
        
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (formType === 'booking') {
                // Redirect to thank you page for booking submissions
                window.location.href = 'https://deakindroneco.vercel.app/thank-you.html';
            } else {
                // Show success message for contact form
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.style.backgroundColor = '#dcfce7';
                successMessage.style.color = '#166534';
                successMessage.style.padding = '1rem';
                successMessage.style.borderRadius = '0.375rem';
                successMessage.style.marginBottom = '1rem';
                successMessage.textContent = 'Thank you for your message. We will get back to you soon!';

                form.insertBefore(successMessage, form.firstChild);
                form.reset();

                // Remove success message after 5 seconds
                setTimeout(() => {
                    successMessage.remove();
                }, 5000);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Show error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.style.backgroundColor = '#fee2e2';
            errorMessage.style.color = '#dc2626';
            errorMessage.style.padding = '1rem';
            errorMessage.style.borderRadius = '0.375rem';
            errorMessage.style.marginBottom = '1rem';
            errorMessage.textContent = 'There was an error sending your message. Please try again later.';
            
            form.insertBefore(errorMessage, form.firstChild);

            // Remove error message after 5 seconds
            setTimeout(() => {
                errorMessage.remove();
            }, 5000);
        })
        .finally(() => {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    }

    // Add event listeners to forms
    if (contactForm) {
        //contactForm.addEventListener('submit', (e) => handleSubmit(e, 'contact'));
    }

    document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(contactForm);

            fetch('https://formsubmit.co/ajax/ideakinster@gmail.com', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    window.location.href = 'thank-you.html';
                } else {
                    alert('Something went wrong. Please try again later.');
                }
            })
            .catch(error => {
                console.error(error);
                alert('There was an error submitting the form.');
            });
        });
    }
});


    if (bookingForm) {
        //bookingForm.addEventListener('submit', (e) => handleSubmit(e, 'booking'));

        // Add real-time validation for terms checkbox
        const termsCheckbox = bookingForm.querySelector('input[name="terms"]');
        if (termsCheckbox) {
            termsCheckbox.addEventListener('change', () => {
                if (termsCheckbox.checked) {
                    clearError(termsCheckbox);
                } else {
                    showError(termsCheckbox, 'You must accept the Terms and Conditions to proceed');
                }
            });
        }
    }

    // Add input validation on blur
    document.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('blur', () => validateInput(input));
        input.addEventListener('input', () => clearError(input));
    });
}); 
