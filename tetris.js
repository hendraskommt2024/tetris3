// ===== GAME CONSTANTS =====
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const PREVIEW_SIZE = 4;

// Tetromino shapes and their rotations
const TETROMINOS = {
    'I': {
        shape: [
            [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
            [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
            [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
            [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]
        ],
        className: 'piece-I'
    },
    'J': {
        shape: [
            [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
            [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
            [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
            [[0, 1, 0], [0, 1, 0], [1, 1, 0]]
        ],
        className: 'piece-J'
    },
    'L': {
        shape: [
            [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
            [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
            [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
            [[1, 1, 0], [0, 1, 0], [0, 1, 0]]
        ],
        className: 'piece-L'
    },
    'O': {
        shape: [
            [[1, 1], [1, 1]]
        ],
        className: 'piece-O'
    },
    'S': {
        shape: [
            [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
            [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
            [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
            [[1, 0, 0], [1, 1, 0], [0, 1, 0]]
        ],
        className: 'piece-S'
    },
    'T': {
        shape: [
            [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
            [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
            [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
            [[0, 1, 0], [1, 1, 0], [0, 1, 0]]
        ],
        className: 'piece-T'
    },
    'Z': {
        shape: [
            [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
            [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
            [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
            [[0, 1, 0], [1, 1, 0], [1, 0, 0]]
        ],
        className: 'piece-Z'
    }
};

// Level speed configuration (milliseconds)
const LEVEL_SPEEDS = [
    800, 720, 630, 550, 470, 
    380, 300, 220, 130, 100, 
    80, 80, 80, 70, 70, 
    70, 50, 50, 30, 30
];

// Points for different line clears
const POINTS = {
    1: 100,   // Single line
    2: 300,   // Double
    3: 500,   // Triple
    4: 800    // Tetris
};

// ===== GAME VARIABLES =====
let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
// Store tetromino types in the board for proper coloring
let boardColors = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null));
let currentPiece = null;
let nextPiece = null;
let currentPosition = { x: 0, y: 0 };
let currentRotation = 0;
let score = 0;
let lines = 0;
let level = 1;
let gameInterval = null;
let isPaused = false;
let isGameOver = false;
let ghostPosition = { x: 0, y: 0 };

// DOM Elements
const boardElement = document.getElementById('tetris-board');
const nextPieceContainer = document.getElementById('next-piece-container');
const scoreElement = document.getElementById('score');
const linesElement = document.getElementById('lines');
const levelElement = document.getElementById('level');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

// Mobile control elements
const mobileLeft = document.getElementById('mobile-left');
const mobileRight = document.getElementById('mobile-right');
const mobileRotate = document.getElementById('mobile-rotate');
const mobileDown = document.getElementById('mobile-down');
const mobileDrop = document.getElementById('mobile-drop');

// ===== GAME INITIALIZATION =====

// Initialize the game board
function initializeBoard() {
    // Create board cells
    boardElement.innerHTML = '';
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.classList.add('tetris-cell');
            cell.setAttribute('data-x', x);
            cell.setAttribute('data-y', y);
            boardElement.appendChild(cell);
        }
    }
    
    // Create next piece preview cells
    nextPieceContainer.innerHTML = '';
    for (let y = 0; y < PREVIEW_SIZE; y++) {
        for (let x = 0; x < PREVIEW_SIZE; x++) {
            const cell = document.createElement('div');
            cell.classList.add('preview-cell');
            nextPieceContainer.appendChild(cell);
        }
    }
}

// Reset game state
function resetGame() {
    // Clear the board
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    boardColors = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null));
    
    // Reset game variables
    score = 0;
    lines = 0;
    level = 1;
    isPaused = false;
    isGameOver = false;
    
    // Update display
    updateScore();
    updateLevel();
    updateLines();
    
    // Clear the board display
    clearBoardDisplay();
    
    // Generate initial pieces
    nextPiece = generateRandomPiece();
    getNewPiece();
    
    // Update UI buttons
    startButton.disabled = true;
    pauseButton.disabled = false;
    pauseButton.textContent = 'Pause';
    
    // Hide game over modal if it's open
    gameOverModal.style.display = 'none';
}

// Clear the visual board display
function clearBoardDisplay() {
    const cells = boardElement.querySelectorAll('.tetris-cell');
    cells.forEach(cell => {
        cell.className = 'tetris-cell';
    });
}

// ===== PIECE MANAGEMENT =====

// Generate a random tetromino
function generateRandomPiece() {
    const pieces = Object.keys(TETROMINOS);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    return {
        type: randomPiece,
        rotation: 0
    };
}

// Get a new piece and place it at the top of the board
function getNewPiece() {
    currentPiece = nextPiece;
    nextPiece = generateRandomPiece();
    currentRotation = 0;
    
    // Calculate starting position (center top)
    const shape = TETROMINOS[currentPiece.type].shape[currentRotation];
    currentPosition = {
        x: Math.floor((BOARD_WIDTH - shape[0].length) / 2),
        y: 0
    };
    
    // Check if the new piece can be placed (game over check)
    if (!isValidMove(currentPosition.x, currentPosition.y, currentRotation)) {
        gameOver();
        return false;
    }
    
    // Update next piece preview
    updateNextPiecePreview();
    
    // Calculate ghost piece position
    updateGhostPiece();
    
    // Draw the new piece
    drawPiece();
    
    return true;
}

// Update the next piece preview
function updateNextPiecePreview() {
    // Clear previous preview
    const previewCells = nextPieceContainer.querySelectorAll('.preview-cell');
    previewCells.forEach(cell => {
        cell.className = 'preview-cell';
    });
    
    // Get the next piece shape
    const shape = TETROMINOS[nextPiece.type].shape[0];
    const className = TETROMINOS[nextPiece.type].className;
    
    // Center the piece in the preview
    const offsetX = Math.floor((PREVIEW_SIZE - shape[0].length) / 2);
    const offsetY = Math.floor((PREVIEW_SIZE - shape.length) / 2);
    
    // Draw the next piece in the preview
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const index = (offsetY + y) * PREVIEW_SIZE + (offsetX + x);
                if (previewCells[index]) {
                    previewCells[index].classList.add(className);
                }
            }
        }
    }
}

// Update ghost piece position (preview of where piece will land)
function updateGhostPiece() {
    // Start from current position
    ghostPosition = { ...currentPosition };
    
    // Drop ghost piece as far as it can go
    while (isValidMove(ghostPosition.x, ghostPosition.y + 1, currentRotation)) {
        ghostPosition.y++;
    }
}

// ===== PIECE MOVEMENT & COLLISION =====

// Check if a move is valid (no collisions or out of bounds)
function isValidMove(x, y, rotation) {
    const shape = TETROMINOS[currentPiece.type].shape[rotation];
    
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            // Skip empty cells in the tetromino
            if (!shape[row][col]) continue;
            
            const boardX = x + col;
            const boardY = y + row;
            
            // Check if out of bounds
            if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
                return false;
            }
            
            // Check if already filled (and not out of top bound)
            if (boardY >= 0 && board[boardY][boardX]) {
                return false;
            }
        }
    }
    
    return true;
}

// Move the current piece
function movePiece(dx, dy) {
    // Calculate new position
    const newX = currentPosition.x + dx;
    const newY = currentPosition.y + dy;
    
    // Check if the move is valid
    if (isValidMove(newX, newY, currentRotation)) {
        // Erase piece from current position
        erasePiece();
        
        // Update position
        currentPosition.x = newX;
        currentPosition.y = newY;
        
        // Update ghost position on horizontal moves
        if (dx !== 0 && dy === 0) {
            updateGhostPiece();
        }
        
        // Draw piece at new position
        drawPiece();
        return true;
    }
    
    // If piece can't move down, lock it
    if (dy > 0 && dx === 0) {
        lockPiece();
        return false;
    }
    
    return false;
}

// Rotate the current piece
function rotatePiece() {
    // Calculate new rotation
    const newRotation = (currentRotation + 1) % TETROMINOS[currentPiece.type].shape.length;
    
    // Check if rotation is valid
    if (isValidMove(currentPosition.x, currentPosition.y, newRotation)) {
        // Erase piece from current position
        erasePiece();
        
        // Update rotation
        currentRotation = newRotation;
        
        // Update ghost position
        updateGhostPiece();
        
        // Draw piece with new rotation
        drawPiece();
        return true;
    }
    
    // Wall kick attempts (try to push the piece away from walls/other pieces)
    const kicks = [
        {dx: 1, dy: 0},  // Right
        {dx: -1, dy: 0}, // Left
        {dx: 0, dy: -1}, // Up
        {dx: 2, dy: 0},  // Two spaces right
        {dx: -2, dy: 0}, // Two spaces left
    ];
    
    // Try each possible kick
    for (const kick of kicks) {
        if (isValidMove(currentPosition.x + kick.dx, currentPosition.y + kick.dy, newRotation)) {
            // Erase piece from current position
            erasePiece();
            
            // Update position and rotation
            currentPosition.x += kick.dx;
            currentPosition.y += kick.dy;
            currentRotation = newRotation;
            
            // Update ghost position
            updateGhostPiece();
            
            // Draw piece with new rotation and position
            drawPiece();
            return true;
        }
    }
    
    return false;
}

// Hard drop - move piece all the way down
function hardDrop() {
    // Move piece to ghost position
    erasePiece();
    currentPosition = { ...ghostPosition };
    drawPiece();
    
    // Lock the piece
    lockPiece();
}

// Lock the piece in place
function lockPiece() {
    const shape = TETROMINOS[currentPiece.type].shape[currentRotation];
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const boardY = currentPosition.y + row;
                const boardX = currentPosition.x + col;
                board[boardY][boardX] = 1;
                boardColors[boardY][boardX] = currentPiece.type;
            }
        }
    }

    // Clear completed lines
    clearLines();
    
    // Get a new piece
    if(!getNewPiece()){
        return;
    }
}

// ===== DRAWING & ERASING =====

// Draw the current piece on the board
function drawPiece() {
    drawGhostPiece();

    const shape = TETROMINOS[currentPiece.type].shape[currentRotation];
    const className = TETROMINOS[currentPiece.type].className;

    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const boardX = currentPosition.x + col;
                const boardY = currentPosition.y + row;
                if (boardY >= 0) {
                    const cell = boardElement.querySelector(`[data-x="${boardX}"][data-y="${boardY}"]`);
                    if (cell) {
                        cell.classList.add(className);
                    }
                }
            }
        }
    }
}

