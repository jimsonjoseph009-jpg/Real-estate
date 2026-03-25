// Login Page Handler
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const generalError = document.getElementById('generalError');

    // Clear previous errors
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    generalError.textContent = '';

    // Validate inputs
    if (!email || !password) {
        generalError.textContent = 'Please fill in all fields';
        return;
    }

    if (!validateEmail(email)) {
        document.getElementById('emailError').textContent = 'Invalid email format';
        return;
    }

    try {
        btnText.textContent = 'Logging in...';
        btnSpinner.style.display = 'inline-block';

        const response = await userAPI.login({ email, password });

        // Store auth data
        setAuthToken(response.token);
        setCurrentUser(response.user);

        showToast('Login successful!', 'success');

        // Redirect to home page
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);

    } catch (error) {
        generalError.textContent = error.message || 'Login failed. Please check your credentials.';
        showToast(error.message, 'error');
    } finally {
        btnText.textContent = 'Login';
        btnSpinner.style.display = 'none';
    }
}
