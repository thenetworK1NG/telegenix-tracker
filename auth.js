// auth.js (TELEGENIX)
// Copied and adapted from create jobs/auth.js for authentication and session management

const authState = {
    username: null
};

let authElements = {};
let csrfToken = '';
const API_BASE = 'https://maphefosigns.co.za/users/';

window.authState = authState;
window.csrfToken = csrfToken;

function ensureAuthElements() {
    function setFormInteractivity(enabled) {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            Array.from(form.elements).forEach(el => {
                if (el.id !== 'loginUserSelect' && el.id !== 'loginBtn' && el.id !== 'loginUserInput') {
                    el.disabled = !enabled;
                }
            });
        });
        document.querySelectorAll('button').forEach(btn => {
            if (!btn.closest('#loginModal')) {
                btn.disabled = !enabled;
            }
        });
    }
    window.setFormInteractivity = setFormInteractivity;
    // Remove login modal if it exists in DOM
    const modal = document.getElementById("loginModal");
    if (modal) modal.remove();
    authElements.loginModal = null;
    authElements.loginUserSelect = null;
    authElements.loginBtn = null;
    authElements.logoutBtn = document.getElementById("logoutBtn");
    if (authElements.logoutBtn) {
        authElements.logoutBtn.onclick = async function() {
            await logout();
        };
    }
    authElements.status = document.getElementById("status") || document.getElementById("authStatus");
}

document.addEventListener('DOMContentLoaded', function() {
    ensureAuthElements();
    initializeApp();
});

async function initializeApp() {
    // Always auto-login as Andre, never show login modal
    authState.username = null;
    sessionStorage.removeItem("username");
    localStorage.removeItem("username");
    
    try {
        const response = await fetch(API_BASE + "login_api.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: 'Andre' }),
            credentials: 'include'
        });
        
        const data = await response.json();
        if (data.success) {
            authState.username = 'Andre';
            sessionStorage.setItem("username", 'Andre');
            localStorage.setItem("username", 'Andre');
            csrfToken = data.csrf_token || '';
            window.csrfToken = csrfToken;
            if (authElements.logoutBtn) authElements.logoutBtn.style.display = '';
            if (window.setFormInteractivity) setFormInteractivity(true);
            console.log("Auto-login as Andre successful");
            
            // Get CSRF token before starting search
            try {
                await getCsrfToken();
                console.log("CSRF token retrieved, starting search...");
                
                // Start the task search after successful authentication and CSRF token
                if (typeof performSearch === 'function') {
                    performSearch();
                    // Store interval id globally so we can pause/resume
                    window._autoRefreshInterval = setInterval(() => {
                        performSearch();
                    }, 10000); // 10 seconds
                }
            } catch (csrfErr) {
                console.log("Failed to get CSRF token:", csrfErr);
            }
        } else {
            console.log("Auto-login as Andre failed: " + (data.error || "Login failed"));
        }
    } catch (err) {
        console.log("Auto-login as Andre error:", err);
    }
}

async function getCsrfToken() {
    const response = await fetch(API_BASE + 'get_csrf_token.php', { credentials: 'include' });
    if (response.status === 401) throw new Error('Not authenticated');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    csrfToken = data.csrf_token || '';
    window.csrfToken = csrfToken;
    return csrfToken;
}

async function checkLogin() {
    // Check if user is already authenticated
    if (authState.username) {
        try {
            // Verify session is still valid
            await getCsrfToken();
            console.log('User already authenticated:', authState.username);
            return true;
        } catch (err) {
            console.log('Session expired, clearing state');
            authState.username = null;
            sessionStorage.removeItem("username");
            localStorage.removeItem("username");
            csrfToken = '';
            window.csrfToken = '';
        }
    }
    
    // Try to restore from session storage
    const savedUsername = sessionStorage.getItem("username") || localStorage.getItem("username");
    if (savedUsername) {
        authState.username = savedUsername;
        try {
            await getCsrfToken();
            console.log('Session restored for:', savedUsername);
            return true;
        } catch (err) {
            console.log('Saved session invalid, clearing');
            authState.username = null;
            sessionStorage.removeItem("username");
            localStorage.removeItem("username");
        }
    }
    
    // Auto-login as Andre like the original system
    try {
        const response = await fetch(API_BASE + "login_api.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: 'Andre' }),
            credentials: 'include'
        });
        
        const data = await response.json();
        if (data.success) {
            authState.username = 'Andre';
            sessionStorage.setItem("username", 'Andre');
            localStorage.setItem("username", 'Andre');
            csrfToken = data.csrf_token || '';
            window.csrfToken = csrfToken;
            console.log("Auto-login as Andre successful");
            return true;
        } else {
            throw new Error(data.error || "Login failed");
        }
    } catch (err) {
        console.log("Auto-login failed:", err);
        throw err;
    }
}

