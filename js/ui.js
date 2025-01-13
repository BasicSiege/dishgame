/* ui.js
   Handles UI and bridging calls to Game 
*/
export const UI = {
  game: null,
  
  initialize(gameInstance) {
    this.game = gameInstance;
    this.game.init();
    
    // Initialize when DOM is ready
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
      button.addEventListener('click', () => {
        const buttonText = button.textContent.trim();
        console.log('Main menu button clicked:', buttonText); // Debug log
        
        switch(buttonText) {
          case 'Play':
            this.startGame();
            break;
          case 'Shop':
            this.openShop();
            break;
          case 'Settings':
            this.openSettings();
            break;
          case 'Help':
            this.openHelp();
            break;
        }
      });
    });

    // In-Game Menu buttons
    const inGameButtons = document.querySelectorAll('#inGameMenu .in-game-button');
    inGameButtons.forEach(button => {
      button.addEventListener('click', () => {
        const buttonText = button.textContent.trim();
        if (buttonText === 'Shop') this.openShop();
        if (buttonText === 'Pause') this.pauseGame();
      });
    });

    // Pause Menu buttons
    const pauseButtons = document.querySelectorAll('.pause-menu .pause-button');
    pauseButtons.forEach(button => {
      button.addEventListener('click', () => {
        const buttonText = button.textContent.trim();
        if (buttonText === 'Resume') this.resumeGame();
        if (buttonText === 'Settings') this.openSettings();
        if (buttonText === 'Main Menu') this.returnToMainMenu();
      });
    });

    // Modal close buttons
    document.querySelectorAll('.close-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const modalId = e.target.closest('.modal').id;
        this.closeModal(modalId);
      });
    });

    // Fullscreen button
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => this.game.toggleFullscreen());
    }

    // Shop buttons
    document.querySelectorAll('.shop-item button').forEach(button => {
      button.addEventListener('click', (e) => {
        const buttonId = e.target.id;
        if (buttonId === 'speedUpgradeBtn') this.game.purchaseSpeedUpgrade();
        if (buttonId === 'washingUpgradeBtn') this.game.purchaseWashingUpgrade();
        if (buttonId === 'storageUpgradeBtn') this.game.purchaseStorageUpgrade();
      });
    });

    // Volume controls
    this.initializeVolumeControls();
  },

  initializeVolumeControls() {
    const bgmVolume = document.getElementById('bgmVolume');
    const sfxVolume = document.getElementById('sfxVolume');
    
    if (bgmVolume) {
      bgmVolume.addEventListener('input', (e) => {
        this.game.bgmVolume = parseInt(e.target.value);
        this.game.updateBGMVolume();
      });
    }
    
    if (sfxVolume) {
      sfxVolume.addEventListener('input', (e) => {
        this.game.sfxVolume = parseInt(e.target.value);
      });
    }
  },

  startGame() {
    console.log('Starting game...'); // Debug log
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
