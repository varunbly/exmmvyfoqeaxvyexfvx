function startBlink(){
  const elems = document.querySelectorAll('.slow-blink');

  elems.forEach(el => {
    // --- Config ---
    let duration = 2.0;       // seconds (slowest blink)
    const minDur = 0.4;       // fastest blink
    const maxDur = 2.0;       // slowest blink
    const rate = 0.5;         // how quickly speed changes

    // --- State ---
    let isHolding = false;
    let isStopped = false;
    let alreadyStoppedDispatched = false; // NEW: prevent repeated event firing
    let lastTime = null;
    let rafId = null;

    // --- Helpers ---
    function apply() {
      el.style.setProperty('--blink-duration', duration.toFixed(2) + 's');

      if (isStopped) {
        el.classList.remove('anim');
        el.classList.add('stable');
        el.style.opacity = '1'; // visible when frozen
      } else {
        el.style.opacity = '';
        if (!el.classList.contains('anim')) {
          el.classList.add('anim');
        }
      }
    }

    function dispatchStopped() {
      if (!alreadyStoppedDispatched) {
        alreadyStoppedDispatched = true;
        const ev = new CustomEvent('blinkStopped', { detail: { element: el } });
        document.dispatchEvent(ev);
        console.log('Dispatched blinkStopped ONCE for:', el.textContent);
      }
    }

    // --- Main loop ---
    function loop(now) {
      if (!lastTime) lastTime = now;
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isHolding) {
        if (isStopped) {
          // If it was stopped earlier and user still holding, do nothing
        } else {
          duration -= delta * rate;
          if (duration <= minDur) {
            duration = minDur;
            isStopped = true;
            apply();
            dispatchStopped();
          } else {
            apply();
          }
        }
      } else {
        // When not holding, return to slow blink
        if (!isStopped) {
          duration += delta * rate;
          if (duration > maxDur) duration = maxDur;
          apply();
        }
      }

      rafId = requestAnimationFrame(loop);
    }

    // --- Event Handlers ---
    function resetTimer() {
      lastTime = null;
    }

    el.addEventListener('mousedown', (e) => {
      isHolding = true;
    //   isStopped = false;
    //   alreadyStoppedDispatched = false; // reset for new hold
      resetTimer();
      e.preventDefault();
    });

    document.addEventListener('mouseup', () => {
      if (isHolding) {
        isHolding = false;
        resetTimer();
      }
    });

    el.addEventListener('mouseleave', () => {
      if (isHolding) {
        isHolding = false;
        resetTimer();
      }
    });

    // --- Touch Events ---
    el.addEventListener('touchstart', (e) => {
      isHolding = true;
    //   isStopped = false;
    //   alreadyStoppedDispatched = false; // reset for new hold
      resetTimer();
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchend', () => {
      if (isHolding) {
        isHolding = false;
        resetTimer();
      }
    });

    // Listen for the custom event
    // document.addEventListener('blinkStopped', (ev) => {
    //   console.log("Custom event caught for:", ev.detail.element.textContent);
    //     ev.detail.element.style.pointerEvent = 'none'
    // });

    // Start
    apply();
    rafId = requestAnimationFrame(loop);

    // Cleanup
    window.addEventListener('beforeunload', () => {
      if (rafId) cancelAnimationFrame(rafId);
    });
  });
};