// rain.js

// List of all images you want to rain
const RAIN_IMAGES = [
    "./assets/art/cleanPlate.png",
    "./assets/art/dirtyPlate.png",
    "./assets/art/cleanBowl.png",
    "./assets/art/dirtyBowl.png",
    "./assets/art/cleanCup.png",
    "./assets/art/dirtyCup.png"
  ];
  
  // How often (ms) to create a new falling image
  const SPAWN_INTERVAL = 700;
  
  // How wide/tall each raindrop is (should match .rain-drop CSS)
  const DROP_SIZE = 50;
  
  // We’ll store our interval ID here so we can stop the rain if needed
  let spawnIntervalId = null;
  
  /**
   * Spawns a single falling image (“raindrop”) at a random X,
   * avoiding initial overlap with the main menu buttons.
   */
  function spawnRainDrop() {
    const mainMenu = document.getElementById("mainMenu");
    const rainContainer = document.getElementById("rainContainer");
  
    // If either is missing, just bail
    if (!mainMenu || !rainContainer) return;
  
    // Gather bounding boxes for each .menu-button
    const buttons = mainMenu.querySelectorAll(".menu-button");
    const buttonRects = Array.from(buttons).map(btn => btn.getBoundingClientRect());
  
    // Pick a random dish image
    const img = document.createElement("img");
    img.src = RAIN_IMAGES[Math.floor(Math.random() * RAIN_IMAGES.length)];
    img.classList.add("rain-drop");
  
    // Attempt to find a random X that doesn't overlap any main-menu button
    const screenWidth = window.innerWidth;
    let x, safeToPlace;
    let tries = 0;
    const maxTries = 50; // Avoid infinite loops
  
    do {
      x = Math.random() * (screenWidth - DROP_SIZE);
      safeToPlace = true;
  
      // The raindrop starts above the screen (top: -DROP_SIZE)
      const dropRect = {
        left: x,
        right: x + DROP_SIZE,
        top: -DROP_SIZE,
        bottom: 0
      };
  
      // Check if this new raindrop intersects with any button
      for (const rect of buttonRects) {
        const overlapX = dropRect.left < rect.right && dropRect.right > rect.left;
        const overlapY = dropRect.top < rect.bottom && dropRect.bottom > rect.top;
        if (overlapX && overlapY) {
          safeToPlace = false;
          break;
        }
      }
      tries++;
    } while (!safeToPlace && tries < maxTries);
  
    // Position the raindrop
    img.style.left = x + "px";
    img.style.top = -DROP_SIZE + "px";
  
    // Give each raindrop a slightly random fall duration
    const fallDuration = (5 + Math.random() * 3).toFixed(2); // between ~5s–8s
    img.style.animationDuration = `${fallDuration}s`;
  
    // When animation ends (fall is done), remove the image
    img.addEventListener("animationend", () => {
      img.remove();
    });
  
    // Finally, add it to #rainContainer
    rainContainer.appendChild(img);
  }
  
  /**
   * Starts the repeating rain process.
   * (Call this once, for example, when the page is loaded.)
   */
  export function startRain() {
    // Only start if not already running
    if (!spawnIntervalId) {
      spawnIntervalId = setInterval(spawnRainDrop, SPAWN_INTERVAL);
    }
  }
  
  /**
   * Stops the rain by clearing the interval.
   */
  export function stopRain() {
    if (spawnIntervalId) {
      clearInterval(spawnIntervalId);
      spawnIntervalId = null;
    }
  }
  
