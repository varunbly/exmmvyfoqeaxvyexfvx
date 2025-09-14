 const words = [
      "ILLUSION", "REALITY", "BELIEVE", "NOTHING", "TRUTH", "LIES",
      "CHAOS", "CONTROL", "FREEDOM", "MURDER", "TRAPPED", "TRICKED",
      "UNKNOWN", "DREAM", "FAITH", "HOPE", "FEAR", "POWER", "PAIN"
    ];

    const fonts = [
      "Arial, sans-serif",
      "'Courier New', monospace",
      "'Times New Roman', serif",
      "Verdana, sans-serif",
      "'Lucida Console', monospace",
      "'Comic Sans MS', cursive",
      "'Georgia', serif"
    ];
    const placedWords = []; // store positions of placed words

    function getRandomWord(){
      return words[Math.floor(Math.random() * words.length)];
    }

    /**
     * Check if a new position is too close to an existing word
     */
    function isTooClose(x, y, minDistance = 50) {
      for (let word of placedWords) {
        const dx = word.x - x;
        const dy = word.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance) {
          return true; // too close
        }
      }
      return false; // okay to place
    }

    async function createWordWithinBounds(text, opts = {}) {
      const padding = opts.padding ?? 1; // keep some spacing from edges
      const container = opts.container ?? document.body;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // create element with final styling (font-size, family, rotation, color, etc.)
      const word = document.createElement('div');
      word.className = 'random-word';
      word.textContent = text;

      // Example random styling (change to your own logic)
      const fontSize = Math.floor(Math.random() * 6) + 2.3;
      word.style.fontSize = fontSize + 'vh';
      word.style.fontFamily = opts.fonts?.[Math.floor(Math.random() * (opts.fonts?.length || 1))] || 'system-ui, sans-serif';
      word.style.color = opts.color || `hsl(${Math.random()*360} 80% 70%)`;
      const rotation = (Math.random() * 60 - 30); // -30..30 deg
      const savedTransform = `rotate(${rotation}deg)`;

      // Temporarily remove transforms and hide while measuring
      // word.style.transform = 'none';
      word.style.visibility = 'hidden';

      // word.addEventListener("mouseenter", () => {
      //   word.classList.add("hovered");
      // });
      // word.addEventListener("mouseleave", () => {
      //   word.classList.remove("hovered");
      // });

      container.appendChild(word);

      // wait for custom fonts to load (if available) so measurement is accurate
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // measure the element size (untransformed)
      const rect = word.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // compute max positions such that element fully fits inside viewport/container
      // if placing inside some other container, use container.getBoundingClientRect() instead
      const maxX = Math.max(0, vw - width - padding);
      const maxY = Math.max(0, vh - height - padding);
      let attempts = 0;
      let x, y;
      const minDistance = (fontSize*window.innerWidth*2)/100;

      // pick a random position (guaranteed non-negative)
      do {
        x = Math.random() * maxX;
        y = Math.random() * maxY;

        // set position and restore transform
        word.style.left = `${x}px`;
        word.style.top = `${y}px`;
        word.style.visibility = 'visible';
        word.style.transform = savedTransform;

        // Now re-check bounding box (with transform) and nudge if it overflows
        const b = word.getBoundingClientRect();
        let dx = 0, dy = 0;
        if (b.right > vw - padding) dx = (vw - padding) - b.right;
        if (b.left < padding) dx = Math.max(dx, padding - b.left);
        if (b.bottom > vh - padding) dy = (vh - padding) - b.bottom;
        if (b.top < padding) dy = Math.max(dy, padding - b.top);

        if (dx !== 0 || dy !== 0) {
          // apply nudge and clamp to safe area (use measured untransformed width/height for clamping)
          x = Math.min(Math.max(0, x + dx), Math.max(0, vw - width - padding));
          y = Math.min(Math.max(0, y + dy), Math.max(0, vh - height - padding));
          word.style.left = `${x}px`;
          word.style.top = `${y}px`;
        }
        attempts++
      } while (isTooClose(x, y, minDistance) && attempts < 600)
      console.log(attempts)
      placedWords.push({ x, y });
      return word;
    }

    async function createRandomWord() {
      const text = words[Math.floor(Math.random() * words.length)];
      word = createWordWithinBounds(text, {
        fonts: fonts
      })
    }

    /**
     * Fill the screen with random words
     */
    async function generateRandomWords(count = 20) {
      for (let i = 0; i < count; i++) {
        await createRandomWord();
      }
    }

    // document.addEventListener("DOMContentLoaded", () => {
    //   generateRandomWords(40); // adjust number of words here
    // });
  