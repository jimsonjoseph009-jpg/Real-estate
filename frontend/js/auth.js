// Authentication Management
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

function getAuthToken() {
    return localStorage.getItem('token');
}

function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function setAuthToken(token) {
    localStorage.setItem('token', token);
}

function setCurrentUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../index.html';
}

function updateAuthUI() {
    const authLinks = document.getElementById('authLinks');
    const userLinks = document.getElementById('userLinks');
    const userNameDisplay = document.getElementById('userNameDisplay');

    if (isLoggedIn()) {
        const user = getCurrentUser();
        if (authLinks) authLinks.style.display = 'none';
        if (userLinks) {
            userLinks.style.display = 'flex';
            if (userNameDisplay) {
                userNameDisplay.textContent = `Welcome, ${user.fullName}`;
            }
        }
    } else {
        if (authLinks) authLinks.style.display = 'flex';
        if (userLinks) userLinks.style.display = 'none';
    }
}

// Initialize auth UI when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
});
