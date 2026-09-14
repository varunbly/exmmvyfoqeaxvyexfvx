function moveToPosition(element, targetX, targetY, duration = 1000) {
  const computed = window.getComputedStyle(element);
  const startX = parseFloat(computed.left) || 0;
  const startY = parseFloat(computed.top) || 0;
  const deltaX = targetX - startX;
  const deltaY = targetY - startY;
  const startTime = performance.now();

  function animate(time) {
    const elapsed = Math.min((time - startTime) / duration, 1);
    const progress = elapsed * elapsed * elapsed; // easeInCubic

    element.style.left = startX + deltaX * progress + "px";
    element.style.top = startY + deltaY * progress + "px";

    if (elapsed < 1) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

function moveUntilOffscreen(element, dirX, dirY, speed = 5) {
  function step() {
    const computed = window.getComputedStyle(element);
    const currentX = parseFloat(computed.left) || 0;
    const currentY = parseFloat(computed.top) || 0;

    element.style.left = currentX + dirX * speed + "px";
    element.style.top = currentY + dirY * speed + "px";

    if (
      currentX < -100 || currentX > window.innerWidth + 100 ||
      currentY < -100 || currentY > window.innerHeight + 100
    ) {
      element.remove();
      return;
    }

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
