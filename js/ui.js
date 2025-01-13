/* ui.js
   Handles UI and bridging calls to Game
*/
import { Game } from './game.js';

export const UI = {
  game: null,

  initialize(gameInstance) {
    this.game = gameInstance;
    this.game.init();
    
    // Initialize all UI event listeners
    this.initializeEventListeners();
    
    // Initialize volume controls
    this.initializeVolumeControls();
  },

  initializeEventListeners() {
    // Main Menu buttons
    document.querySelector('#mainMenu button:nth-child(2)').addEventListener('click', () => this.startGame());
    document.querySelector('#mainMenu button:nth-child(3)').addEventListener('click', () => this.openShop());
    document.querySelector('#mainMenu button:nth-child(4)').addEventListener('click', () => this.openSettings());
    document.querySelector('#mainMenu button:nth-child(5)').addEventListener('click', () => this.openHelp());

    // In-Game Menu buttons
    document.querySelectorAll('#inGameMenu button').forEach(button => {
      if (button.textContent === 'Shop') {
        button.addEventListener('click', () => this.openShop());
      } else if (button.textContent === 'Pause') {
        button.addEventListener('click', () => this.pauseGame());
      }
    });

    // Pause Menu buttons
    document.querySelectorAll('.pause-menu button').forEach(button => {
      if (button.textContent === 'Resume') {
        button.addEventListener('click', () => this.resumeGame());
      } else if (button.textContent === 'Settings') {
        button.addEventListener('click', () => this.openSettings());
      } else if (button.textContent === 'Main Menu') {
        button.addEventListener('click', () => this.returnToMainMenu());
      }
    });

    // Modal close buttons
    document.querySelectorAll('.close-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const modalId = e.target.parentElement.id;
        this.closeModal(modalId);
      });
    });

    // Fullscreen button
    const fsBtn = document.getElementById('fullscreenBtn');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => this.game.toggleFullscreen());
    }
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
