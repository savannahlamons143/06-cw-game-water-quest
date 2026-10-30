// Game settings
const GOAL_CANS = 20;
const ROUND_LENGTH = 30;
const SPAWN_DELAY = 1000;
const MISS_PENALTY = 1;

// Game state
let currentCans = 0;
let timeLeft = ROUND_LENGTH;
let gameActive = false;
let currentCell = null;
let spawnInterval;
let timerInterval;
let confettiTimeout;

// Possible end-of-game messages
const winningMessages = [
  "Amazing work! You collected at least 20 cans!",
  "Quest complete! You made every drop count!",
  "You did it! That was a splash-worthy score!",
  "Incredible tapping! You reached the goal!"
];

const losingMessages = [
  "Nice try! Start another round and see if you can reach 20.",
  "The quest isn't over. Try again and collect a few more cans!",
  "Almost there! Play another round and beat your score.",
  "Keep going! You can reach 20 cans next time."
];

// Get the HTML elements JavaScript will update
const grid = document.querySelector(".game-grid");
const scoreDisplay = document.getElementById("current-cans");
const timerDisplay = document.getElementById("timer");
const achievements = document.getElementById("achievements");
const startButton = document.getElementById("start-game");
const resetButton = document.getElementById("reset-game");
const confettiContainer = document.getElementById("confetti");

// Create the nine clickable cells
function createGrid() {
  grid.innerHTML = "";

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");

    cell.className = "grid-cell";
    cell.setAttribute("role", "button");
    cell.setAttribute("tabindex", "0");
    cell.setAttribute("aria-label", `Empty tile ${i + 1}`);

    cell.addEventListener("click", () => handleCellClick(cell));

    // Let keyboard users activate a tile with Enter or Space
    cell.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleCellClick(cell);
      }
    });

    grid.appendChild(cell);
  }
}

// Update the score and timer shown on the page
function updateScore() {
  scoreDisplay.textContent = currentCans;
}

function updateTimer() {
  timerDisplay.textContent = timeLeft;
}

// Place a can in a randomly selected tile
function spawnWaterCan() {
  if (!gameActive) return;

  // Deduct a point if the previous can was missed
  if (currentCell) {
    applyPenalty("Missed can!");
  }

  const cells = document.querySelectorAll(".grid-cell");

  // Clear the previous can and reset tile labels
  cells.forEach(cell => {
    cell.innerHTML = "";
    cell.setAttribute("aria-label", "Empty tile");
  });

  // Choose a random tile
  const randomIndex = Math.floor(Math.random() * cells.length);
  currentCell = cells[randomIndex];

  currentCell.setAttribute(
    "aria-label",
    "Jerry can. Activate to collect one point."
  );

  // Add the can elements styled by the CSS
  currentCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="water-can"></div>
    </div>
  `;
}

// Handle a click or keyboard activation on a tile
function handleCellClick(cell) {
  if (!gameActive) return;

  const canIsInThisCell = cell.querySelector(".water-can");

  if (canIsInThisCell) {
    currentCans += 1;
    currentCell = null;

    cell.innerHTML = "";
    cell.setAttribute("aria-label", "Empty tile");

    updateScore();

    if (currentCans >= GOAL_CANS) {
      achievements.textContent =
        "You reached 20 cans! Keep playing until time runs out.";
    } else {
      achievements.textContent = "Can collected! Find the next one.";
    }
  } else {
    applyPenalty("Empty tile!");
  }
}

// Subtract one point without letting the score go below zero
function applyPenalty(message) {
  currentCans = Math.max(0, currentCans - MISS_PENALTY);

  updateScore();
  achievements.textContent = `${message} One point deducted.`;
}

// Start a new round
function startGame() {
  if (gameActive) return;

  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  clearTimeout(confettiTimeout);

  confettiContainer.innerHTML = "";

  currentCans = 0;
  timeLeft = ROUND_LENGTH;
  currentCell = null;

  createGrid();
  updateScore();
  updateTimer();

  gameActive = true;
  startButton.disabled = true;
  startButton.textContent = "Game in progress...";
  resetButton.hidden = false;
  achievements.textContent = "Go! Tap the yellow cans!";

  // Show the first can immediately, then keep spawning cans
  spawnWaterCan();
  spawnInterval = setInterval(spawnWaterCan, SPAWN_DELAY);

  // Count down once per second
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    updateTimer();

    if (timeLeft <= 0) {
      timeLeft = 0;
      updateTimer();
      endGame();
    }
  }, 1000);
}

// End the round and show a random result message
function endGame() {
  if (!gameActive) return;

  gameActive = false;
  currentCell = null;

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  // Remove any can still on the board
  document.querySelectorAll(".grid-cell").forEach(cell => {
    cell.innerHTML = "";
    cell.setAttribute("aria-label", "Game over");
  });

  const won = currentCans >= GOAL_CANS;
  const messages = won ? winningMessages : losingMessages;
  const randomIndex = Math.floor(Math.random() * messages.length);

  achievements.textContent = messages[randomIndex];

  startButton.disabled = false;
  startButton.textContent = won ? "Play Again" : "Try Again";
  resetButton.hidden = true;

  if (won) {
    celebrateWin();
  }
}

// Reset the score, timer, and board
function resetGame() {
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  clearTimeout(confettiTimeout);

  gameActive = false;
  currentCans = 0;
  timeLeft = ROUND_LENGTH;
  currentCell = null;

  createGrid();
  updateScore();
  updateTimer();

  achievements.textContent = "Press Start Game when you're ready.";
  startButton.disabled = false;
  startButton.textContent = "Start Game";
  resetButton.hidden = true;

  confettiContainer.innerHTML = "";
}

// Show confetti after a win
function celebrateWin() {
  const colors = ["#FFC907", "#2E9DF7", "#8BD1CB", "#4FCB53", "#FF902A"];

  confettiContainer.innerHTML = "";

  for (let i = 0; i < 50; i++) {
    const piece = document.createElement("div");

    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.5}s`;

    confettiContainer.appendChild(piece);
  }

  confettiTimeout = setTimeout(() => {
    confettiContainer.innerHTML = "";
  }, 3000);
}

// Connect the buttons to their functions
startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);

// Set up the page when it first loads
createGrid();
updateScore();
updateTimer();
resetButton.hidden = true;