// Erase the current piece from the board
function erasePiece() {
    // Remove ghost piece
    eraseGhostPiece();
    
    const shape = TETROMINOS[currentPiece.type].shape[currentRotation];
    
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const boardX = currentPosition.x + col;
                const boardY = currentPosition.y + row;
                if (boardY >= 0) {
                    const cell = boardElement.querySelector(`[data-x="${boardX}"][data-y="${boardY}"]`);
                    if (cell) {
                        // Remove all piece classes
                        cell.className = 'tetris-cell';
                    }
                }
            }
        }
    }
}

// Draw the ghost piece (shadow showing where piece will land)
function drawGhostPiece() {
    const shape = TETROMINOS[currentPiece.type].shape[currentRotation];
    const className = TETROMINOS[currentPiece.type].className;
    
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const boardX = ghostPosition.x + col;
                const boardY = ghostPosition.y + row;
                
                // Only draw ghost if it's not where the actual piece is
                if (boardY >= 0 && 
                    (boardY !== currentPosition.y + row || 
                     boardX !== currentPosition.x + col)) {
                    const cell = boardElement.querySelector(`[data-x="${boardX}"][data-y="${boardY}"]`);
                    if (cell) {
                        cell.classList.add(className, 'ghost-piece');
                    }
                }
            }
        }
    }
}

