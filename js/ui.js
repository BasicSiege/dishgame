/* ui.js
   Handles UI and bridging calls to Game
*/
import { startRain, stopRain } from './rain.js';

export const UI = {
  initialize(GameInstance) {
    this.Game = GameInstance;
    GameInstance.init();
    // Main Menu Buttons
    document.querySelector('[data-action="start-game"]').addEventListener('click', () => this.startGame());
    document.querySelectorAll('[data-action="open-shop"]').forEach(button => {
        button.addEventListener('click', () => this.openShop());
    });
    document.querySelectorAll('[data-action="open-settings"]').forEach(button => {
        button.addEventListener('click', () => this.openSettings());
    });
    document.querySelector('[data-action="open-help"]').addEventListener('click', () => this.openHelp());
    // In-Game Buttons
    document.querySelector('[data-action="pause-game"]').addEventListener('click', () => this.pauseGame());
    document.querySelector('[data-action="resume-game"]').addEventListener('click', () => this.resumeGame());
    document.querySelector('[data-action="return-to-menu"]').addEventListener('click', () => this.returnToMainMenu());
    // Shop Buttons
    document.getElementById('speedUpgradeBtn').addEventListener('click', () => GameInstance.purchaseSpeedUpgrade());
    document.getElementById('washingUpgradeBtn').addEventListener('click', () => GameInstance.purchaseWashingUpgrade());
    document.getElementById('storageUpgradeBtn').addEventListener('click', () => GameInstance.purchaseStorageUpgrade());
    // Modal Close Buttons
    document.querySelectorAll('.close-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const modalId = e.target.closest('.modal').id;
        this.closeModal(modalId);
      });
    });
    // Fullscreen button
    const fsBtn = document.getElementById('fullscreenBtn');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        GameInstance.toggleFullscreen();
      });
    }
    // Start the rain effect when UI initializes
    startRain();
  },
  startGame() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    document.getElementById('inGameMenu').style.display = 'block';
    document.getElementById('mobileControls').style.display = 'flex';
    stopRain(); // Stop rain when game starts
    this.Game.startGame();
  },
  pauseGame() {
    this.Game.pauseGame();
  },
  resumeGame() {
    this.Game.resumeGame();
  },
  returnToMainMenu() {
    this.Game.returnToMainMenu();
    document.getElementById('mainMenu').style.display = 'flex';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('inGameMenu').style.display = 'none';
    document.getElementById('mobileControls').style.display = 'none';
    startRain(); // Restart rain when returning to menu
  },
  openShop() {
    this.openModal('shopModal');
    this.Game.updateShopButtons();
  },
  openSettings() {
    if (this.Game.gameStarted && !this.Game.gamePaused) this.Game.pauseGame();
    this.openModal('settingsModal');
  },
  openHelp() {
    if (this.Game.gameStarted && !this.Game.gamePaused) this.Game.pauseGame();
    this.openModal('helpModal');
  },
  openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
  },
  closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
    if (this.Game.gameStarted && this.Game.gamePaused &&
        document.getElementById('pauseOverlay').style.display !== 'flex') {
      this.Game.resumeGame();
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
