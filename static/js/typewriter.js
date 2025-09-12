const speed = 5; // milliseconds per character
  const elements = document.querySelectorAll(".typewriter");
  const lineDelay = 100;

  function typeEffect(el, html, callback) {
    let i = 0;
    let current = "";

    function typing() {
      if (i < html.length) {
        // If the next character starts an HTML tag, insert the whole tag at once
        if (html[i] === "<") {
          const end = html.indexOf(">", i); // find where the tag ends
          current += html.slice(i, end + 1); // add the full tag
          i = end + 1;
        } else {
          current += html[i];
          i++;
        }

        el.innerHTML = current;
        setTimeout(typing, speed);
      } else if (callback) {
        setTimeout(callback, lineDelay); // small delay before next
      }
    }

    typing();
  }

  function startTyping(index = 0) {
    if (index < elements.length) {
      const el = elements[index];
      const html = el.innerHTML; // keep HTML, including <br>
      el.innerHTML = ""; // clear it first
      el.classList.add('visible');
      typeEffect(el, html, () => startTyping(index + 1));
    }
  }

  startTyping();