// Erase the ghost piece
function eraseGhostPiece() {
    const shape = TETROMINOS[currentPiece.type].shape[currentRotation];
    
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const boardX = ghostPosition.x + col;
                const boardY = ghostPosition.y + row;
                
                if (boardY >= 0) {
                    const cell = boardElement.querySelector(`[data-x="${boardX}"][data-y="${boardY}"]`);
                    if (cell) {
                        cell.classList.remove('ghost-piece', TETROMINOS[currentPiece.type].className);
                    }
                }
            }
        }
    }
}

// ===== LINE CLEARING & SCORING =====

// Check for and clear completed lines
function clearLines() {
    let linesCleared = 0;
    
    // Check each row from bottom to top
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        // Check if row is full
        const isRowFull = board[y].every(cell => cell === 1);
        
        if (isRowFull) {
            linesCleared++;
            
            // Flash effect for cleared line
            flashRow(y);
            
            // Move all rows above down
            for (let row = y; row > 0; row--) {
                board[row] = [...board[row - 1]];
                boardColors[row] = [...boardColors[row - 1]];
            }
            
            // Clear the top row
            board[0] = Array(BOARD_WIDTH).fill(0);
            boardColors[0] = Array(BOARD_WIDTH).fill(null);
            
            // Since we moved rows down, we need to check this row again
            y++;
        }
    }
    
    // Update score and level if lines were cleared
    if (linesCleared > 0) {
        // Add points based on number of lines cleared
        score += POINTS[linesCleared] * level;
        
        // Update total lines cleared
        lines += linesCleared;
        
        // Update level (every 10 lines)
        level = Math.floor(lines / 10) + 1;
        
        // Update game speed based on level
        updateGameSpeed();
        
        // Update display
        updateScore();
        updateLines();
        updateLevel();
        
        // Redraw the board to show changes
        drawBoard();
    }
}

