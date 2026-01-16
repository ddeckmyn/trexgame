const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const messageEl = document.getElementById("message");
const restartButton = document.getElementById("restart");

const groundY = canvas.height - 60;
const rex = {
  x: canvas.width / 2,
  y: groundY - 80,
  width: 120,
  height: 90,
  speed: 6,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 18,
  velocityX: 0,
  velocityY: 0,
  gravity: 0.35,
  bounce: 0.75,
};

let keys = { left: false, right: false };
let score = 0;
let best = 0;
let lastHitTime = 0;
let running = false;

const resetBall = () => {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.velocityX = (Math.random() - 0.5) * 6;
  ball.velocityY = -4;
};

const resetGame = () => {
  score = 0;
  scoreEl.textContent = score.toString();
  messageEl.textContent = "Klik of druk op spatie om te starten.";
  rex.x = canvas.width / 2;
  resetBall();
  running = false;
};

const startGame = () => {
  if (running) {
    return;
  }
  running = true;
  messageEl.textContent = "Blijf koppen!";
  lastHitTime = performance.now();
};

const updateScore = () => {
  score += 1;
  scoreEl.textContent = score.toString();
  if (score > best) {
    best = score;
    bestEl.textContent = best.toString();
  }
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const handleCollision = () => {
  const headRadiusX = rex.width * 0.35;
  const headRadiusY = rex.height * 0.35;
  const headCenterX = rex.x + rex.width * 0.65;
  const headCenterY = rex.y + rex.height * 0.35;

  const dx = ball.x - headCenterX;
  const dy = ball.y - headCenterY;
  const normalized = (dx * dx) / (headRadiusX * headRadiusX) + (dy * dy) / (headRadiusY * headRadiusY);

  if (normalized <= 1) {
    ball.velocityY = -Math.abs(ball.velocityY) - 4;
    ball.velocityX += dx * 0.05;
    ball.y = headCenterY - headRadiusY - ball.radius;
    if (performance.now() - lastHitTime > 350) {
      updateScore();
      lastHitTime = performance.now();
    }
  }
};

const update = () => {
  if (keys.left) {
    rex.x -= rex.speed;
  }
  if (keys.right) {
    rex.x += rex.speed;
  }
  rex.x = clamp(rex.x, 20, canvas.width - rex.width - 20);

  if (running) {
    ball.velocityY += ball.gravity;
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
      ball.velocityX *= -0.9;
      ball.x = clamp(ball.x, ball.radius, canvas.width - ball.radius);
    }

    if (ball.y + ball.radius >= groundY) {
      ball.velocityY *= -ball.bounce;
      ball.y = groundY - ball.radius;
      score = 0;
      scoreEl.textContent = score.toString();
      messageEl.textContent = "Oeps! Probeer opnieuw.";
    }

    handleCollision();
  }
};

const drawRex = () => {
  context.fillStyle = "#69c269";
  context.fillRect(rex.x, rex.y + 20, rex.width * 0.6, rex.height * 0.6);

  context.beginPath();
  context.ellipse(
    rex.x + rex.width * 0.65,
    rex.y + rex.height * 0.35,
    rex.width * 0.35,
    rex.height * 0.35,
    0,
    0,
    Math.PI * 2
  );
  context.fillStyle = "#5bb45b";
  context.fill();

  context.fillStyle = "#2f2f2f";
  context.beginPath();
  context.arc(rex.x + rex.width * 0.74, rex.y + rex.height * 0.28, 5, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "#2f2f2f";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(rex.x + rex.width * 0.72, rex.y + rex.height * 0.45);
  context.lineTo(rex.x + rex.width * 0.88, rex.y + rex.height * 0.45);
  context.stroke();

  context.fillStyle = "#4a9f4a";
  context.fillRect(rex.x + 10, rex.y + rex.height * 0.75, 18, 30);
  context.fillRect(rex.x + 40, rex.y + rex.height * 0.75, 18, 30);
};

const drawBall = () => {
  context.beginPath();
  context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  context.fillStyle = "#ff3d3d";
  context.fill();
  context.strokeStyle = "#b71c1c";
  context.lineWidth = 3;
  context.stroke();
};

const drawGround = () => {
  context.fillStyle = "#f6d7a7";
  context.fillRect(0, groundY, canvas.width, canvas.height - groundY);
  context.fillStyle = "#6bb06b";
  context.fillRect(0, groundY - 12, canvas.width, 12);
};

const drawClouds = () => {
  context.fillStyle = "rgba(255, 255, 255, 0.85)";
  context.beginPath();
  context.ellipse(150, 90, 60, 25, 0, 0, Math.PI * 2);
  context.ellipse(200, 80, 50, 22, 0, 0, Math.PI * 2);
  context.ellipse(240, 90, 60, 25, 0, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.ellipse(640, 70, 60, 22, 0, 0, Math.PI * 2);
  context.ellipse(690, 60, 50, 20, 0, 0, Math.PI * 2);
  context.ellipse(730, 70, 60, 22, 0, 0, Math.PI * 2);
  context.fill();
};

const render = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawClouds();
  drawGround();
  drawRex();
  drawBall();
};

const loop = () => {
  update();
  render();
  requestAnimationFrame(loop);
};

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keys.left = true;
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keys.right = true;
  }
  if (event.code === "Space") {
    startGame();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keys.left = false;
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keys.right = false;
  }
});

canvas.addEventListener("pointerdown", startGame);
restartButton.addEventListener("click", () => {
  resetGame();
  startGame();
});

resetGame();
loop();
