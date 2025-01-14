// js/rain.js
export const RAIN_IMAGES = [
    "./assets/art/cleanPlate.png",
    "./assets/art/dirtyPlate.png",
    "./assets/art/cleanBowl.png",
    "./assets/art/dirtyBowl.png",
    "./assets/art/cleanCup.png",
    "./assets/art/dirtyCup.png"
];

export const SPAWN_INTERVAL = 700;
export const DROP_SIZE = 50;
let spawnIntervalId = null;

function spawnRainDrop() {
    const mainMenu = document.getElementById("mainMenu");
    const rainContainer = document.getElementById("rainContainer");

    // Only spawn if main menu is visible
    if (!mainMenu || !rainContainer || mainMenu.style.display === 'none') {
        stopRain();
        return;
    }

    const buttons = mainMenu.querySelectorAll(".menu-button");
    const buttonRects = Array.from(buttons).map(btn => btn.getBoundingClientRect());

    const img = document.createElement("img");
    img.src = RAIN_IMAGES[Math.floor(Math.random() * RAIN_IMAGES.length)];
    img.classList.add("rain-drop");

    const screenWidth = window.innerWidth;
    let x, safeToPlace;
    let tries = 0;
    const maxTries = 50;

    do {
        x = Math.random() * (screenWidth - DROP_SIZE);
        safeToPlace = true;

        const dropRect = {
            left: x,
            right: x + DROP_SIZE,
            top: -DROP_SIZE,
            bottom: 0
        };

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

    img.style.left = x + "px";
    img.style.top = -DROP_SIZE + "px";

    const fallDuration = (5 + Math.random() * 3).toFixed(2);
    img.style.animationDuration = `${fallDuration}s`;

    img.addEventListener("animationend", () => {
        img.remove();
    });

    rainContainer.appendChild(img);
}

export function startRain() {
    if (!spawnIntervalId) {
        // Clear any existing drops
        const rainContainer = document.getElementById("rainContainer");
        if (rainContainer) {
            rainContainer.innerHTML = '';
        }
        spawnIntervalId = setInterval(spawnRainDrop, SPAWN_INTERVAL);
    }
}

export function stopRain() {
    if (spawnIntervalId) {
        clearInterval(spawnIntervalId);
        spawnIntervalId = null;
        
        // Clear existing drops
        const rainContainer = document.getElementById("rainContainer");
        if (rainContainer) {
            rainContainer.innerHTML = '';
        }
    }
}
