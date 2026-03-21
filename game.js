/**
 * Boss Block Puzzle - Core Game Engine
 * Features: 8x8 Grid, Shape Generation, Line Clearing, Scoring, Animations
 */

const GRID_SIZE = 8;
const BLOCK_GAP = 4;
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
        this.userHighScore = parseInt(localStorage.getItem('boss_block_highscore') || 0);
        this.worldHighRun = parseInt(localStorage.getItem('boss_block_highscore') || 0);
        this.comboCount = 0;
        this.worldHighRun = 0;
        this.activeShapes = [null, null, null];
        this.draggingShape = null;
        this.draggingFromSlot = -1;
        this.isGameOver = false;
        this.currentTheme = 0; // 0=night, 1=day, 2=ocean, 3=desert, 4=space, 5=village, 6=forest, 7=sunset, 8=cloudy, 9=crystal, 10=aurora
        this.lastClearTheme = null; // Prevent multiple theme switches on same clear

        this.init();
    }

    init() {
        this.setupCanvas();
        this.loadState(); // Auto-load previous game
        this.generateShapes();
        this.addEventListeners();
        this.loadLocalHighScore();
        this.animate();
        console.log("🎮 Game initialized.");
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        const containerW = container.clientWidth;
        const containerH = container.clientHeight;
        const size = Math.min(containerW, containerH);
        const pxRatio = window.devicePixelRatio || 1;
        this.canvas.width  = size * pxRatio;
        this.canvas.height = size * pxRatio;
        this.canvas.style.width  = `${size}px`;
        this.canvas.style.height = `${size}px`;
        this.ctx.scale(pxRatio, pxRatio);
        this.blockSize = (size - (BLOCK_GAP * (GRID_SIZE + 1))) / GRID_SIZE;
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
        
        // Inner detail for premium look
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(x + 5, y + 5, width / 2, 2);
    }

    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const x = BLOCK_GAP + c * (this.blockSize + BLOCK_GAP);
                const y = BLOCK_GAP + r * (this.blockSize + BLOCK_GAP);
                
                if (this.grid[r][c] !== 0) {
                    const colors = getBlockColors();
                    const color = colors[this.grid[r][c]];
                    // Glow
                    this.ctx.shadowBlur = 12;
                    this.ctx.shadowColor = color;
                    this.drawRoundedRect(this.ctx, x, y, this.blockSize, this.blockSize, 9, color);
                    this.ctx.shadowBlur = 0;
                } else {
                    // Empty cell — subtle grid lines only
                    this.drawRoundedRect(this.ctx, x, y, this.blockSize, this.blockSize, 9, 'rgba(255,255,255,0.04)');
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
        
        const gridX = Math.round((x - rect.left - (shape.matrix[0].length * this.blockSize / 2)) / (this.blockSize + BLOCK_GAP));
        const gridY = Math.round((y - rect.top - (shape.matrix.length * this.blockSize / 2) - 50) / (this.blockSize + BLOCK_GAP));

        if (this.canPlace(shape, gridX, gridY)) {
            this.ctx.globalAlpha = 0.3;
            shape.matrix.forEach((row, r) => {
                row.forEach((cell, c) => {
                    if (cell) {
                        const drawX = BLOCK_GAP + (gridX + c) * (this.blockSize + BLOCK_GAP);
                        const drawY = BLOCK_GAP + (gridY + r) * (this.blockSize + BLOCK_GAP);
                        this.drawRoundedRect(this.ctx, drawX, drawY, this.blockSize, this.blockSize, 8, getBlockColors()[shape.colorId]);
                    }
                });
            });
            this.ctx.globalAlpha = 1.0;
        }
    }

    drawDraggingShape() {
        const { x, y, shape } = this.draggingShape;
        const rect = this.canvas.getBoundingClientRect();
        
        // Calculate grid position for ghost effect/preview
        const gridX = Math.round((x - rect.left) / (this.blockSize + BLOCK_GAP) - shape.matrix[0].length / 2);
        const gridY = Math.round((y - rect.top) / (this.blockSize + BLOCK_GAP) - shape.matrix.length / 2);

        // Draw actual dragging shape following mouse
        shape.matrix.forEach((row, rIdx) => {
            row.forEach((cell, cIdx) => {
                if (cell) {
                    const drawX = x - rect.left + (cIdx - shape.matrix[0].length / 2) * this.blockSize;
                    const drawY = y - rect.top + (rIdx - shape.matrix.length / 2) * this.blockSize - 50; // Lift above finger
                    this.drawRoundedRect(this.ctx, drawX, drawY, this.blockSize, this.blockSize, 8, getBlockColors()[shape.colorId]);
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
    }

    startDragging(e, slotIndex) {
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
        
        // Calculate placement position
        const gridX = Math.round((pointer.clientX - rect.left - (this.draggingShape.shape.matrix[0].length * this.blockSize / 2)) / (this.blockSize + BLOCK_GAP));
        const gridY = Math.round((pointer.clientY - rect.top - (this.draggingShape.shape.matrix.length * this.blockSize / 2) - 50) / (this.blockSize + BLOCK_GAP));

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
        const word = words[Math.min(count - 1 + this.comboCount, words.length - 1)];
        
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
            localStorage.setItem('boss_block_last_score', this.score);
            document.getElementById('overlay').classList.remove('hidden');
            document.getElementById('game-over-modal').classList.remove('hidden');
            this.finalScoreDisplay.textContent = this.score;
            this.handleHighScores();
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
            lastClearTheme: this.lastClearTheme
        };
        localStorage.setItem('boss_block_game_state', JSON.stringify(state));
    }

    loadState() {
        const saved = localStorage.getItem('boss_block_game_state');
        if (saved) {
            const state = JSON.parse(saved);
            this.grid = state.grid;
            this.score = state.score;
            this.activeShapes = state.activeShapes;
            this.currentTheme = state.currentTheme || 0;
            this.lastClearTheme = state.lastClearTheme || null;
            
            // Apply correct theme on load
            this.switchToTheme(this.currentTheme);
            
            this.updateUI();
            
            // Re-render shapes in slots
            this.activeShapes.forEach((shape, i) => {
                if (shape) this.renderShapeSlot(i);
            });
        }
    }

    loadLocalHighScore() {
        const local = localStorage.getItem('boss_block_highscore') || 0;
        this.worldHighRun = parseInt(local) || 0;
        this.userHighScore = this.worldHighRun;
        if (this.worldScoreDisplay) {
            this.worldScoreDisplay.textContent = this.worldHighRun.toString().padStart(6, '0');
        }
        if (this.userBestDisplay) {
            this.userBestDisplay.textContent = this.userHighScore.toString().padStart(6, '0');
        }
    }

    handleHighScores() {
        // Update user's best score if current score is higher
        if (this.score > this.userHighScore) {
            this.userHighScore = this.score;
            localStorage.setItem('boss_block_highscore', this.score);
        }
        
        // Update world high run if current score is higher
        if (this.score > this.worldHighRun) {
            this.worldHighRun = this.score;
            localStorage.setItem('boss_block_highscore', this.score);
        }
    }
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
});

export default Game;
