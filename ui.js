/**
 * Boss Block Puzzle - UI & Firebase Interactions
 * Handles modals, authentication, and leaderboard fetching.
 */

class UIManager {
    constructor() {
        this.screens = {
            home: document.getElementById('home-screen'),
            game: document.getElementById('game-screen')
        };
        this.modals = {
            leaderboard: document.getElementById('leaderboard-modal'),
            auth: document.getElementById('auth-modal'),
            gameOver: document.getElementById('game-over-modal')
        };
        this.overlay = document.getElementById('overlay');
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.updateAuthStatus();
        this.fetchLeaderboard();
        this.updateHomeStats();
    }

    attachEventListeners() {
        // Screens
        document.getElementById('start-game-btn').addEventListener('click', () => this.switchScreen('game'));
        document.getElementById('go-home-btn').addEventListener('click', () => this.switchScreen('home'));
        document.getElementById('exit-btn').addEventListener('click', () => this.switchScreen('home'));

        // Modal Toggling
        document.getElementById('home-auth-btn').addEventListener('click', () => this.showModal('auth'));
        document.getElementById('home-leaderboard-btn').addEventListener('click', () => this.showModal('leaderboard'));
        
        // Close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => this.hideAllModals());
        });

        // Auth
        document.getElementById('google-auth').addEventListener('click', () => this.handleGoogleLogin());
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());

        // Game Actions
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
    }

    switchScreen(name) {
        Object.values(this.screens).forEach(s => s.classList.add('hidden'));
        this.screens[name].classList.remove('hidden');
        this.hideAllModals();

        if (name === 'game') {
            this.restartGame();
        } else if (name === 'home') {
            this.updateHomeStats();
        }
    }

    updateHomeStats() {
        const highScore = localStorage.getItem('boss_block_highscore') || '0';
        const worldEl = document.getElementById('home-world-record');
        if (worldEl) worldEl.textContent = parseInt(highScore).toString().padStart(6, '0');
        
        const lastScore = localStorage.getItem('boss_block_last_score') || '0';
        const lastEl = document.getElementById('home-last-score');
        if (lastEl) lastEl.textContent = parseInt(lastScore).toString().padStart(6, '0');
    }

    showModal(name) {
        this.hideAllModals();
        this.overlay.classList.remove('hidden');
        this.modals[name].classList.remove('hidden');
        
        if (name === 'leaderboard') {
            this.fetchLeaderboard();
        }
    }

    hideAllModals() {
        this.overlay.classList.add('hidden');
        Object.values(this.modals).forEach(m => m.classList.add('hidden'));
    }

    async handleGoogleLogin() {
        if (!window.isFirebaseReady()) {
            alert("Firebase not configured. Please set up your credentials in firebase-config.js.");
            return;
        }

        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await window.auth.signInWithPopup(provider);
            this.updateAuthStatus();
            this.hideAllModals();
        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed: " + error.message);
        }
    }

    async handleLogout() {
        if (!window.isFirebaseReady()) return;
        await window.auth.signOut();
        this.updateAuthStatus();
    }

    updateAuthStatus() {
        if (!window.isFirebaseReady()) return;

        const userStatus = document.querySelector('.user-status');
        const googleAuthWrap = document.getElementById('google-auth-wrap');
        const userEmail = document.getElementById('user-email');

        window.auth.onAuthStateChanged(user => {
            if (user) {
                if (userStatus) { userStatus.classList.remove('hidden'); }
                if (googleAuthWrap) { googleAuthWrap.classList.add('hidden'); }
                if (userEmail) { userEmail.textContent = user.displayName || user.email; }
            } else {
                if (userStatus) { userStatus.classList.add('hidden'); }
                if (googleAuthWrap) { googleAuthWrap.classList.remove('hidden'); }
            }
        });
    }

    async fetchLeaderboard() {
        if (!window.isFirebaseReady()) return;

        const listContainer = document.getElementById('leaderboard-list');
        listContainer.innerHTML = '<div class="loading-spinner"><span></span></div>';

        try {
            const snapshot = await window.db.collection('leaderboard')
                .orderBy('score', 'desc')
                .limit(10)
                .get();

            listContainer.innerHTML = '';
            
            if (snapshot.empty) {
                listContainer.innerHTML = '<p style="text-align:center;color:#475569;padding:2rem 0">No world records yet!<br>Be the first to set one.</p>';
                return;
            }

            const medals = ['🥇','🥈','🥉'];

            snapshot.docs.forEach((doc, index) => {
                const data = doc.data();
                const item = document.createElement('div');
                item.className = 'rank-item';
                
                const medal = index < 3 ? medals[index] : '';
                item.innerHTML = `
                    <span class="rank-medal">${medal || ''}</span>
                    <span class="rank-num" style="${index < 3 ? 'display:none' : ''}">${index + 1}</span>
                    <span class="rank-name">${data.name || 'Anonymous'}</span>
                    <span class="rank-score">${data.score.toLocaleString()}</span>
                `;
                listContainer.appendChild(item);
            });
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            listContainer.innerHTML = '<p style="text-align:center;color:#ef4444;padding:2rem 0">Error loading scores.</p>';
        }
    }

    restartGame() {
        this.hideAllModals();
        if (window.gameInstance) {
            // Pass reset logic as onReady callback — runs after canvas is fully sized
            window.gameInstance.setupCanvas(() => {
                window.gameInstance.grid = Array(8).fill().map(() => Array(8).fill(0));
                window.gameInstance.score = 0;
                window.gameInstance.isGameOver = false;
                window.gameInstance.activeShapes = [null, null, null];
                window.gameInstance.generateShapes();
                window.gameInstance.updateUI();
            });
        }
    }
}

// Start UI Manager
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
});

export default UIManager;
