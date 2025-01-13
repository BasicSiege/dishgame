/* ui.js
   Handles UI and bridging calls to Game
*/

export const UI = {
  game: null,
  
  initialize(gameInstance) {
    this.game = gameInstance;
    this.game.init();
    
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupUI());
    } else {
      this.setupUI();
    }
  },

  setupUI() {
    // Main Menu buttons
    const mainMenuButtons = document.querySelectorAll('#mainMenu .menu-button');
    mainMenuButtons.forEach(button => {
      switch(button.textContent) {
        case 'Play':
          button.onclick = () => this.startGame();
          break;
        case 'Shop':
          button.onclick = () => this.openShop();
          break;
        case 'Settings':
          button.onclick = () => this.openSettings();
          break;
        case 'Help':
          button.onclick = () => this.openHelp();
          break;
      }
    });

    // In-Game Menu buttons
    const inGameButtons = document.querySelectorAll('#inGameMenu .in-game-button');
    inGameButtons.forEach(button => {
      switch(button.textContent) {
        case 'Shop':
          button.onclick = () => this.openShop();
          break;
        case 'Pause':
          button.onclick = () => this.pauseGame();
          break;
      }
    });

    // Pause Menu buttons
    const pauseButtons = document.querySelectorAll('.pause-menu .pause-button');
    pauseButtons.forEach(button => {
      switch(button.textContent) {
        case 'Resume':
          button.onclick = () => this.resumeGame();
          break;
        case 'Settings':
          button.onclick = () => this.openSettings();
          break;
        case 'Main Menu':
          button.onclick = () => this.returnToMainMenu();
          break;
      }
    });

    // Modal close buttons
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
      button.onclick = () => {
        const modalId = button.closest('.modal').id;
        this.closeModal(modalId);
      };
    });

    // Fullscreen button
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
      fullscreenBtn.onclick = () => this.game.toggleFullscreen();
    }

    // Volume controls
    this.initializeVolumeControls();
  },

  initializeVolumeControls() {
    const bgmVolume = document.getElementById('bgmVolume');
    const sfxVolume = document.getElementById('sfxVolume');
    
    if (bgmVolume) {
      bgmVolume.onchange = (e) => {
        this.game.bgmVolume = parseInt(e.target.value);
        this.game.updateBGMVolume();
      };
    }
    
    if (sfxVolume) {
      sfxVolume.onchange = (e) => {
        this.game.sfxVolume = parseInt(e.target.value);
      };
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
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modalOverlay');
    if (modal && overlay) {
      modal.style.display = 'block';
      overlay.style.display = 'block';
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modalOverlay');
    if (modal && overlay) {
      modal.style.display = 'none';
      overlay.style.display = 'none';
      
      if (this.game.gameStarted && this.game.gamePaused &&
          document.getElementById('pauseOverlay').style.display !== 'flex') {
        this.game.resumeGame();
      }
    }
  }
};