async function showLoginModal() {
    return new Promise((resolve, reject) => {
        // Hide login modal UI
        if (authElements.loginModal) {
            authElements.loginModal.classList.add("hidden");
            authElements.loginModal.style.display = 'none';
        }
        if (authElements.logoutBtn) authElements.logoutBtn.style.display = 'none';
        if (window.setFormInteractivity) setFormInteractivity(false);
        if (typeof clearError === 'function') clearError();
    fetch(API_BASE + "get_users.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ init_token: "your_initial_token" })
        })
        .then(res => { if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`); return res.json(); })
        .then(users => {
            if (users.error) throw new Error(users.error);
            // Auto-login as Andre if present
            if (users.includes('Andre')) {
                fetch(API_BASE + "login_api.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: 'Andre' }),
                    credentials: 'include'
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        authState.username = 'Andre';
                        sessionStorage.setItem("username", 'Andre');
                        localStorage.setItem("username", 'Andre');
                        csrfToken = data.csrf_token || csrfToken;
                        window.csrfToken = csrfToken;
                        if (authElements.logoutBtn) authElements.logoutBtn.style.display = '';
                        if (window.setFormInteractivity) setFormInteractivity(true);
                        console.log("Auto-login as Andre successful");
                        resolve();
                    } else {
                        console.log("Auto-login as Andre failed: " + (data.error || "Login failed"));
                        reject(new Error(data.error || "Login failed"));
                    }
                })
                .catch(err => {
                    console.log("Auto-login as Andre error:", err);
                    reject(err);
                });
            } else {
                console.log("User 'Andre' not found in user list.");
                reject(new Error("User 'Andre' not found"));
            }
        })
        .catch(err => {
            console.error('Failed to load users:', err);
            showError("Failed to load users: " + err.message + ". You can also type a username.");
            if (authElements.loginModal && !document.getElementById('loginUserInput')) {
                const inputWrap = document.createElement('div');
                inputWrap.style.marginTop = '8px';
                inputWrap.innerHTML = `<input id="loginUserInput" type="text" placeholder="Enter username" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ddd" aria-label="Username" />`;
                const content = authElements.loginModal.querySelector('.modal-content');
                const selectEl = authElements.loginModal.querySelector('#loginUserSelect');
                if (selectEl && selectEl.parentNode) {
                    selectEl.parentNode.insertBefore(inputWrap, selectEl.nextSibling);
                } else if (content) {
                    content.insertBefore(inputWrap, content.querySelector('#status') || null);
                }
            }
        });
        if (authElements.loginBtn) {
            authElements.loginBtn.onclick = async () => {
                const inputEl = document.getElementById('loginUserInput');
                const username = (authElements.loginUserSelect && authElements.loginUserSelect.value) || (inputEl && inputEl.value) || '';
                const stayLoggedIn = document.getElementById('stayLoggedIn')?.checked;
                if (!username) { showError("Please select a user"); return; }
                try {
                    const res = await fetch(API_BASE + "login_api.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username }),
                        credentials: 'include'
                    });
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    const data = await res.json();
                    if (data.success) {
                        authState.username = username;
                        sessionStorage.setItem("username", username);
                        if (stayLoggedIn) {
                            localStorage.setItem("username", username);
                        } else {
                            localStorage.removeItem("username");
                        }
                        csrfToken = data.csrf_token || csrfToken;
                        window.csrfToken = csrfToken;
                        authElements.loginModal.classList.add("hidden");
                        authElements.loginModal.style.display = 'none';
                        if (authElements.logoutBtn) authElements.logoutBtn.style.display = '';
                        if (window.setFormInteractivity) setFormInteractivity(true);
                        resolve();
                    } else {
                        showError(data.error || "Login failed");
                    }
                } catch (err) {
                    console.error('Login error:', err);
                    showError("Login error: " + err.message);
                }
            };
        }
        if (authElements.loginModal) {
        authElements.loginModal.onkeydown = e => {
                if (e.key === "Escape") {
            authElements.loginModal.classList.add("hidden");
            authElements.loginModal.style.display = 'none';
                    reject(new Error("Login cancelled"));
                }
            };
        }
    });
}

async function logout() {
    try {
        if (csrfToken) {
            try {
                await fetch(API_BASE + "logout.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ csrf_token: csrfToken }),
                    credentials: 'include'
                });
            } catch (_) {}
        }
    } finally {
        authState.username = null;
        sessionStorage.removeItem("username");
        localStorage.removeItem("username");
        csrfToken = '';
        window.csrfToken = csrfToken;
    }
    if (authElements.logoutBtn) authElements.logoutBtn.style.display = 'none';
    if (window.setFormInteractivity) setFormInteractivity(false);
    await showLoginModal();
}

function showError(msg) {
    if (authElements.status) {
        authElements.status.innerHTML = `<div class="status-message error">${escapeHtml(msg)}</div>`;
    } else {
        console.error("Error:", msg);
    }
}

function escapeHtml(unsafe) {
    if (!unsafe) return "";
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

window.checkLogin = checkLogin;
window.showLoginModal = showLoginModal;
window.logout = logout;
