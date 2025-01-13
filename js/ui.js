/* ui.js */
export const UI = {
  game: null,
  
  initialize(gameInstance) {
    this.game = gameInstance;
    this.game.init();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupUI());
    } else {
      this.setupUI();
    }
  },

  setupUI() {
    // Main Menu Buttons
    document.getElementById('playButton').addEventListener('click', () => this.startGame());
    document.getElementById('shopButton').addEventListener('click', () => this.openShop());
    document.getElementById('settingsButton').addEventListener('click', () => this.openSettings());
    document.getElementById('helpButton').addEventListener('click', () => this.openHelp());

    // In-Game Menu Buttons
    document.getElementById('inGameShopBtn').addEventListener('click', () => this.openShop());
    document.getElementById('inGamePauseBtn').addEventListener('click', () => this.pauseGame());

    // Pause Menu Buttons
    document.getElementById('resumeButton').addEventListener('click', () => this.resumeGame());
    document.getElementById('pauseSettingsButton').addEventListener('click', () => this.openSettings());
    document.getElementById('mainMenuButton').addEventListener('click', () => this.returnToMainMenu());

    // Close buttons for modals
    document.querySelectorAll('.close-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const modalId = e.target.closest('.modal').id;
        this.closeModal(modalId);
      });
    });

    // Shop Upgrade Buttons
    document.getElementById('speedUpgradeBtn').addEventListener('click', () => this.game.purchaseSpeedUpgrade());
    document.getElementById('washingUpgradeBtn').addEventListener('click', () => this.game.purchaseWashingUpgrade());
    document.getElementById('storageUpgradeBtn').addEventListener('click', () => this.game.purchaseStorageUpgrade());

    // Fullscreen button
    document.getElementById('fullscreenBtn').addEventListener('click', () => this.game.toggleFullscreen());

    // Volume Controls
    this.initializeVolumeControls();

    console.log('UI Setup Complete');
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
    console.log('Starting game...');
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
    console.log('Opening shop...');
    this.openModal('shopModal');
    if (this.game.gameStarted) {
      this.game.updateShopButtons();
    }
  },

  openSettings() {
    console.log('Opening settings...');
    if (this.game.gameStarted && !this.game.gamePaused) {
      this.game.pauseGame();
    }
    this.openModal('settingsModal');
  },

  openHelp() {
    console.log('Opening help...');
    if (this.game.gameStarted && !this.game.gamePaused) {
      this.game.pauseGame();
    }
    this.openModal('helpModal');
  },

  openModal(modalId) {
    console.log(`Opening modal: ${modalId}`);
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modalOverlay');
    if (modal && overlay) {
      modal.style.display = 'block';
      overlay.style.display = 'block';
    } else {
      console.error(`Failed to find modal or overlay. Modal: ${modal}, Overlay: ${overlay}`);
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
