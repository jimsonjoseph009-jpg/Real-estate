// Register Page Handler
async function handleRegister(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const nationalId = document.getElementById('nationalId').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;

    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const generalError = document.getElementById('generalError');

    // Clear previous errors
    document.getElementById('fullNameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('phoneError').textContent = '';
    document.getElementById('nationalIdError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('confirmPasswordError').textContent = '';
    generalError.textContent = '';

    // Validate inputs
    let hasError = false;

    if (!fullName) {
        document.getElementById('fullNameError').textContent = 'Full name is required';
        hasError = true;
    }

    if (!validateEmail(email)) {
        document.getElementById('emailError').textContent = 'Invalid email format';
        hasError = true;
    }

    if (!validatePhone(phone)) {
        document.getElementById('phoneError').textContent = 'Invalid phone format';
        hasError = true;
    }

    if (!nationalId || nationalId.length < 5) {
        document.getElementById('nationalIdError').textContent = 'Valid national ID is required';
        hasError = true;
    }

    if (!validatePassword(password)) {
        document.getElementById('passwordError').textContent = 
            'Password must be at least 8 chars with uppercase, lowercase, number and special character';
        hasError = true;
    }

    if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
        hasError = true;
    }

    if (hasError) return;

    try {
        btnText.textContent = 'Creating Account...';
        btnSpinner.style.display = 'inline-block';

        const response = await userAPI.register({
            full_name: fullName,
            email,
            phone,
            password,
            role,
            national_id: nationalId
        });

        showToast('Account created successfully! Redirecting to login...', 'success');

        // Redirect to login page
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (error) {
        generalError.textContent = error.message || 'Registration failed. Please try again.';
        showToast(error.message, 'error');
    } finally {
        btnText.textContent = 'Create Account';
        btnSpinner.style.display = 'none';
    }
}
