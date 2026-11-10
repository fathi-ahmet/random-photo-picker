let dynamicImg = document.getElementById("dynamicImg");
let staticImg = document.getElementById("staticImg");
let sax = document.getElementById("saxday");
let qalad = document.getElementById("Qalad");
let highScoreEl = document.getElementById("highScore");
let livesEl = document.getElementById("lives");
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

// 2. Game State & Target Image Variables
let speed = 150;
let currentImage = "";
let targetImage = "";
let saxday = 0;
let qaladay = 0;
const maxMistakes = 3;
let isGameOver = false;

let highScore = Number(localStorage.getItem("photoRandomizerHighScore")) || 0;
highScoreEl.innerText = highScore;

// Pick a random target image for the right side
function setNewTarget() {
  let randomIndex = Math.floor(Math.random() * dynamicImages.length);
  targetImage = dynamicImages[randomIndex];
  staticImg.style.backgroundImage = `url('${targetImage}')`;
}

// Cycle random images on the left side
function changeImage() {
  let randomIndex = Math.floor(Math.random() * dynamicImages.length);
  currentImage = dynamicImages[randomIndex];
  dynamicImg.style.backgroundImage = `url('${currentImage}')`;
}

// Initialize the first target and start the timer
setNewTarget();
let theTimer = setInterval(changeImage, speed);

function changeSpeed() {
  if (isGameOver) return;
  speed = Number(speedSelect.value);
  clearInterval(theTimer);
  theTimer = setInterval(changeImage, speed);
}

const istaag = () => {
  if (isGameOver) {
    resetGame();
    return;
  }

  clearInterval(theTimer);
  btn.disabled = true;
  btn.style.opacity = "0.5";

  // Compare the stopped image against the current random target image
  if (currentImage === targetImage) {
    saxday++;
    sax.innerText = saxday;
    statusMsg.style.color = "green";
    statusMsg.innerText = "Waa sax! (Match!)";
    playCorrectSound();

    if (saxday > highScore) {
      highScore = saxday;
      highScoreEl.innerText = highScore;
      localStorage.setItem("photoRandomizerHighScore", highScore);
    }

    markaleBilow();
  } else {
    qaladay++;
    qalad.innerText = qaladay;
    livesEl.innerText = maxMistakes - qaladay;

    if (qaladay >= maxMistakes) {
      isGameOver = true;
      statusMsg.style.color = "red";
      statusMsg.innerText = "Ciyaartu way dhammaatay! (Game Over)";
      playGameOverSound();

      btn.disabled = false;
      btn.style.opacity = "1";
      btn.innerText = "Ciyaar Mar Kale (Play Again)";
    } else {
      statusMsg.style.color = "red";
      statusMsg.innerText = "Waa qalad! Isku day mar kale.";
      playWrongSound();
      markaleBilow();
    }
  }
};

function markaleBilow() {
  setTimeout(() => {
    if (!isGameOver) {
      statusMsg.innerText = "";
      btn.disabled = false;
      btn.style.opacity = "1";
      setNewTarget(); // Pick a new target image for the next round
      theTimer = setInterval(changeImage, speed);
    }
  }, 1200);
}

function resetGame() {
  saxday = 0;
  qaladay = 0;
  isGameOver = false;

  sax.innerText = "0";
  qalad.innerText = "0";
  livesEl.innerText = maxMistakes;
  statusMsg.innerText = "";
  btn.innerText = "Ku istaag";

  setNewTarget();
  speed = Number(speedSelect.value);
  theTimer = setInterval(changeImage, speed);
}

// 3. Spacebar Keyboard Control
document.addEventListener("keydown", event => {
  if (event.code === "Space") {
    event.preventDefault(); // Stops page scrolling or double-clicking focused buttons
    if (!btn.disabled) {
      istaag();
    }
  }
});
