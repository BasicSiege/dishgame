/* ui.js
   Handles UI events, modals, and bridging calls to Game
*/
import { Game } from './game.js';

export const UI = {
  initialize(GameInstance) {
    // Reference the main Game object, if needed
    this.Game = GameInstance;
    GameInstance.init();
  },

  // Called via the "Play" button
  startGame() {
    // Hide main menu, show game container
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    document.getElementById('inGameMenu').style.display = 'block';
    document.getElementById('mobileControls').style.display = 'flex';

    // Start the game logic
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

  // Modals
  openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
  },

  closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
    // If we are paused and close a modal, possibly resume
    if (Game.gameStarted && Game.gamePaused &&
        document.getElementById('pauseOverlay').style.display !== 'flex') {
      Game.resumeGame();
    }
  },

  openSettings() {
    if (Game.gameStarted && !Game.gamePaused) Game.pauseGame();
    this.openModal('settingsModal');
  },

  openHelp() {
    if (Game.gameStarted && !Game.gamePaused) Game.pauseGame();
    this.openModal('helpModal');
  },

  openShop() {
    if (Game.gameStarted && !Game.gamePaused) Game.pauseGame();
    this.openModal('shopModal');
    Game.updateShopButtons();
  }
};

// Volume range listeners
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
      // If you have more SFX, you can handle them here
    });
  }
});
