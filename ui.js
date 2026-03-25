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
            gameOver: document.getElementById('game-over-modal'),
            name: document.getElementById('name-modal')
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
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.handleLogout());

        // Game Actions
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());

        // Player Identity Auto-Generate
        if (!localStorage.getItem('boss_block_username')) {
            localStorage.setItem('boss_block_username', 'user' + Math.floor(Math.random() * 10000000));
        }
        
        const displayName = document.getElementById('home-player-name');
        if (displayName) displayName.textContent = localStorage.getItem('boss_block_username');

        // Edit Name Handler
        const editNameBtn = document.getElementById('edit-name-btn');
        if (editNameBtn) editNameBtn.addEventListener('click', () => this.openNameEditor());

        const saveNameBtn = document.getElementById('save-name-action-btn');
        if (saveNameBtn) saveNameBtn.addEventListener('click', () => this.handleSaveName());

        // Email Auth Toggles and Handlers
        this.isSignUpMode = false;
        
        const authActionBtn = document.getElementById('auth-action-btn');
        if (authActionBtn) authActionBtn.addEventListener('click', () => this.handleEmailAuth());
        
        const authToggleLink = document.getElementById('auth-toggle-link');
        if (authToggleLink) {
            authToggleLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.isSignUpMode = !this.isSignUpMode;
                const toggleText = document.getElementById('auth-toggle-text');
                if (this.isSignUpMode) {
                    authActionBtn.textContent = 'Sign Up';
                    toggleText.textContent = 'Already have an account?';
                    authToggleLink.textContent = 'Sign In';
                } else {
                    authActionBtn.textContent = 'Sign In';
                    toggleText.textContent = 'Need an account?';
                    authToggleLink.textContent = 'Sign Up';
                }
            });
        }
    }

    switchScreen(name) {
        Object.values(this.screens).forEach(s => s.classList.add('hidden'));
        this.screens[name].classList.remove('hidden');
        this.hideAllModals();

        if (name === 'game') {
            if (window.gameInstance && window.gameInstance.isGameOver) {
                this.restartGame();
            } else if (window.gameInstance) {
                window.gameInstance.setupCanvas();
            }
        } else if (name === 'home') {
            this.updateHomeStats();
        }
    }

    updateHomeStats() {
        const highScore = localStorage.getItem('boss_block_highscore') || '0';
        const lastScore = localStorage.getItem('boss_block_last_score') || '0';
        const worldRecord = localStorage.getItem('boss_block_worldrecord') || highScore;
        
        const worldEl = document.getElementById('home-world-record');
        if (worldEl) worldEl.textContent = parseInt(worldRecord).toString().padStart(6, '0');
        
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

    async handleEmailAuth() {
        if (!window.isFirebaseReady()) return;
        
        const email = document.getElementById('auth-email').value.trim();
        const pwd = document.getElementById('auth-password').value;
        if (!email || !pwd) {
            alert('Please enter an email and password.');
            return;
        }

        const btn = document.getElementById('auth-action-btn');
        btn.textContent = 'Processing...';

        try {
            if (this.isSignUpMode) {
                const user = window.auth.currentUser;
                const credential = firebase.auth.EmailAuthProvider.credential(email, pwd);
                if (user && user.isAnonymous) {
                    try {
                        await user.linkWithCredential(credential);
                    } catch (linkError) {
                        if (linkError.code === 'auth/email-already-in-use') {
                            await window.auth.signInWithCredential(credential);
                        } else {    
                            throw linkError;
                        }
                    }
                } else {
                    await window.auth.createUserWithEmailAndPassword(email, pwd);
                }
            } else {
                await window.auth.signInWithEmailAndPassword(email, pwd);
            }
            
            this.hideAllModals();
            document.getElementById('auth-email').value = '';
            document.getElementById('auth-password').value = '';
        } catch (error) {
            console.error("Auth failed:", error);
            alert("Auth failed: " + error.message);
        } finally {
            if (btn) btn.textContent = this.isSignUpMode ? 'Sign Up' : 'Sign In';
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
        const emailAuthWrap = document.getElementById('email-auth-wrap');
        const userEmail = document.getElementById('user-email');

        window.auth.onAuthStateChanged(async user => {
            if (user) {
                // If they logged in passing Auth, hide the button, show their name. Wait... if anonymous, keep the button!
                if (!user.isAnonymous) {
                    if (userStatus) { userStatus.classList.remove('hidden'); }
                    if (emailAuthWrap) { emailAuthWrap.classList.add('hidden'); }
                    if (userEmail) { userEmail.textContent = user.email; }
                    document.getElementById('home-auth-btn').style.display = 'none'; // hide backup pill
                } else {
                    if (userStatus) { userStatus.classList.add('hidden'); }
                    if (emailAuthWrap) { emailAuthWrap.classList.remove('hidden'); }
                    document.getElementById('home-auth-btn').style.display = 'flex';
                }

                // Sync Personal High Score bi-directionally (Applies to both Anonymous and Authenticated users!)
                try {
                    const docSnap = await window.db.collection('leaderboard').doc(user.uid).get();
                    let fbScore = 0;
                    if (docSnap.exists) {
                        fbScore = docSnap.data().score || 0;
                        const fbName = docSnap.data().name;
                        
                        // If Firebase has a nice name but the local context doesn't have it, pull it down!
                        const localName = localStorage.getItem('boss_block_username') || '';
                        if (fbName && fbName !== 'Anonymous Player' && (!localName.startsWith('user') || localName === '')) {
                            localStorage.setItem('boss_block_username', fbName);
                            const nameDisplay = document.getElementById('home-player-name');
                            if (nameDisplay) nameDisplay.textContent = fbName;
                        }
                    }
                    
                    const localScore = parseInt(localStorage.getItem('boss_block_highscore')) || 0;
                    const finalName = localStorage.getItem('boss_block_username') || user.displayName || user.email || 'Anonymous Player';

                    if (fbScore > localScore) {
                        // Firebase has a higher score (e.g. played on another device)
                        localStorage.setItem('boss_block_highscore', fbScore);
                        if (window.gameInstance) {
                            window.gameInstance.userHighScore = fbScore;
                            window.gameInstance.updateUI();
                        }
                    } else if (localScore > fbScore && localScore > 0) {
                        // Local has a higher score (played offline, now connected)
                        await window.db.collection('leaderboard').doc(user.uid).set({
                            name: finalName,
                            score: localScore,
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        }, { merge: true });
                    }
                } catch (e) {
                    console.error("Failed to sync personal highest score:", e);
                }
            } else {
                if (userStatus) { userStatus.classList.add('hidden'); }
                if (googleAuthWrap) { googleAuthWrap.classList.remove('hidden'); }

                // Force Auto-login Anonymously so all players get a database record
                window.auth.signInAnonymously().catch(err => {
                    console.error("Anonymous authentication failed:", err);
                });
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

            // Save the #1 World Record to local storage and update Game
            const topScore = snapshot.docs[0].data().score || 0;
            localStorage.setItem('boss_block_worldrecord', topScore);
            if (window.gameInstance && topScore > window.gameInstance.worldHighRun) {
                window.gameInstance.worldHighRun = topScore;
                window.gameInstance.updateUI();
            }
            
            // Also update home screen directly if visible
            const worldEl = document.getElementById('home-world-record');
            if (worldEl) worldEl.textContent = topScore.toString().padStart(6, '0');

            const medals = ['🥇','🥈','🥉'];

            snapshot.docs.forEach((doc, index) => {
                const data = doc.data();
                const item = document.createElement('div');
                item.className = 'rank-item';
                
                const isMe = window.auth && window.auth.currentUser && window.auth.currentUser.uid === doc.id;
                
                const medal = index < 3 ? medals[index] : '';
                item.innerHTML = `
                    <span class="rank-medal">${medal || ''}</span>
                    <span class="rank-num" style="${index < 3 ? 'display:none' : ''}">${index + 1}</span>
                    <span class="rank-name" ${isMe ? 'id="leaderboard-my-name" style="cursor:pointer; color:var(--primary);" title="Click to edit your name"' : ''}>
                        ${data.name || 'Anonymous Player'} 
                        ${isMe ? '<span style="opacity:0.6;font-size:0.8em;margin-left:4px;">✎</span>' : ''}
                    </span>
                    <span class="rank-score">${data.score.toLocaleString()}</span>
                `;
                listContainer.appendChild(item);

                if (isMe) {
                    const myNameEl = item.querySelector('#leaderboard-my-name');
                    myNameEl.addEventListener('click', () => {
                        this.openNameEditor(myNameEl);
                    });
                }
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
                window.gameInstance.comboCount = 0;
                window.gameInstance.currentTheme = 0;
                window.gameInstance.lastClearTheme = null;
                window.gameInstance.activeShapes = [null, null, null];
                
                window.gameInstance.switchToTheme(0);
                window.gameInstance.generateShapes();
                window.gameInstance.updateUI();
            });
        }
    }

    openNameEditor(elementToUpdate = null) {
        this.elementToUpdateWithNewName = elementToUpdate;
        const current = localStorage.getItem('boss_block_username') || '';
        const input = document.getElementById('new-name-input');
        if (input) input.value = current;
        this.showModal('name');
    }

    async handleSaveName() {
        const input = document.getElementById('new-name-input');
        if (!input) return;
        const newName = input.value;
        if (newName && newName.trim().length > 0) {
            const cleanName = newName.trim().substring(0, 15);
            localStorage.setItem('boss_block_username', cleanName);
            
            if (this.elementToUpdateWithNewName) {
                this.elementToUpdateWithNewName.innerHTML = `${cleanName} <span style="opacity:0.6;font-size:0.8em;margin-left:4px;">✎</span>`;
            }
            const homeName = document.getElementById('home-player-name');
            if (homeName) homeName.textContent = cleanName;
            
            if (window.isFirebaseReady() && window.auth && window.auth.currentUser) {
                try {
                    await window.db.collection('leaderboard').doc(window.auth.currentUser.uid).set({
                        name: cleanName,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                } catch(err) {
                    console.error('Failed to update name online:', err);
                }
            }
            this.hideAllModals();
        }
    }
}

// Start UI Manager
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
});

export default UIManager;
