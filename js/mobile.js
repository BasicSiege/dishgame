// mobile.js
export function setupMobileControls(Game) {
    // Joystick logic
    const joystickContainer = document.getElementById('joystickContainer');
    const joystickHandle = document.getElementById('joystickHandle');
    let joystickActive = false;
    let joystickStartX = 0;
    let joystickStartY = 0;
  
    joystickContainer.addEventListener('touchstart', (e) => {
      e.preventDefault();
      joystickActive = true;
      const touch = e.changedTouches[0];
      joystickStartX = touch.pageX;
      joystickStartY = touch.pageY;
    }, { passive: false });
  
    joystickContainer.addEventListener('touchmove', (e) => {
      if (!joystickActive) return;
      e.preventDefault();
  
      const touch = e.changedTouches[0];
      const dx = touch.pageX - joystickStartX;
      const dy = touch.pageY - joystickStartY;
      const radius = 60;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
  
      const clampedDist = Math.min(dist, radius);
      const handleX = radius + clampedDist * Math.cos(angle);
      const handleY = radius + clampedDist * Math.sin(angle);
  
      joystickHandle.style.left = (handleX - 20) + 'px';
      joystickHandle.style.top = (handleY - 20) + 'px';
  
      const deadZone = 10;
      if (dist > deadZone) {
        Game.inputKeys.up    = (Math.abs(dy) > Math.abs(dx) && dy < 0);
        Game.inputKeys.down  = (Math.abs(dy) > Math.abs(dx) && dy > 0);
        Game.inputKeys.left  = (Math.abs(dx) > Math.abs(dy) && dx < 0);
        Game.inputKeys.right = (Math.abs(dx) > Math.abs(dy) && dx > 0);
      } else {
        Game.inputKeys.up    = false;
        Game.inputKeys.down  = false;
        Game.inputKeys.left  = false;
        Game.inputKeys.right = false;
      }
    }, { passive: false });
  
    joystickContainer.addEventListener('touchend', () => {
      joystickActive = false;
      joystickHandle.style.left = 'calc(50% - 20px)';
      joystickHandle.style.top = 'calc(50% - 20px)';
      Game.inputKeys.up    = false;
      Game.inputKeys.down  = false;
      Game.inputKeys.left  = false;
      Game.inputKeys.right = false;
    });
  
    // Interact Button
    const interactButton = document.getElementById('interactButton');
    interactButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      Game.inputKeys.e = true;
      if (!Game.player.isWashing) {
        Game.handleInteraction();
      }
    });
    interactButton.addEventListener('touchend', () => {
      Game.inputKeys.e = false;
      Game.player.isWashing = false;
    });
  }
  