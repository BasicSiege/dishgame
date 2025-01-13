/* ui.js
   Handles UI and bridging calls to Game
*/
import { Game } from './game.js';
import { stopRain } from './rain.js';

export const UI = {
  initialize(GameInstance) {
    this.Game = GameInstance;
    GameInstance.init();

    // Fullscreen button
    const fsBtn = document.getElementById('fullscreenBtn');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        GameInstance.toggleFullscreen();
      });
    }
  },

  startGame() {
    // Stop raining when the user presses "Play"
    stopRain();

    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    document.getElementById('inGameMenu').style.display = 'block';
    document.getElementById('mobileControls').style.display = 'flex';

    Game.startGame();
  },

  pauseGame() {
    Game.pauseGame();
  },

  resumeGame() {
    Game.resumeGame();
  },

  returnToMainMenu() {
    Game.returnToMainMenu();
  },

  openShop() {
    // Removed auto-pause
    // if (Game.gameStarted && !Game.gamePaused) Game.pauseGame();
    this.openModal('shopModal');
    Game.updateShopButtons();
  },

  openSettings() {
    if (Game.gameStarted && !Game.gamePaused) Game.pauseGame();
    this.openModal('settingsModal');
  },

  openHelp() {
    if (Game.gameStarted && !Game.gamePaused) Game.pauseGame();
    this.openModal('helpModal');
  },

  openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
  },

  closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';

    // If you do NOT want the pause overlay to show automatically,
    // you can remove or comment out this "resume" logic below:
    if (
      Game.gameStarted &&
      Game.gamePaused &&
      document.getElementById('pauseOverlay').style.display !== 'flex'
    ) {
      Game.resumeGame();
    }
  }
};

// Volume Sliders
window.addEventListener('load', () => {
  const bgmRange = document.getElementById('bgmVolume');
  const sfxRange = document.getElementById('sfxVolume');
  if (bgmRange) {
    bgmRange.addEventListener('input', (e) => {
      Game.bgmVolume = e.target.value;
      Game.updateBGMVolume();
    });
  }
  if (sfxRange) {
    sfxRange.addEventListener('input', (e) => {
      Game.sfxVolume = e.target.value;
      // If you have SFX logic, handle it here
    });
  }
});
