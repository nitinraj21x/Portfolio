// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

// Game state
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let isPaused = false;
let gameStarted = false;
let gameSpeed = 100;

// UI elements
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');
const gameOverElement = document.getElementById('gameOver');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const restartBtn = document.getElementById('restartBtn');

// Initialize
highScoreElement.textContent = highScore;

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('click', () => {
  gameOverElement.classList.remove('show');
  resetGame();
  startGame();
});

document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
  if (!gameStarted) {
    if (e.key === 'Enter' || e.key === ' ') {
      startGame();
      return;
    }
  }

  // Prevent default arrow key scrolling
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
  }

  // Arrow keys
  if (e.key === 'ArrowUp' && dy === 0) {
    dx = 0;
    dy = -1;
  } else if (e.key === 'ArrowDown' && dy === 0) {
    dx = 0;
    dy = 1;
  } else if (e.key === 'ArrowLeft' && dx === 0) {
    dx = -1;
    dy = 0;
  } else if (e.key === 'ArrowRight' && dx === 0) {
    dx = 1;
    dy = 0;
  }

  // WASD keys
  if ((e.key === 'w' || e.key === 'W') && dy === 0) {
    dx = 0;
    dy = -1;
  } else if ((e.key === 's' || e.key === 'S') && dy === 0) {
    dx = 0;
    dy = 1;
  } else if ((e.key === 'a' || e.key === 'A') && dx === 0) {
    dx = -1;
    dy = 0;
  } else if ((e.key === 'd' || e.key === 'D') && dx === 0) {
    dx = 1;
    dy = 0;
  }

  // Pause with spacebar or P
  if ((e.key === ' ' || e.key === 'p' || e.key === 'P') && gameStarted) {
    e.preventDefault();
    togglePause();
  }
}

function startGame() {
  if (gameStarted && !isPaused) return;
  
  if (!gameStarted) {
    gameStarted = true;
    dx = 1;
    dy = 0;
  }
  
  isPaused = false;
  pauseBtn.textContent = 'Pause';
  startBtn.textContent = 'Resume';
  
  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(update, gameSpeed);
}

function togglePause() {
  if (!gameStarted) return;
  
  isPaused = !isPaused;
  
  if (isPaused) {
    clearInterval(gameLoop);
    pauseBtn.textContent = 'Resume';
    drawPauseScreen();
  } else {
    gameLoop = setInterval(update, gameSpeed);
    pauseBtn.textContent = 'Pause';
  }
}

function resetGame() {
  clearInterval(gameLoop);
  snake = [{ x: 10, y: 10 }];
  food = generateFood();
  dx = 0;
  dy = 0;
  score = 0;
  isPaused = false;
  gameStarted = false;
  gameSpeed = 100;
  
  scoreElement.textContent = score;
  startBtn.textContent = 'Start Game';
  pauseBtn.textContent = 'Pause';
  
  draw();
}

function update() {
  if (isPaused) return;
  
  // Move snake
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  
  // Check wall collision
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
    gameOver();
    return;
  }
  
  // Check self collision
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameOver();
    return;
  }
  
  snake.unshift(head);
  
  // Check food collision
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreElement.textContent = score;
    food = generateFood();
    
    // Increase speed slightly
    if (score % 50 === 0 && gameSpeed > 50) {
      gameSpeed -= 5;
      clearInterval(gameLoop);
      gameLoop = setInterval(update, gameSpeed);
    }
  } else {
    snake.pop();
  }
  
  draw();
}

function draw() {
  // Clear canvas
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= TILE_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * GRID_SIZE, 0);
    ctx.lineTo(i * GRID_SIZE, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, i * GRID_SIZE);
    ctx.lineTo(canvas.width, i * GRID_SIZE);
    ctx.stroke();
  }
  
  // Draw snake
  snake.forEach((segment, index) => {
    const gradient = ctx.createLinearGradient(
      segment.x * GRID_SIZE,
      segment.y * GRID_SIZE,
      (segment.x + 1) * GRID_SIZE,
      (segment.y + 1) * GRID_SIZE
    );
    
    if (index === 0) {
      // Head
      gradient.addColorStop(0, '#4ade80');
      gradient.addColorStop(1, '#22c55e');
    } else {
      // Body
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(1, '#059669');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(
      segment.x * GRID_SIZE + 1,
      segment.y * GRID_SIZE + 1,
      GRID_SIZE - 2,
      GRID_SIZE - 2
    );
    
    // Add shine effect on head
    if (index === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(
        segment.x * GRID_SIZE + 3,
        segment.y * GRID_SIZE + 3,
        GRID_SIZE / 3,
        GRID_SIZE / 3
      );
    }
  });
  
  // Draw food
  const foodGradient = ctx.createRadialGradient(
    food.x * GRID_SIZE + GRID_SIZE / 2,
    food.y * GRID_SIZE + GRID_SIZE / 2,
    2,
    food.x * GRID_SIZE + GRID_SIZE / 2,
    food.y * GRID_SIZE + GRID_SIZE / 2,
    GRID_SIZE / 2
  );
  foodGradient.addColorStop(0, '#fbbf24');
  foodGradient.addColorStop(1, '#f59e0b');
  
  ctx.fillStyle = foodGradient;
  ctx.beginPath();
  ctx.arc(
    food.x * GRID_SIZE + GRID_SIZE / 2,
    food.y * GRID_SIZE + GRID_SIZE / 2,
    GRID_SIZE / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  
  // Add sparkle to food
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.arc(
    food.x * GRID_SIZE + GRID_SIZE / 3,
    food.y * GRID_SIZE + GRID_SIZE / 3,
    2,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawPauseScreen() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 40px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
}

function generateFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT)
    };
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  
  return newFood;
}

function gameOver() {
  clearInterval(gameLoop);
  gameStarted = false;
  
  // Update high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
    highScoreElement.textContent = highScore;
  }
  
  finalScoreElement.textContent = score;
  gameOverElement.classList.add('show');
}

// Initial draw
draw();
