
   function moveElementWithDecision(id, targetX, targetY, duration, keepGoing = false, yesFn = (()=>{}), noFn = (()=>{})){
    element = document.getElementById(id);
    console.log(window.getComputedStyle(element).height)
    style = window.getComputedStyle(element)
    
  const startX = parseFloat(style.left) ;
  const startY = parseFloat(style.top) ;
  const deltaX = targetX - startX;
  const deltaY = targetY - startY;

  const startTime = performance.now();

  // Easing function for natural acceleration/deceleration
    function easeInCubic(t) {
    return t * t * t;
    }

    function easeInCubicDerivative(t) {
  return 3 * t * t;
}

  function animate(time) {
    let elapsed = (time - startTime) / duration;
    if (elapsed > 1) elapsed = 1;

    const progress = easeInCubic(elapsed);

    element.style.left = startX + deltaX * progress + "px";
    element.style.top = startY + deltaY * progress + "px";

    if (elapsed < 1) {
      requestAnimationFrame(animate);
    } else {
      // Reached target point
      if (keepGoing) {
        yesFn();
      } else {
        // Stop and remove immediately
        noFn();
      }
    }
  }

  requestAnimationFrame(animate);
}

function keepMovingOffScreen(element, dirX, dirY, speed = 5) {
     // pixels per frame
  const step = () => {
    let currentX = parseFloat(element.style.left);
    let currentY = parseFloat(element.style.top);

    element.style.left = currentX + Math.sign(dirX) * speed + "px";
    element.style.top = currentY + Math.sign(dirY) * speed + "px";

    // Get screen bounds
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // If completely off screen, remove it
    if (
      currentX < -50 || currentX > screenWidth + 50 ||
      currentY < -50 || currentY > screenHeight + 50
    ) {
      element.remove();
      return;
    }

    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}
