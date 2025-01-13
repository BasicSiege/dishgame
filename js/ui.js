/* ui.js
   Handles UI and bridging calls to Game
*/
import { Game } from './game.js';

export const UI = {
  game: null, // Store game instance

  initialize(gameInstance) {
    this.game = gameInstance;
    this.game.init();
    
    // Fullscreen button
    const fsBtn = document.getElementById('fullscreenBtn');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        this.game.toggleFullscreen();
      });
    }

    // Initialize volume controls
    this.initializeVolumeControls();
  },

  initializeVolumeControls() {
    const bgmRange = document.getElementById('bgmVolume');
    const sfxRange = document.getElementById('sfxVolume');
    
    if (bgmRange) {
      bgmRange.addEventListener('input', (e) => {
        this.game.bgmVolume = e.target.value;
        this.game.updateBGMVolume();
      });
    }
    
    if (sfxRange) {
      sfxRange.addEventListener('input', (e) => {
        this.game.sfxVolume = e.target.value;
        // If you have SFX logic, handle it here
      });
    }
  },

  startGame() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    document.getElementById('inGameMenu').style.display = 'block';
    document.getElementById('mobileControls').style.display = 'flex';
    this.game.startGame();
  },

  pauseGame() {
    this.game.pauseGame();
  },

  resumeGame() {
    this.game.resumeGame();
  },

  returnToMainMenu() {
    this.game.returnToMainMenu();
  },

  openShop() {
    this.openModal('shopModal');
    this.game.updateShopButtons();
  },

  openSettings() {
    if (this.game.gameStarted && !this.game.gamePaused) {
      this.game.pauseGame();
    }
    this.openModal('settingsModal');
  },

  openHelp() {
    if (this.game.gameStarted && !this.game.gamePaused) {
      this.game.pauseGame();
    }
    this.openModal('helpModal');
  },

  openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
  },

  closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
    
    if (this.game.gameStarted && this.game.gamePaused &&
        document.getElementById('pauseOverlay').style.display !== 'flex') {
      this.game.resumeGame();
    }
  }
};
