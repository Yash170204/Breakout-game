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

let gameState = "paused";


// Canvas size
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle properties
const paddleHeight = 10;
const paddleWidth = 75;
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
const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let score = 0;
let lives = 3;

const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

// ===== Event Listeners =====
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("mousemove", mouseMoveHandler);

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
resetBtn.addEventListener("click", resetGame);

function startGame() {
  if (gameState === "paused") {
    gameState = "running";
    draw();
  }
}

function pauseGame() {
  if (gameState === "running") {
    gameState = "paused";
  }
}

function resetGame() {
  gameState = "paused";
  score = 0;
  lives = 3;
  x = WIDTH / 2;
  y = HEIGHT - 30;
  dx = 3;
  dy = -3;
  paddleX = (WIDTH - paddleWidth) / 2;
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r].status = 1;
    }
  }
  scoreEl.textContent = "Score: " + score;
  livesEl.textContent = "Lives: " + lives;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawBricks();
  drawBall();
  drawPaddle();
}

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < WIDTH) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

// ===== Drawing Functions =====
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, HEIGHT - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}



// ===== Collision Detection =====
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
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
          if (score === brickRowCount * brickColumnCount) {
            alert("You Win! Congratulations!");
            resetGame();
          }
        }
      }
    }
  }
}

// ===== Main Draw Loop =====
function draw() {
  if (gameState === "paused") {
    return;
  }

  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  // Bounce off side walls
  if (x + dx > WIDTH - ballRadius || x + dx < ballRadius) dx = -dx;

  // Bounce off top
  if (y + dy < ballRadius) dy = -dy;
  else if (y + dy > HEIGHT - ballRadius) {
    // Check paddle collision or lose life
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    } else {
      lives--;
      livesEl.textContent = "Lives: " + lives;
      if (!lives) {
        alert("Game Over");
        resetGame();
      } else {
        x = WIDTH / 2;
        y = HEIGHT - 30;
        dx = 3;
        dy = -3;
        paddleX = (WIDTH - paddleWidth) / 2;
      }
    }
  }

  if (rightPressed && paddleX < WIDTH - paddleWidth) paddleX += 7;
  else if (leftPressed && paddleX > 0) paddleX -= 7;

  x += dx;
  y += dy;
  requestAnimationFrame(draw);
}

// Start the game loop
resetGame();