// Flash effect for cleared row
function flashRow(row) {
    // Add flash effect to all cells in the row
    for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = boardElement.querySelector(`[data-x="${x}"][data-y="${row}"]`);
        if (cell) {
            cell.classList.add('flash');
            
            // Remove the flash class after animation completes
            setTimeout(() => {
                cell.classList.remove('flash');
            }, 100);
        }
    }
}

// Draw the entire board based on the board array
function drawBoard() {
    // Clear all cells
    const cells = boardElement.querySelectorAll('.tetris-cell');
    cells.forEach(cell => {
        cell.className = 'tetris-cell';
    });
    
    // Draw locked pieces
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x]) {
                const cell = boardElement.querySelector(`[data-x="${x}"][data-y="${y}"]`);
                if (cell) {
                    // Use the stored tetromino type to apply the correct class
                    const pieceType = boardColors[y][x];
                    if (pieceType && TETROMINOS[pieceType]) {
                        cell.classList.add(TETROMINOS[pieceType].className);
                    } else {
                        // Fallback for any pieces without color info
                        cell.classList.add('piece-I');
                    }
                }
            }
        }
    }
    
    // Redraw current piece
    drawPiece();
}

// ===== GAME CONTROL =====

// Start the game
function startGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    resetGame();
    
    // Set game interval based on level
    updateGameSpeed();
}

// Update game speed based on current level
function updateGameSpeed() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    // Get speed for current level (capped at max level in LEVEL_SPEEDS)
    const levelIndex = Math.min(level - 1, LEVEL_SPEEDS.length - 1);
    const speed = LEVEL_SPEEDS[levelIndex];
    
    // Set new interval
    gameInterval = setInterval(gameLoop, speed);
}

// Main game loop
function gameLoop() {
    if (isPaused || isGameOver) return;
    
    // Move piece down
    movePiece(0, 1);
}

// Toggle pause state
function togglePause() {
    if (isGameOver) return;
    
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
}

// Game over
function gameOver() {
    isGameOver = true;
    
    // Stop the game loop
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    
    // Update UI
    startButton.disabled = false;
    pauseButton.disabled = true;
    
    // Show game over modal
    finalScoreElement.textContent = score;
    gameOverModal.style.display = 'flex';
}

// ===== SCORE UPDATES =====

// Update score display
function updateScore() {
    scoreElement.textContent = score;
}

// Update lines display
function updateLines() {
    linesElement.textContent = lines;
}

// Update level display
function updateLevel() {
    levelElement.textContent = level;
}

// ===== EVENT LISTENERS =====

// Keyboard controls
document.addEventListener('keydown', (event) => {
    if (isGameOver) return;
    
    // Prevent default behavior for game keys
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 
         'KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyP'].includes(event.code)) {
        event.preventDefault();
    }
    
    // Skip if game is paused (except for pause toggle)
    if (isPaused && event.code !== 'KeyP') return;
    
    switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
            movePiece(-1, 0); // Move left
            break;
        case 'ArrowRight':
        case 'KeyD':
            movePiece(1, 0);  // Move right
            break;
        case 'ArrowUp':
        case 'KeyW':
            rotatePiece();    // Rotate
            break;
        case 'ArrowDown':
        case 'KeyS':
            movePiece(0, 1);  // Move down
            break;
        case 'Space':
            hardDrop();       // Hard drop
            break;
        case 'KeyP':
            togglePause();    // Pause/resume
            break;
    }
});

// Mobile controls
mobileLeft.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!isPaused && !isGameOver) movePiece(-1, 0);
});

mobileRight.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!isPaused && !isGameOver) movePiece(1, 0);
});

mobileRotate.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!isPaused && !isGameOver) rotatePiece();
});

mobileDown.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!isPaused && !isGameOver) movePiece(0, 1);
});

mobileDrop.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!isPaused && !isGameOver) hardDrop();
});

// Prevent scrolling when touching mobile controls
document.querySelector('.mobile-controls').addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// Button controls
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', () => {
    gameOverModal.style.display = 'none';
    startGame();
});

// ===== INITIALIZATION =====

// Initialize the game board on load
initializeBoard();

// Enable start button
startButton.disabled = false;
pauseButton.disabled = true;
