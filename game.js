/**
 * Boss Block Puzzle - Core Game Engine
 * Features: 8x8 Grid, Shape Generation, Line Clearing, Scoring, Animations
 */

const GRID_SIZE = 8;
const BLOCK_GAP = 0;   // No gap — grid is one solid box split by lines
const CELL_PAD = 2;    // Inner padding per cell so blocks don't touch lines
const COMBO_POINTS = 100;

// Progressive difficulty shapes
const MEDIUM_SHAPES = [
    { name: 'T', matrix: [[0, 1, 0], [1, 1, 1]], colorId: 1 },
    { name: 'Z', matrix: [[1, 1, 0], [0, 1, 1]], colorId: 2 },
    { name: 'L', matrix: [[1, 0], [1, 0], [1, 1]], colorId: 5 }
];

// Harder shapes for higher difficulty
const ELITE_SHAPES = [
    { name: 'cross', matrix: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], colorId: 1 },
    { name: 'bigL', matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], colorId: 4 },
    { name: 'plus', matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], colorId: 3 } // 3x3 square is actually very hard
];

/* Color Palette for Blocks — Theme-aware colors */
const BLOCK_COLORS = {
    // Night theme colors (aurora-inspired)
    night: {
        1: '#1dc99a',   // Aurora Green
        2: '#9b59f5',   // Aurora Purple
        3: '#4ecdc4',   // Turquoise
        4: '#f9ca24',   // Moon Yellow
        5: '#6c5ce7',   // Deep Purple
        6: '#74b9ff'    // Sky Blue
    },
    // Day theme colors (cherry blossom/spring-inspired)
    day: {
        1: '#ff6b9d',   // Cherry Pink
        2: '#f9ca24',   // Sunshine Yellow
        3: '#ff8fab',   // Light Pink
        4: '#ffd93d',   // Golden Yellow
        5: '#ff7675',   // Rose Red
        6: '#fdcb6e'    // Warm Orange
    },
    // Ocean theme colors (underwater/coral-inspired)
    ocean: {
        1: '#1a8aaa',   // Ocean Blue
        2: '#ff6b9d',   // Coral Pink
        3: '#4ecdc4',   // Sea Turquoise
        4: '#ffd93d',   // Sand Yellow
        5: '#74b9ff',   // Deep Ocean Blue
        6: '#48bb78'    // Sea Green
    },
    // Desert theme colors (sunset/canyon-inspired)
    desert: {
        1: '#ff9020',   // Sunset Orange
        2: '#e05818',   // Desert Red
        3: '#ffd93d',   // Dune Yellow
        4: '#ff7675',   // Cactus Red
        5: '#e8d5b2',   // Canyon Purple
        6: '#f8f4e1'    // Sand Beige
    },
    // Space theme colors (cosmic/nebula-inspired)
    space: {
        1: '#6020c0',   // Nebula Purple
        2: '#1060c0',   // Cosmic Blue
        3: '#c03080',   // Pink Nebula
        4: '#20a080',   // Green Nebula
        5: '#8040d0',   // Deep Purple
        6: '#2060b0'    // Deep Blue
    },
    // Village theme colors (evening/city-inspired)
    village: {
        1: '#f0c040',   // Streetlight Gold
        2: '#304055',   // Building Dark
        3: '#485870',   // Window Light Blue
        4: '#f8d060',   // Warm Lamp
        5: '#d8e8f8',   // Evening Sky Blue
        6: '#a8cce8'    // Rain Blue
    },
    // Forest theme colors (nature/mystical-inspired)
    forest: {
        1: '#5a8040',   // Forest Green
        2: '#a0b890',   // Moss Green
        3: '#688050',   // Leaf Green
        4: '#b0c8a0',   // Light Moss
        5: '#2e4020',   // Dark Forest
        6: '#4a6030'    // Earth Brown
    },
    // Sunset theme colors (tropical/beach-inspired)
    sunset: {
        1: '#f0a030',   // Sunset Orange
        2: '#8828a0',   // Tropical Purple
        3: '#ffd060',   // Beach Gold
        4: '#c03850',   // Coral Red
        5: '#fff4a0',   // Sun Yellow
        6: '#d8a840'    // Palm Brown
    },
    // Cloudy theme colors (bright/sky-inspired)
    cloudy: {
        1: '#4090e8',   // Sky Blue
        2: '#f0c000',   // Sun Gold
        3: '#70b8f8',   // Light Sky Blue
        4: '#fffce0',   // Cloud White
        5: '#f0f8ff',   // Bright White
        6: '#d0eeff'    // Soft Sky Blue
    },
    // Crystal theme colors (glowing/cave-inspired)
    crystal: {
        1: '#2080f0',   // Crystal Blue
        2: '#a020e0',   // Crystal Purple
        3: '#4090e0',   // Light Crystal Blue
        4: '#c040f0',   // Bright Crystal Purple
        5: '#e8f4ff',   // Crystal White
        6: '#80a0e0'    // Soft Crystal Blue
    },
    // Aurora theme colors (northern lights/snow-inspired)
    aurora: {
        1: '#00e878',   // Aurora Green
        2: '#8840ff',   // Aurora Purple
        3: '#00ff88',   // Bright Aurora Green
        4: '#7030ee',   // Light Aurora Purple
        5: '#c8e0f0',   // Snow White
        6: '#90b8d8'    // Ice Blue
    }
};

