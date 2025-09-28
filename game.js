// ===== Breakout Game Logic =====

// Grab the canvas and set up context
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Grab the DOM elements
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const lightThemeBtn = document.getElementById("light-theme-btn");
const darkThemeBtn = document.getElementById("dark-theme-btn");
const neonThemeBtn = document.getElementById("neon-theme-btn");


lightThemeBtn.addEventListener("click", () => {
  document.body.classList.remove("dark-mode", "neon-mode");
  redrawCanvas();
});

darkThemeBtn.addEventListener("click", () => {
  document.body.classList.remove("neon-mode");
  document.body.classList.add("dark-mode");
  redrawCanvas();
});

neonThemeBtn.addEventListener("click", () => {
  document.body.classList.remove("dark-mode");
  document.body.classList.add("neon-mode");
  redrawCanvas();
});

let gameState = "paused";


// Canvas size
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle properties
const paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (WIDTH - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

// Ball properties
let ballRadius = 8;
let x = WIDTH / 2;
let y = HEIGHT - 30;
let dx = 3;
let dy = -3;

// Brick grid
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let score = 0;
let lives = 3;
let currentLevel = 0;

const levels = [
  // Level 1
  [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ],
  // Level 2
  [
    [1, 1, 0, 1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 0, 1],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [1, 1, 0, 1, 1, 0, 1, 1],
  ],
  // Level 3
  [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ],
];

let bricks = [];

function loadLevel(level) {
  bricks = [];
  const currentLevelLayout = levels[level];
  for (let r = 0; r < currentLevelLayout.length; r++) {
    bricks[r] = [];
    for (let c = 0; c < currentLevelLayout[r].length; c++) {
      const randomColor = `hsl(${Math.random() * 360}, 50%, 50%)`;
      bricks[r][c] = { x: 0, y: 0, status: currentLevelLayout[r][c], color: randomColor };
    }
  }
}

// ===== Event Listeners =====
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("mousemove", mouseMoveHandler);

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
resetBtn.addEventListener("click", resetGame);

function startGame() {
  if (gameState === "paused") {
    gameState = "running";
    pauseBtn.textContent = "Pause";
    draw();
  }
}

function togglePause() {
  if (gameState === "running") {
    gameState = "paused";
    pauseBtn.textContent = "Resume";
  } else if (gameState === "paused") {
    gameState = "running";
    pauseBtn.textContent = "Pause";
    draw();
  }
}

let ballSpeed = 1;

function resetGame() {
  gameState = "paused";
  pauseBtn.textContent = "Pause";
  score = 0;
  lives = 3;
  currentLevel = 0;
  ballSpeed = 1;
  paddleWidth = 75;
  activePowerups = {};
  particles = [];
  x = WIDTH / 2;
  y = HEIGHT - 30;
  dx = Math.random() < 0.5 ? 3 : -3;
  dy = -3;
  rightPressed = false;
  leftPressed = false;
  paddleX = (WIDTH - paddleWidth) / 2;
  loadLevel(currentLevel);
  scoreEl.textContent = "Score: " + score;
  livesEl.textContent = "Lives: " + lives;
  redrawCanvas();
}

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
  else if (e.key === "p" || e.key === "P") {
    togglePause();
  } else if (e.key === "r" || e.key === "R") {
    resetGame();
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

function mouseMoveHandler(e) {
  if (gameState === "paused") {
    return;
  }
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < WIDTH) {
    paddleX = relativeX - paddleWidth / 2;
    if (paddleX < 0) {
      paddleX = 0;
    }
    if (paddleX + paddleWidth > WIDTH) {
      paddleX = WIDTH - paddleWidth;
    }
  }
}

let powerups = [];
let particles = [];

// ===== Particle Class =====
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = Math.random() * 5 + 2;
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 3 - 1.5;
    this.life = 100;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= 1;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===== Drawing Functions =====
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  if (document.body.classList.contains('dark-mode')) {
    ctx.fillStyle = '#fff';
  } else if (document.body.classList.contains('neon-mode')) {
    ctx.fillStyle = '#0f0';
  } else {
    ctx.fillStyle = '#000';
  }
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, HEIGHT - paddleHeight, paddleWidth, paddleHeight);
  if (document.body.classList.contains('dark-mode')) {
    ctx.fillStyle = '#fff';
  } else if (document.body.classList.contains('neon-mode')) {
    ctx.fillStyle = '#0f0';
  } else {
    ctx.fillStyle = '#000';
  }
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let r = 0; r < bricks.length; r++) {
    for (let c = 0; c < bricks[r].length; c++) {
      if (bricks[r][c].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[r][c].x = brickX;
        bricks[r][c].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = bricks[r][c].color;
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawPowerups() {
  for (let i = 0; i < powerups.length; i++) {
    const p = powerups[i];
    if (p.status === 1) {
      ctx.font = "20px Arial";
      let emoji = "";
      if (p.type === "longPaddle") {
        emoji = "↔️";
      } else if (p.type === "slowBall") {
        emoji = "🐌";
      } else if (p.type === "extraLife") {
        emoji = "❤️";
      }
      ctx.fillText(emoji, p.x, p.y);
    }
  }
}

function drawParticles() {
  for (let i = 0; i < particles.length; i++) {
    particles[i].draw();
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function createParticles(x, y, color) {
  for (let i = 0; i < 10; i++) {
    particles.push(new Particle(x, y, color));
  }
}

// ===== Collision Detection =====
function collisionDetection() {
  for (let r = 0; r < bricks.length; r++) {
    for (let c = 0; c < bricks[r].length; c++) {
      const b = bricks[r][c];
      if (b.status === 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          scoreEl.textContent = "Score: " + score;
          createParticles(b.x + brickWidth / 2, b.y + brickHeight / 2, b.color);

          if (Math.random() < 0.2) { // 20% chance to spawn a powerup
            const powerupTypes = ["longPaddle", "slowBall", "extraLife"];
            const randomType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
            powerups.push({ x: b.x + brickWidth / 2, y: b.y, type: randomType, status: 1 });
          }

          let allBricksCleared = true;
          for (let r2 = 0; r2 < bricks.length; r2++) {
            for (let c2 = 0; c2 < bricks[r2].length; c2++) {
              if (bricks[r2][c2].status === 1) {
                allBricksCleared = false;
                break;
              }
            }
            if (!allBricksCleared) break;
          }

          if (allBricksCleared) {
            currentLevel++;
            if (currentLevel >= levels.length) {
              alert("You Win! Congratulations!");
              resetGame();
            } else {
              alert("Next Level!");
              lives = 3;
              livesEl.textContent = "Lives: " + lives;
              ballSpeed *= 1.2;
              x = WIDTH / 2;
              y = HEIGHT - 30;
              dx = Math.random() < 0.5 ? 3 : -3;
              dy = -3;
              paddleX = (WIDTH - paddleWidth) / 2;
              loadLevel(currentLevel);
            }
          }
        }
      }
    }
  }
}

function updatePowerups() {
  const newPowerups = [];
  for (let i = 0; i < powerups.length; i++) {
    const p = powerups[i];
    if (p.status === 1) {
      p.y += 2;
      if (p.y < HEIGHT) {
        newPowerups.push(p);
      }
    }
  }
  powerups = newPowerups;
}

function powerupCollisionDetection() {
  for (let i = 0; i < powerups.length; i++) {
    const p = powerups[i];
    if (p.status === 1) {
      if (
        p.x > paddleX &&
        p.x < paddleX + paddleWidth &&
        p.y > HEIGHT - paddleHeight &&
        p.y < HEIGHT
      ) {
        p.status = 0;
        activatePowerup(p.type);
      }
    }
  }
}

let activePowerups = {};

function updateActivePowerups() {
  const now = Date.now();
  for (const type in activePowerups) {
    if (now > activePowerups[type]) {
      deactivatePowerup(type);
    }
  }
}

function drawPowerupTimers() {
  const powerupEmojis = {
    longPaddle: "↔️",
    slowBall: "🐌",
  };

  ctx.font = "16px Arial";
  ctx.fillStyle = "#FFFFFF";
  let yOffset = 20;
  for (const type in activePowerups) {
    const remainingTime = activePowerups[type] - Date.now();
    if (remainingTime > 0) {
      const minutes = Math.floor(remainingTime / 60000);
      const seconds = Math.ceil((remainingTime % 60000) / 1000).toString().padStart(2, '0');
      const emoji = powerupEmojis[type] || "";
      ctx.fillText(`${emoji}: ${minutes}:${seconds}`, WIDTH - 120, yOffset);
      yOffset += 20;
    }
  }
}

function activatePowerup(type) {
  if (type === "longPaddle") {
    paddleWidth = 150;
    if (activePowerups.longPaddle) {
      activePowerups.longPaddle += 10000;
    } else {
      activePowerups.longPaddle = Date.now() + 10000;
    }
  } else if (type === "slowBall") {
    if (!activePowerups.slowBall) {
      dx *= 0.5;
      dy *= 0.5;
      activePowerups.slowBall = Date.now() + 10000;
    } else {
      activePowerups.slowBall += 10000;
    }
  } else if (type === "extraLife") {
    lives++;
    livesEl.textContent = "Lives: " + lives;
  }
}

function deactivatePowerup(type) {
  if (type === "longPaddle") {
    paddleWidth = 75;
  } else if (type === "slowBall") {
    dx *= 2;
    dy *= 2;
  }
  delete activePowerups[type];
}

function redrawCanvas() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawBricks();
  drawBall();
  drawPaddle();
  drawPowerups();
  drawParticles();
  drawPowerupTimers();
}

// ===== Main Draw Loop =====
function draw() {
  if (gameState === "running") {
    redrawCanvas();
    collisionDetection();
    powerupCollisionDetection();
    updatePowerups();
    updateActivePowerups();
    updateParticles();

    // Bounce off side walls
    if (x + dx > WIDTH - ballRadius || x + dx < ballRadius) dx = -dx;

    // Bounce off top
    if (y + dy < ballRadius) dy = -dy;
    else if (y + dy > HEIGHT - ballRadius - paddleHeight && y + dy < HEIGHT - paddleHeight) {
        if (x > paddleX && x < paddleX + paddleWidth) {
          dy = -dy;
          let deltaX = x - (paddleX + paddleWidth / 2);
          dx = deltaX * 0.1;
        } 
      } else if (y + dy > HEIGHT - ballRadius) {
        lives--;
        livesEl.textContent = "Lives: " + lives;
        if (!lives) {
          alert("Game Over");
          resetGame();
        } else {
          x = WIDTH / 2;
          y = HEIGHT - 30;
          dx = Math.random() < 0.5 ? 3 : -3;
          dy = -3;
          paddleX = (WIDTH - paddleWidth) / 2;
        }
      }

    if (rightPressed && paddleX < WIDTH - paddleWidth) paddleX += 7;
    else if (leftPressed && paddleX > 0) paddleX -= 7;

    x += dx * ballSpeed;
    y += dy * ballSpeed;
    requestAnimationFrame(draw);
  }
}

// Start the game loop
resetGame();
