let dynamicImg = document.getElementById("dynamicImg");
let staticImg = document.getElementById("staticImg");
let gameContainer = document.getElementById("gameContainer");
let correctEl = document.getElementById("correctCount");
let wrongEl = document.getElementById("wrongCount");
let highScoreEl = document.getElementById("highScore");
let livesEl = document.getElementById("lives");
let timerDisplay = document.getElementById("timerDisplay");
let statusMsg = document.getElementById("statusMsg");
let btn = document.getElementById("btn");
let speedSelect = document.getElementById("speedSelect");

const dynamicImages = [
  "./img/cat1.jpeg",
  "./img/dogOne.jpeg",
  "./img/dogTwo.jpeg",
  "./img/monkey1.jpeg",
  "./img/monkey2.jpeg",
];

// 1. Web Audio API Sound Generator
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, delay = 0) {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);

  gain.gain.setValueAtTime(0.2, audioCtx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + delay + duration,
  );

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(audioCtx.currentTime + delay);
  osc.stop(audioCtx.currentTime + delay + duration);
}

function playCorrectSound() {
  playTone(523.25, "sine", 0.15, 0);
  playTone(659.25, "sine", 0.25, 0.12);
}

function playWrongSound() {
  playTone(180, "sawtooth", 0.25, 0);
  playTone(140, "sawtooth", 0.3, 0.15);
}

function playGameOverSound() {
  playTone(300, "triangle", 0.2, 0);
  playTone(250, "triangle", 0.2, 0.2);
  playTone(200, "triangle", 0.4, 0.4);
}

// 2. Game State & Timer Variables
let speed = 150;
let currentImage = "";
let targetImage = "";
let correctScore = 0;
let wrongScore = 0;
const maxMistakes = 3;
let isGameOver = false;

const roundDuration = 5.0; // Seconds per round
let timeLeft = roundDuration;
let countdownTimer = null;

let highScore = Number(localStorage.getItem("photoRandomizerHighScore")) || 0;
highScoreEl.innerText = highScore;

function setNewTarget() {
  let randomIndex = Math.floor(Math.random() * dynamicImages.length);
  targetImage = dynamicImages[randomIndex];
  staticImg.style.backgroundImage = `url('${targetImage}')`;
}

function changeImage() {
  let randomIndex = Math.floor(Math.random() * dynamicImages.length);
  currentImage = dynamicImages[randomIndex];
  dynamicImg.style.backgroundImage = `url('${currentImage}')`;
}

// 3. Round Countdown Logic
function startRoundTimer() {
  clearInterval(countdownTimer);
  timeLeft = roundDuration;
  timerDisplay.innerText = timeLeft.toFixed(1);
  timerDisplay.parentElement.style.color = "blueviolet";

  countdownTimer = setInterval(() => {
    timeLeft -= 0.1;
    if (timeLeft <= 1.5) {
      timerDisplay.parentElement.style.color = "red";
    }

    if (timeLeft <= 0) {
      timerDisplay.innerText = "0.0";
      handleMistake("Time's up!");
    } else {
      timerDisplay.innerText = timeLeft.toFixed(1);
    }
  }, 100);
}

// Initialize Game
setNewTarget();
let theTimer = setInterval(changeImage, speed);
startRoundTimer();

function changeSpeed() {
  if (isGameOver) return;
  speed = Number(speedSelect.value);
  clearInterval(theTimer);
  theTimer = setInterval(changeImage, speed);
}

// 4. Handle Mistake or Timeout
function handleMistake(message) {
  clearInterval(theTimer);
  clearInterval(countdownTimer);
  btn.disabled = true;
  btn.style.opacity = "0.5";

  gameContainer.classList.add("flash-wrong");

  wrongScore++;
  wrongEl.innerText = wrongScore;
  livesEl.innerText = maxMistakes - wrongScore;

  if (wrongScore >= maxMistakes) {
    isGameOver = true;
    statusMsg.style.color = "red";
    statusMsg.innerText = "Game Over!";
    playGameOverSound();

    btn.disabled = false;
    btn.style.opacity = "1";
    btn.innerText = "Play Again";
  } else {
    statusMsg.style.color = "red";
    statusMsg.innerText = message;
    playWrongSound();
    startNextRound();
  }
}

const stopGame = () => {
  if (isGameOver) {
    resetGame();
    return;
  }

  clearInterval(theTimer);
  clearInterval(countdownTimer);
  btn.disabled = true;
  btn.style.opacity = "0.5";

  if (currentImage === targetImage) {
    gameContainer.classList.add("flash-correct");
    correctScore++;
    correctEl.innerText = correctScore;
    statusMsg.style.color = "green";
    statusMsg.innerText = "Match!";
    playCorrectSound();

    if (correctScore > highScore) {
      highScore = correctScore;
      highScoreEl.innerText = highScore;
      localStorage.setItem("photoRandomizerHighScore", highScore);
    }

    startNextRound();
  } else {
    handleMistake("Wrong match! Try again.");
  }
};

function startNextRound() {
  setTimeout(() => {
    if (!isGameOver) {
      gameContainer.classList.remove("flash-correct", "flash-wrong");
      statusMsg.innerText = "";
      btn.disabled = false;
      btn.style.opacity = "1";
      setNewTarget();
      theTimer = setInterval(changeImage, speed);
      startRoundTimer();
    }
  }, 1200);
}

function resetGame() {
  correctScore = 0;
  wrongScore = 0;
  isGameOver = false;

  gameContainer.classList.remove("flash-correct", "flash-wrong");
  correctEl.innerText = "0";
  wrongEl.innerText = "0";
  livesEl.innerText = maxMistakes;
  statusMsg.innerText = "";
  btn.innerText = "Stop";

  setNewTarget();
  speed = Number(speedSelect.value);
  theTimer = setInterval(changeImage, speed);
  startRoundTimer();
}

// 5. Spacebar Keyboard Control
document.addEventListener("keydown", event => {
  if (event.code === "Space") {
    event.preventDefault();
    if (!btn.disabled) {
      stopGame();
    }
  }
});