// Helper function to get current theme colors
function getBlockColors() {
    if (document.body.classList.contains('day-theme')) {
        return BLOCK_COLORS.day;
    } else if (document.body.classList.contains('ocean-theme')) {
        return BLOCK_COLORS.ocean;
    } else if (document.body.classList.contains('desert-theme')) {
        return BLOCK_COLORS.desert;
    } else if (document.body.classList.contains('space-theme')) {
        return BLOCK_COLORS.space;
    } else if (document.body.classList.contains('village-theme')) {
        return BLOCK_COLORS.village;
    } else if (document.body.classList.contains('forest-theme')) {
        return BLOCK_COLORS.forest;
    } else if (document.body.classList.contains('sunset-theme')) {
        return BLOCK_COLORS.sunset;
    } else if (document.body.classList.contains('cloudy-theme')) {
        return BLOCK_COLORS.cloudy;
    } else if (document.body.classList.contains('crystal-theme')) {
        return BLOCK_COLORS.crystal;
    } else if (document.body.classList.contains('aurora-theme')) {
        return BLOCK_COLORS.aurora;
    } else {
        return BLOCK_COLORS.night;
    }
}

// Shape Templates (Matrix representation) - Easy shapes only
const SHAPES = [
    { name: 'dot', matrix: [[1]], colorId: 1 },
    { name: 'line2', matrix: [[1, 1]], colorId: 2 },
    { name: 'line3', matrix: [[1, 1, 1]], colorId: 3 },
    { name: 'square2', matrix: [[1, 1], [1, 1]], colorId: 4 },
    { name: 'I', matrix: [[1], [1], [1], [1]], colorId: 6 }
];

