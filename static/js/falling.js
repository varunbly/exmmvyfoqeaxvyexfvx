const wordsLis = [
  "ILLUSION", "REALITY", "BELIEVE", "NOTHING",
  "TRUTH", "LIES", "DECEPTION", "CHAOS",
  "CONTROL", "FREEDOM", "KILL", "MURDER", "BUTCHER", "TRAPPED", "TRICKED"
];

let rainInterval = null; // store the interval ID

/**
 * Spawns a single random word falling from top to bottom
 */
function spawnRandomWord(words = wordsLis) {
  const container = document.getElementById("falling-words-container");

  // Create the word element
  const word = document.createElement("div");
  word.classList.add("falling-word");

  // Pick a random word
  word.textContent = words[Math.floor(Math.random() * words.length)];

  // Random horizontal position
  const screenWidth = window.innerWidth;
  const randomX = Math.random() * (screenWidth - 100); 
  word.style.left = `${randomX}px`;

  // Random speed for natural variation (between 3s and 6s)
  const fallDuration = (Math.random() * 1 + 0.5).toFixed(2);
  word.style.animationDuration = `${fallDuration}s`;

  // Append to container
  container.appendChild(word);

  // Clean up after animation ends
  setTimeout(() => {
    container.removeChild(word);
  }, fallDuration * 2000);
}

  /**
 * Start the rain
 */
function startRain(words = wordsLis) {
  if (!rainInterval) { // prevent multiple intervals
    rainInterval = setInterval(() => spawnRandomWord(words), 100); // spawn every 0.5s
  }
}

/**
 * Stop the rain
 */
function stopRain() {
  clearInterval(rainInterval);
  rainInterval = null;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startBtn").addEventListener("click", startRain);
  document.getElementById("stopBtn").addEventListener("click", stopRain);
});

