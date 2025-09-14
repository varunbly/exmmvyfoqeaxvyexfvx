
function randomGlitchSwap(glitchElement, chars, originalText, currentText) {
    console.log('here')
  const index = Math.floor(Math.random() * currentText.length);
  const originalChar = originalText[index]; // original character for this position
  const randomChar = chars[Math.floor(Math.random() * chars.length)];

  // If it's already glitched, do nothing
  if (currentText[index] !== originalChar) return;

  // Replace one character with a random one
  currentText[index] = randomChar;
  glitchElement.textContent = currentText.join("");

  // Restore this single character after a delay
  setTimeout(() => {
    currentText[index] = originalChar;
    glitchElement.textContent = currentText.join("");
  }, 600); // restore after 150ms
}