class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.bgmInterval = null;
        this.isMuted = false;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) {
            // Ensure context is running if already initialized
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            return;
        }
        
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        this.ctx = new AudioContext();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.8; // Increased master volume
        this.masterGain.connect(this.ctx.destination);
        
        this.isInitialized = true;
        this.startBGM();
    }
    
    startBGM() {
        if (!this.ctx) return;
        
        // A relaxing pentatonic scale (C Major)
        const C3 = 130.81, G3 = 196.00;
        const C4 = 261.63, D4 = 293.66, E4 = 329.63, G4 = 392.00, A4 = 440.00;
        const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99;
        
        // A gentle 32-step musical sequence (0 = rest/pause)
        const melody = [
            E4,  0, G4, A4, C5,  0, D5, E5,
            G5,  0, E5, D5, C5,  0, A4,  0,
            C4, D4, E4,  0, G4,  0, A4, C5,
            D5, C5, A4, G4, E4,  0, D4, C4
        ];
        
        let step = 0;
        
        this.bgmInterval = setInterval(() => {
            if (this.isMuted || !this.ctx) return;
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            
            // 1. Play the main melody note
            const freq = melody[step];
            if (freq !== 0) {
                // Higher volume for the main melody
                this.playPluck(freq, 0.15, 2.0);
            }
            
            // 2. Play a soft bass drone note every 16 steps to anchor the song
            if (step % 16 === 0) {
                const bassFreq = (step === 0) ? C3 : G3;
                this.playPluck(bassFreq, 0.1, 4.0);
            }
            
            step = (step + 1) % melody.length;
        }, 320); // 320ms per step = nice, calming pace
    }
    
    stopBGM() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }
    
    playPluck(freq, volume, duration) {
        if (this.isMuted || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        // Sine gives a pure, gentle music-box / harp sound
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        // Pluck envelope: quick fade-in, long smooth fade-out
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        
        // Soften the high frequencies so it doesn't pierce
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200; 
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    playReactionSound(reactionIndex) {
        if (this.isMuted || !this.ctx) return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        
        // C Major Pentatonic higher octaves (uplifting chimes)
        const baseNotes = [392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
        const noteCount = Math.min(3 + reactionIndex, 8);
        const startIdx = Math.min(reactionIndex, 3);
        
        const now = this.ctx.currentTime;
        
        for (let i = 0; i < noteCount; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            // "sine" waves in high registers sound like soft bells/chimes
            osc.type = 'sine'; 
            let noteIdx = startIdx + i;
            if(noteIdx >= baseNotes.length) noteIdx = baseNotes.length - 1;
            
            osc.frequency.setValueAtTime(baseNotes[noteIdx], now + (i * 0.08));
            
            gain.gain.setValueAtTime(0, now + (i * 0.08));
            gain.gain.linearRampToValueAtTime(0.25, now + (i * 0.08) + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.08) + 1.2);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(now + (i * 0.08));
            osc.stop(now + (i * 0.08) + 1.2);
        }
    }

    playGameOverSound() {
        if (this.isMuted || !this.ctx) return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        
        const now = this.ctx.currentTime;
        // Descending sad notes
        const notes = [440.00, 392.00, 349.23, 329.63, 261.63]; 
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle'; // Slightly harsher than sine for game over
            osc.frequency.setValueAtTime(freq, now + (i * 0.15));
            
            gain.gain.setValueAtTime(0, now + (i * 0.15));
            gain.gain.linearRampToValueAtTime(0.2, now + (i * 0.15) + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.15) + 0.6);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(now + (i * 0.15));
            osc.stop(now + (i * 0.15) + 0.6);
        });
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreDisplay = document.getElementById('score');
        this.worldRecordDisplay = document.getElementById('world-record');
        this.userBestDisplay = document.getElementById('user-best');
        this.worldScoreDisplay = document.getElementById('home-world-record'); // Point to home screen Record
        this.finalScoreDisplay = document.getElementById('final-score');
        this.reactionContainer = document.getElementById('reaction-container');
        this.comboBadge = document.getElementById('combo-badge');
        
        this.grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
        this.score = 0;
        this.userHighScore = parseInt(localStorage.getItem('boss_block_highscore')) || 0;
        this.worldHighRun = parseInt(localStorage.getItem('boss_block_worldrecord')) || this.userHighScore;
        this.comboCount = 0;
        this.activeShapes = [null, null, null];
        this.draggingShape = null;
        this.draggingFromSlot = -1;
        this.isGameOver = false;
        this.reviveUsed = false; // Legacy — still used for some checks but not for limiting
        this.lifetimeFreeRefreshes = parseInt(localStorage.getItem('boss_block_lifetime_free_refreshes')) ?? 3;
        if (isNaN(this.lifetimeFreeRefreshes)) this.lifetimeFreeRefreshes = 3;
        
        this.lifetimeFreeRevives = parseInt(localStorage.getItem('boss_block_lifetime_free_revives')) ?? 3;
        if (isNaN(this.lifetimeFreeRevives)) this.lifetimeFreeRevives = 3;

        this.currentGameRefreshes = 0; 
        this.currentGameRevives = 0; 
        this.currentTheme = 0; // 0=night, 1=day, 2=ocean, 3=desert, 4=space, 5=village, 6=forest, 7=sunset, 8=cloudy, 9=crystal, 10=aurora
        this.lastClearTheme = null; // Prevent multiple theme switches on same clear

        this.audioManager = new AudioManager();

        this.init();
    }

    init() {
        this.setupCanvas();
        this.loadState(); // Auto-load previous game
        this.generateShapes();
        this.addEventListeners();
        this.loadLocalHighScore();
        this.updateRefreshButtonUI();
        this.animate();
        console.log("🎮 Game initialized.");
    }

    setupCanvas(onReady) {
        // Measure the #game-container (reliable parent) rather than the
        // board-container which has no explicit CSS dimensions yet.
        const gameContainer = document.getElementById('game-container');
        const gcRect = gameContainer.getBoundingClientRect();

        // If the layout hasn't happened yet, retry on the next frame
        if (gcRect.width === 0 || gcRect.height === 0) {
            requestAnimationFrame(() => this.setupCanvas(onReady));
            return;
        }

        const BORDER = 4; // board-container has 2px border on each side (box-sizing: border-box)

        // Canvas size: 85% of container width, capped by container height.
        // Subtract BORDER so the canvas fits perfectly inside the border.
        const padding = 8;
        const rawSize = Math.min(gcRect.width * 0.85, gcRect.height - padding) - BORDER;
        const size = Math.floor(rawSize);

        // Board-container = canvas size + border, so inner content = canvas size exactly
        const boardContainer = this.canvas.parentElement;
        boardContainer.style.width  = `${size + BORDER}px`;
        boardContainer.style.height = `${size + BORDER}px`;

        // Size the canvas to exactly fill the board-container's inner content area
        const pxRatio = window.devicePixelRatio || 1;
        this.canvas.width  = size * pxRatio;
        this.canvas.height = size * pxRatio;
        this.canvas.style.width  = `${size}px`;
        this.canvas.style.height = `${size}px`;
        this.ctx.scale(pxRatio, pxRatio);

        // Store for drawGrid and hit-testing
        this.boardSize = size;
        this.blockSize = size / GRID_SIZE;

        if (typeof onReady === 'function') onReady();
    }

    getDifficultyTier() {
        const score = this.score;
        
        if (score < 2500) {
            // Tier 1: Easy only - great for beginners and clearing grid
            return {
                easyChance: 1.0,
                mediumChance: 0.0,
                eliteChance: 0.0
            };
        } else if (score < 5000) {
            // Tier 2: Mostly easy, small chance of medium
            return {
                easyChance: 0.85,
                mediumChance: 0.15,
                eliteChance: 0.0
            };
        } else if (score < 7500) {
            // Tier 3: Easy with medium chance
            return {
                easyChance: 0.7,
                mediumChance: 0.3,
                eliteChance: 0.0
            };
        } else if (score < 10000) {
            // Tier 4: More medium, small elite chance
            return {
                easyChance: 0.5,
                mediumChance: 0.4,
                eliteChance: 0.1
            };
        } else if (score < 15000) {
            // Tier 5: Balanced medium and easy, some elite
            return {
                easyChance: 0.4,
                mediumChance: 0.4,
                eliteChance: 0.2
            };
        } else if (score < 20000) {
            // Tier 6: More challenging
            return {
                easyChance: 0.3,
                mediumChance: 0.4,
                eliteChance: 0.3
            };
        } else {
            // Tier 7: Max difficulty - but still manageable
            return {
                easyChance: 0.2,
                mediumChance: 0.4,
                eliteChance: 0.4
            };
        }
    }

    generateShapes() {
        let hasRemaining = this.activeShapes.some(s => s !== null);
        if (!hasRemaining) {
            const tier = this.getDifficultyTier();
            
            // Debug: Log current difficulty tier
            console.log(`🎮 Difficulty Tier (Score: ${this.score}): Easy=${tier.easyChance.toFixed(2)}, Medium=${tier.mediumChance.toFixed(2)}, Elite=${tier.eliteChance.toFixed(2)}`);
            
            for (let i = 0; i < 3; i++) {
                const rand = Math.random();
                let selectedShape;
                
                if (rand < tier.easyChance) {
                    // Easy shape
                    selectedShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
                } else if (rand < tier.easyChance + tier.mediumChance) {
                    // Medium shape
                    selectedShape = MEDIUM_SHAPES[Math.floor(Math.random() * MEDIUM_SHAPES.length)];
                } else {
                    // Elite shape
                    selectedShape = ELITE_SHAPES[Math.floor(Math.random() * ELITE_SHAPES.length)];
                }
                
                this.activeShapes[i] = JSON.parse(JSON.stringify(selectedShape));
                this.renderShapeSlot(i);
            }
            this.saveState();
        }
    }

    renderShapeSlot(index) {
        const slot = document.getElementById(`slot-${index}`);
        slot.innerHTML = '';
        if (!this.activeShapes[index]) return;

        const shape = this.activeShapes[index];
        const previewCanvas = document.createElement('canvas');
        const pCtx = previewCanvas.getContext('2d');
        const pSize = 100;
        const pBlockSize = pSize / 4;
        
        previewCanvas.width = pSize;
        previewCanvas.height = pSize;
        previewCanvas.classList.add('shape-preview');
        
        // Center the shape in the preview
        const offsetX = (pSize - (shape.matrix[0].length * pBlockSize)) / 2;
        const offsetY = (pSize - (shape.matrix.length * pBlockSize)) / 2;

        shape.matrix.forEach((row, rIdx) => {
            row.forEach((cell, cIdx) => {
                if (cell) {
                    this.drawRoundedRect(pCtx, 
                        offsetX + cIdx * pBlockSize, 
                        offsetY + rIdx * pBlockSize, 
                        pBlockSize - 2, 
                        pBlockSize - 2, 
                        4, 
                        getBlockColors()[shape.colorId]);
                }
            });
        });

        slot.appendChild(previewCanvas);
    }

    drawRoundedRect(ctx, x, y, width, height, radius, color) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    drawGrid() {
        const size = this.boardSize;
        if (!size) return; // Not yet measured — skip until setupCanvas completes
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // --- 1. Solid board background (sharp corners — no radius) ---
        const style = getComputedStyle(document.body);
        this.ctx.fillStyle = style.getPropertyValue('--board-bg').trim() || 'rgba(4,13,24,0.95)';
        this.ctx.fillRect(0, 0, size, size);

        // --- 2. Grid dividing lines ---
        const lineColor = style.getPropertyValue('--board-line').trim() || 'rgba(29,201,154,0.25)';
        this.ctx.strokeStyle = lineColor;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.6;

        for (let i = 1; i < GRID_SIZE; i++) {
            const pos = i * this.blockSize;
            // Vertical line
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, size);
            this.ctx.stroke();
            // Horizontal line
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(size, pos);
            this.ctx.stroke();
        }
        this.ctx.globalAlpha = 1.0;

        // --- 3. Draw filled blocks ---
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (this.grid[r][c] !== 0) {
                    const colors = getBlockColors();
                    const color = colors[this.grid[r][c]];
                    const x = c * this.blockSize + CELL_PAD;
                    const y = r * this.blockSize + CELL_PAD;
                    const w = this.blockSize - CELL_PAD * 2;
                    // Glow
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = color;
                    this.drawRoundedRect(this.ctx, x, y, w, w, 6, color);
                    this.ctx.shadowBlur = 0;
                }
            }
        }
    }

    animate() {
        this.drawGrid();
        if (this.draggingShape) {
            this.drawGhostPreview();
            this.drawDraggingShape();
        }
        requestAnimationFrame(() => this.animate());
    }

    drawGhostPreview() {
        const { x, y, shape } = this.draggingShape;
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.boardSize / rect.width;
        const scaleY = this.boardSize / rect.height;

        const gridX = Math.floor((x - rect.left) * scaleX / this.blockSize - shape.matrix[0].length / 2 + 0.5);
        const gridY = Math.floor((y - rect.top - 50) * scaleY / this.blockSize - shape.matrix.length / 2 + 0.5);

        if (this.canPlace(shape, gridX, gridY)) {
            this.ctx.globalAlpha = 0.35;
            shape.matrix.forEach((row, r) => {
                row.forEach((cell, c) => {
                    if (cell) {
                        const drawX = (gridX + c) * this.blockSize + CELL_PAD;
                        const drawY = (gridY + r) * this.blockSize + CELL_PAD;
                        const w = this.blockSize - CELL_PAD * 2;
                        this.drawRoundedRect(this.ctx, drawX, drawY, w, w, 6, getBlockColors()[shape.colorId]);
                    }
                });
            });
            this.ctx.globalAlpha = 1.0;
        }
    }

    drawDraggingShape() {
        const { x, y, shape } = this.draggingShape;
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.boardSize / rect.width;
        const scaleY = this.boardSize / rect.height;
        const bs = this.blockSize;
        const w = bs - CELL_PAD * 2;

        // Draw actual dragging shape following the pointer, lifted above finger
        shape.matrix.forEach((row, rIdx) => {
            row.forEach((cell, cIdx) => {
                if (cell) {
                    const drawX = (x - rect.left) * scaleX + (cIdx - shape.matrix[0].length / 2) * bs + CELL_PAD;
                    const drawY = (y - rect.top) * scaleY + (rIdx - shape.matrix.length / 2) * bs - 50 * scaleY + CELL_PAD;
                    this.drawRoundedRect(this.ctx, drawX, drawY, w, w, 6, getBlockColors()[shape.colorId]);
                }
            });
        });
    }

    addEventListeners() {
        const containers = [0, 1, 2].map(i => document.getElementById(`slot-${i}`));
        
        containers.forEach((slot, i) => {
            slot.addEventListener('mousedown', (e) => this.startDragging(e, i));
            slot.addEventListener('touchstart', (e) => this.startDragging(e, i), { passive: false });
        });

        window.addEventListener('mousemove', (e) => this.drag(e));
        window.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
        
        window.addEventListener('mouseup', (e) => this.stopDragging(e));
        window.addEventListener('touchend', (e) => this.stopDragging(e));
        
        window.addEventListener('resize', () => this.setupCanvas());

        // Monetization Listeners
        const reviveBtn = document.getElementById('revive-btn');
        if (reviveBtn) {
            reviveBtn.addEventListener('click', () => this.handleReviveClick());
        }

        const refreshBtn = document.getElementById('refresh-shapes-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.handleRefreshClick());
        }
    }

    startDragging(e, slotIndex) {
        this.audioManager.init(); // Initialize audio on first user interaction
        
        if (!this.activeShapes[slotIndex]) return;
        if (e.type === 'touchstart') e.preventDefault();
        
        this.draggingFromSlot = slotIndex;
        const pointer = e.type === 'touchstart' ? e.touches[0] : e;
        this.draggingShape = {
            x: pointer.clientX,
            y: pointer.clientY,
            shape: this.activeShapes[slotIndex]
        };
    }

    drag(e) {
        if (!this.draggingShape) return;
        if (e.type === 'touchmove') e.preventDefault();
        
        const pointer = e.type === 'touchmove' ? e.touches[0] : e;
        this.draggingShape.x = pointer.clientX;
        this.draggingShape.y = pointer.clientY;
    }

    stopDragging(e) {
        if (!this.draggingShape) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const pointer = e.type === 'touchend' ? e.changedTouches[0] : e;
        const scaleX = this.boardSize / rect.width;
        const scaleY = this.boardSize / rect.height;

        // Calculate placement position (snap to grid)
        const gridX = Math.floor((pointer.clientX - rect.left) * scaleX / this.blockSize - this.draggingShape.shape.matrix[0].length / 2 + 0.5);
        const gridY = Math.floor((pointer.clientY - rect.top - 50) * scaleY / this.blockSize - this.draggingShape.shape.matrix.length / 2 + 0.5);

        if (this.canPlace(this.draggingShape.shape, gridX, gridY)) {
            this.placeShape(this.draggingShape.shape, gridX, gridY);
            this.activeShapes[this.draggingFromSlot] = null;
            this.renderShapeSlot(this.draggingFromSlot);
            this.checkLines();
            this.generateShapes();
            this.checkGameOver();
        }

        this.draggingShape = null;
        this.draggingFromSlot = -1;
    }

    canPlace(shape, startX, startY) {
        if (startX < 0 || startY < 0) return false;
        
        for (let r = 0; r < shape.matrix.length; r++) {
            for (let c = 0; c < shape.matrix[r].length; c++) {
                if (shape.matrix[r][c]) {
                    const gridR = startY + r;
                    const gridC = startX + c;
                    
                    if (gridR >= GRID_SIZE || gridC >= GRID_SIZE || this.grid[gridR][gridC] !== 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    placeShape(shape, startX, startY) {
        shape.matrix.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell) {
                    this.grid[startY + r][startX + c] = shape.colorId;
                }
            });
        });
        this.score += shape.matrix.flat().filter(x => x).length * 10;
        this.updateUI();
    }

    checkLines() {
        let rowsToClear = [];
        let colsToClear = [];

        // Check rows
        for (let r = 0; r < GRID_SIZE; r++) {
            if (this.grid[r].every(cell => cell !== 0)) rowsToClear.push(r);
        }

        // Check columns
        for (let c = 0; c < GRID_SIZE; c++) {
            let full = true;
            for (let r = 0; r < GRID_SIZE; r++) {
                if (this.grid[r][c] === 0) {
                    full = false;
                    break;
                }
            }
            if (full) colsToClear.push(c);
        }

        // Apply clearing
        rowsToClear.forEach(r => this.grid[r].fill(0));
        colsToClear.forEach(c => {
            for (let r = 0; r < GRID_SIZE; r++) {
                this.grid[r][c] = 0;
            }
        });

        const totalCleared = rowsToClear.length + colsToClear.length;
        if (totalCleared > 0) {
            this.comboCount++;
            const points = totalCleared * 100 * totalCleared * (this.comboCount);
            this.score += points;
            this.triggerReaction(totalCleared);
            this.screenShake();
            this.updateUI();
        } else {
            this.comboCount = 0;
            if (this.comboBadge) this.comboBadge.classList.add('hidden');
        }
        
        // Check if grid is completely empty after clearing lines
        this.checkEmptyGrid();
    }

    checkEmptyGrid() {
        const isEmpty = this.grid.every(row => row.every(cell => cell === 0));
        console.log(`🔍 Checking grid: isEmpty=${isEmpty}, currentTheme=${this.currentTheme}`);
        
        // Only switch theme when grid becomes empty (clearing)
        // Don't switch back when blocks are placed
        if (isEmpty) {
            console.log(`🎯 Grid cleared! Cycling to next theme...`);
            
            // Only switch if we haven't already switched for this clear
            const newTheme = (this.currentTheme + 1) % 11;
            if (this.lastClearTheme !== newTheme) {
                this.lastClearTheme = newTheme;
                this.switchToTheme(newTheme);
            } else {
                console.log(`⏭️ Already switched to theme ${newTheme} for this clear, skipping...`);
            }
        } else {
            // Reset clear tracker when grid is no longer empty
            this.lastClearTheme = null;
        }
    }

    switchToTheme(themeIndex) {
        // Remove all theme classes first
        document.body.classList.remove('day-theme', 'ocean-theme', 'desert-theme', 'space-theme', 'village-theme', 'forest-theme', 'sunset-theme', 'cloudy-theme', 'crystal-theme', 'aurora-theme');
        
        this.currentTheme = themeIndex;
        
        switch(themeIndex) {
            case 0: // Night theme
                console.log(`🌙 Switching to night theme`);
                break;
            case 1: // Day theme
                document.body.classList.add('day-theme');
                console.log(`🌞 Switching to day theme`);
                this.showThemeChangeMessage("☀️ Beautiful Day!");
                break;
            case 2: // Ocean theme
                document.body.classList.add('ocean-theme');
                console.log(`🌊 Switching to ocean theme`);
                this.showThemeChangeMessage("🌊 Deep Ocean!");
                break;
            case 3: // Desert theme
                document.body.classList.add('desert-theme');
                console.log(`🏜️ Switching to desert theme`);
                this.showThemeChangeMessage("🏜️ Desert Sunset!");
                break;
            case 4: // Space theme
                document.body.classList.add('space-theme');
                console.log(`🌌 Switching to space theme`);
                this.showThemeChangeMessage("🌌 Cosmic Nebula!");
                break;
            case 5: // Village theme
                document.body.classList.add('village-theme');
                console.log(`🏘️ Switching to village theme`);
                this.showThemeChangeMessage("🏘️ Evening Village!");
                break;
            case 6: // Forest theme
                document.body.classList.add('forest-theme');
                console.log(`🌲 Switching to forest theme`);
                this.showThemeChangeMessage("🌲 Mystical Forest!");
                break;
            case 7: // Sunset theme
                document.body.classList.add('sunset-theme');
                console.log(`🌅 Switching to sunset theme`);
                this.showThemeChangeMessage("🌅 Tropical Sunset!");
                break;
            case 8: // Cloudy theme
                document.body.classList.add('cloudy-theme');
                console.log(`☁️ Switching to cloudy theme`);
                this.showThemeChangeMessage("☁️ Bright Skies!");
                break;
            case 9: // Crystal theme
                document.body.classList.add('crystal-theme');
                console.log(`💎 Switching to crystal theme`);
                this.showThemeChangeMessage("💎 Crystal Caves!");
                break;
            case 10: // Aurora theme
                document.body.classList.add('aurora-theme');
                console.log(`🌌 Switching to aurora theme`);
                this.showThemeChangeMessage("🌌 Northern Lights!");
                break;
        }
        
        // Redraw all elements with new colors
        this.redrawAllElements();
    }

    redrawAllElements() {
        // Redraw grid with new colors
        this.drawGrid();
        
        // Redraw shape previews with new colors
        this.activeShapes.forEach((shape, i) => {
            if (shape) this.renderShapeSlot(i);
        });
    }

    showThemeChangeMessage(message) {
        const span = document.createElement('div');
        span.className = 'floating-text theme-change';
        span.textContent = message;
        span.style.left = '50%';
        span.style.top = '50%';
        span.style.transform = 'translate(-50%, -50%)';
        span.style.fontSize = '1.5rem';
        span.style.fontWeight = '900';
        span.style.color = 'var(--primary)';
        span.style.textShadow = '0 2px 16px rgba(0,0,0,0.3)';
        span.style.zIndex = '100';
        
        this.reactionContainer.appendChild(span);
        setTimeout(() => span.remove(), 2000);
    }

    triggerReaction(count) {
        const words = ["NICE!", "GREAT!", "AMAZING!", "BOSSED IT!", "UNREAL! 🔥", "LEGENDARY!"];
        const reactionIndex = Math.min(count - 1 + this.comboCount, words.length - 1);
        const word = words[reactionIndex];
        
        this.audioManager.playReactionSound(reactionIndex); // Play beautiful reaction chimes!
        
        const span = document.createElement('div');
        span.className = 'floating-text';
        span.textContent = word;
        span.style.left = `${Math.random() * 60 + 20}%`;
        span.style.top = `${Math.random() * 40 + 30}%`;
        
        this.reactionContainer.appendChild(span);
        setTimeout(() => span.remove(), 800);

        if (this.comboCount > 1) {
            this.comboBadge.textContent = `COMBO x${this.comboCount}`;
            this.comboBadge.classList.remove('hidden');
        }
    }

    screenShake() {
        this.canvas.classList.remove('shake');
        void this.canvas.offsetWidth; // Trigger reflow
        this.canvas.classList.add('shake');
    }

    checkGameOver() {
        const canMove = this.activeShapes.some(shape => {
            if (!shape) return false;
            // Check every possible grid location
            for (let r = 0; r <= GRID_SIZE - shape.matrix.length; r++) {
                for (let c = 0; c <= GRID_SIZE - shape.matrix[0].length; c++) {
                    if (this.canPlace(shape, c, r)) return true;
                }
            }
            return false;
        });

        if (!canMove && this.activeShapes.some(s => s !== null)) {
            this.isGameOver = true;
            this.audioManager.stopBGM();
            this.audioManager.playGameOverSound();
            localStorage.setItem('boss_block_last_score', this.score);
            document.getElementById('overlay').classList.remove('hidden');
            
            const goModal = document.getElementById('game-over-modal');
            goModal.classList.remove('hidden');
            
            // Show Revive button if not used this session (max 3 times per game)
            const reviveBtn = document.getElementById('revive-btn');
            if (reviveBtn) {
                if (this.currentGameRevives < 3) {
                    reviveBtn.classList.remove('hidden');
                    this.updateReviveButtonUI();
                } else {
                    reviveBtn.classList.add('hidden');
                }
            }

            this.finalScoreDisplay.textContent = this.score;
            this.handleHighScores();
            this.saveState(); // Crucial: Save the isGameOver: true state!
        }
    }

    updateUI() {
        if (this.scoreDisplay) this.scoreDisplay.textContent = this.score.toString().padStart(6, '0');
        if (this.worldRecordDisplay) this.worldRecordDisplay.textContent = this.worldHighRun.toString().padStart(6, '0');
        if (this.userBestDisplay) this.userBestDisplay.textContent = this.userHighScore.toString().padStart(6, '0');
        if (this.worldScoreDisplay && this.score > this.worldHighRun) {
            this.worldScoreDisplay.textContent = this.score.toString().padStart(6, '0');
        }
        this.saveState();
    }

    saveState() {
        const state = {
            grid: this.grid,
            score: this.score,
            activeShapes: this.activeShapes,
            currentTheme: this.currentTheme,
            lastClearTheme: this.lastClearTheme,
            isGameOver: this.isGameOver,
            currentGameRefreshes: this.currentGameRefreshes,
            currentGameRevives: this.currentGameRevives
        };
        localStorage.setItem('boss_block_game_state', JSON.stringify(state));
        localStorage.setItem('boss_block_lifetime_free_refreshes', this.lifetimeFreeRefreshes);
        localStorage.setItem('boss_block_lifetime_free_revives', this.lifetimeFreeRevives);
    }

    loadState() {
        try {
            const saved = localStorage.getItem('boss_block_game_state');
            if (saved) {
                const state = JSON.parse(saved);
                this.grid = state.grid || Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
                this.score = state.score || 0;
                this.activeShapes = state.activeShapes || [null, null, null];
                this.currentTheme = state.currentTheme || 0;
                this.lastClearTheme = state.lastClearTheme || null;
                this.isGameOver = state.isGameOver || false;
                this.currentGameRefreshes = state.currentGameRefreshes || 0;
                this.currentGameRevives = state.currentGameRevives || 0;
                
                // Lifetime counts
                this.lifetimeFreeRefreshes = parseInt(localStorage.getItem('boss_block_lifetime_free_refreshes')) ?? 3;
                if (isNaN(this.lifetimeFreeRefreshes)) this.lifetimeFreeRefreshes = 3;

                this.lifetimeFreeRevives = parseInt(localStorage.getItem('boss_block_lifetime_free_revives')) ?? 3;
                if (isNaN(this.lifetimeFreeRevives)) this.lifetimeFreeRevives = 3;
                
                // If game was over, show the modal again
                if (this.isGameOver) {
                    document.getElementById('overlay').classList.remove('hidden');
                    const goModal = document.getElementById('game-over-modal');
                    goModal.classList.remove('hidden');
                    
                    const reviveBtn = document.getElementById('revive-btn');
                    if (reviveBtn) {
                        if (this.currentGameRevives < 3) {
                            reviveBtn.classList.remove('hidden');
                            this.updateReviveButtonUI();
                        } else {
                            reviveBtn.classList.add('hidden');
                        }
                    }
                    this.finalScoreDisplay.textContent = this.score;
                }
                
                // Apply correct theme on load
                this.switchToTheme(this.currentTheme);
                this.updateUI();
                
                // Re-render shapes in slots
                this.activeShapes.forEach((shape, i) => {
                    if (shape) this.renderShapeSlot(i);
                });
            }
        } catch (err) {
            console.error("Failed to load game state:", err);
            // Fallback to fresh state if anything goes wrong
            this.grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
            this.score = 0;
            this.activeShapes = [null, null, null];
            this.isGameOver = false;
        }
    }

    loadLocalHighScore() {
        const local = localStorage.getItem('boss_block_highscore') || 0;
        this.userHighScore = parseInt(local) || 0;
        
        const world = localStorage.getItem('boss_block_worldrecord') || this.userHighScore;
        this.worldHighRun = parseInt(world) || 0;
        
        if (this.worldScoreDisplay) {
            this.worldScoreDisplay.textContent = this.worldHighRun.toString().padStart(6, '0');
        }
        if (this.userBestDisplay) {
            this.userBestDisplay.textContent = this.userHighScore.toString().padStart(6, '0');
        }
    }

    async handleHighScores() {
        // Update user's best score if current score is higher
        if (this.score > this.userHighScore) {
            this.userHighScore = this.score;
            localStorage.setItem('boss_block_highscore', this.score);

            // Sync high score to Firebase Cloud if user is signed in
            if (window.isFirebaseReady && window.isFirebaseReady() && window.auth && window.auth.currentUser) {
                try {
                    const user = window.auth.currentUser;
                    const db = window.db;
                    const docRef = db.collection('leaderboard').doc(user.uid);
                    
                    const docSnap = await docRef.get();
                    if (!docSnap.exists || docSnap.data().score < this.score) {
                        const finalName = localStorage.getItem('boss_block_username') || user.displayName || user.email || 'Anonymous Player';
                        await docRef.set({
                            name: finalName,
                            score: this.score,
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        }, { merge: true });
                        console.log("🔥 High score successfully saved to Firebase!");
                    }
                } catch (err) {
                    console.error("Failed to save high score to Firebase:", err);
                }
            }
        }
        
        // Update world high run locally (fall-back sync)
        if (this.score > this.worldHighRun) {
            this.lifetimeFreeRefreshes += 5;
            this.lifetimeFreeRevives += 5;
            console.log("🏆 WORLD RECORD BROKEN! Rewarding player with 5 Refreshes and 5 Revives.");
            this.showThemeChangeMessage("🏆 WORLD RECORD BROKEN! BONUS: +5 REFRESHES & REVIVES!");
            
            this.worldHighRun = this.score;
            localStorage.setItem('boss_block_worldrecord', this.score);
            this.saveState(); // Ensure rewards are saved immediately
        }
    }
    // --- Monetization Methods ---

    async handleReviveClick() {
        const reviveBtn = document.getElementById('revive-btn');
        if (this.currentGameRevives >= 3) return;

        if (this.lifetimeFreeRevives > 0) {
            // Use free revive
            this.lifetimeFreeRevives--;
            this.currentGameRevives++;
            this.reviveGame();
            this.updateReviveButtonUI();
        } else {
            // Watch Ad
            reviveBtn.disabled = true;
            reviveBtn.innerHTML = "<span>Loading Ad...</span>";

            await new Promise(r => setTimeout(r, 2000)); // 2 sec ad simulation

            this.currentGameRevives++;
            this.reviveGame();
            
            reviveBtn.disabled = false;
            this.updateReviveButtonUI();
        }
    }

    updateReviveButtonUI() {
        const reviveBtn = document.getElementById('revive-btn');
        if (!reviveBtn) return;
        
        const totalLeftThisGame = 3 - this.currentGameRevives;
        
        if (this.lifetimeFreeRevives > 0) {
            reviveBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px;margin-right:6px;"><path d="M17,10.5V7c0-0.55-0.45-1-1-1H4C3.45,6,3,6.45,3,7v10c0,0.55,0.45,1,1,1h12c0.55,0,1-0.45,1-1v-3.5l4,4v-11L17,10.5z"/></svg>Free Revive (${this.lifetimeFreeRevives} Left)`;
            reviveBtn.classList.add('gold-btn');
        } else {
            reviveBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px;margin-right:6px;"><path d="M17,10.5V7c0-0.55-0.45-1-1-1H4C3.45,6,3,6.45,3,7v10c0,0.55,0.45,1,1,1h12c0.55,0,1-0.45,1-1v-3.5l4,4v-11L17,10.5z"/></svg>Watch Ad (${totalLeftThisGame} left)`;
            reviveBtn.classList.remove('gold-btn');
        }
    }

    reviveGame() {
        this.isGameOver = false;
        
        // Reward: Clear 4x4 area in the center to give player a big chance
        // We'll slightly randomise the center so it clears where most pieces are if possible? 
        // No, keep it consistent for Boss Block
        const start = 2;
        const end = 6;
        for (let r = start; r < end; r++) {
            for (let c = start; c < end; c++) {
                this.grid[r][c] = 0;
            }
        }

        // Hide Game Over UI
        document.getElementById('overlay').classList.add('hidden');
        document.getElementById('game-over-modal').classList.add('hidden');
        
        this.audioManager.init(); // Ensure BGM restarts
        this.audioManager.startBGM();
        
        this.showThemeChangeMessage("🔥 REVIVED! GO!");
        this.audioManager.playReactionSound(5); // Great sound
        this.updateUI();
        this.saveState();
    }

    async handleRefreshClick() {
        if (this.isGameOver) return;
        
        const refreshBtn = document.getElementById('refresh-shapes-btn');
        
        // Per-game limit: Maximum 3 refreshes total
        if (this.currentGameRefreshes >= 3) {
            this.showThemeChangeMessage("🚫 NO MORE REFRESHES!");
            return;
        }

        if (this.lifetimeFreeRefreshes > 0) {
            // Use one of the 3 lifetime free refreshes
            this.lifetimeFreeRefreshes--;
            this.currentGameRefreshes++;
            this.refreshShapes();
            this.updateRefreshButtonUI();
        } else {
            // Watch ad
            refreshBtn.classList.add('loading');
            refreshBtn.title = "Loading Ad...";
            
            // Simulate Ad
            await new Promise(r => setTimeout(r, 2000));
            
            this.currentGameRefreshes++;
            this.refreshShapes();
            refreshBtn.classList.remove('loading');
            this.updateRefreshButtonUI();
        }
    }

    updateRefreshButtonUI() {
        const refreshBtn = document.getElementById('refresh-shapes-btn');
        if (!refreshBtn) return;
        
        const totalLeftThisGame = 3 - this.currentGameRefreshes;
        
        if (totalLeftThisGame <= 0) {
            refreshBtn.classList.add('hidden'); // Disable if used up in this game
            return;
        }
        
        refreshBtn.classList.remove('hidden');

        if (this.lifetimeFreeRefreshes > 0) {
            refreshBtn.title = `Refresh Pieces (${this.lifetimeFreeRefreshes} Lifetime Free Left)`;
            refreshBtn.setAttribute('data-count', this.lifetimeFreeRefreshes);
            refreshBtn.classList.add('premium');
        } else {
            refreshBtn.title = `Refresh Pieces (Watch Ad - ${totalLeftThisGame} left)`;
            refreshBtn.removeAttribute('data-count');
            refreshBtn.classList.remove('premium');
        }
    }

    refreshShapes() {
        this.activeShapes = [null, null, null];
        this.generateShapes();
        this.audioManager.playReactionSound(2);
        this.showThemeChangeMessage("✨ PIECES REFRESHED");
        this.saveState();
    }
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
});

export default Game;