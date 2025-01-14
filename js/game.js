/* game.js
   Core Game Logic
*/

import { SpritePlayer } from './spriteplayer.js';

export const Game = {
  player: null,
  canvas: null,
  ctx: null,
  inputKeys: { up: false, down: false, left: false, right: false, e: false },
  gameStarted: false,
  gamePaused: false,

  // Track total cleaned dishes
  totalCleanedDishes: 0,

  // Zones, dish logic, etc.
  storedDishes: { plate: 0, bowl: 0, cup: 0 },
  lastDishRemoval: { plate: Date.now(), bowl: Date.now(), cup: Date.now() },
  MAX_DISHES_PER_TYPE: 5,
  MIN_DISHES_BEFORE_REMOVAL: 3,
  DISH_REMOVAL_INTERVAL: 5000,

  washingProgress: 0,
  washingRateBase: 20,

  images: {},
  bgMusic: null,
  bgmVolume: 50,
  sfxVolume: 50,

  GAME_WIDTH: 800,
  GAME_HEIGHT: 600,
  PLAYER_SIZE: 48,
  PLATE_SIZE: 120,
  BOWL_SIZE: 120,
  CUP_SIZE: 60,

  zones: {
    dishSpawn: { x: 550, y: 80, width: 64, height: 64 },
    sink: { x: 100, y: 100, width: 80, height: 120 },
    shelf: {
      x: 600,
      y: 300,
      width: 150,
      height: 250,
      zones: {
        bowl:  { x: 620, y: 320, width: 110, height: 64 },
        plate: { x: 620, y: 400, width: 110, height: 64 },
        cup:   { x: 620, y: 480, width: 110, height: 64 }
      }
    }
  },

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.loadAssets();
    this.player = this.player || new SpritePlayer();

    // Audio
    this.bgMusic = new Audio('./assets/music.mp3');
    this.bgMusic.loop = true;
    this.updateBGMVolume();

    // Intervals
    setInterval(() => this.removeDishes(), 1000);

    // Setup input
    this.setupInput();
  },

  loadAssets() {
    const toLoad = [
      'dirtyPlate','cleanPlate','dirtyBowl','cleanBowl',
      'dirtyCup','cleanCup','shelf','sink','bustub'
    ];
    toLoad.forEach(name => {
      this.images[name] = new Image();
      this.images[name].src = `./assets/art/${name}.png`;
    });
  },

  setupInput() {
    window.addEventListener('keydown', e => {
      switch(e.key.toLowerCase()) {
        case 'w': case 'arrowup':    this.inputKeys.up = true;    break;
        case 's': case 'arrowdown':  this.inputKeys.down = true;  break;
        case 'a': case 'arrowleft':  this.inputKeys.left = true;  break;
        case 'd': case 'arrowright': this.inputKeys.right = true; break;
        case 'e':
          this.inputKeys.e = true;
          if (!this.player.isWashing) this.handleInteraction();
          break;
        case 'escape':
          if (this.gameStarted) {
            this.gamePaused ? this.resumeGame() : this.pauseGame();
          }
          break;
        // (ADDED) Press F to toggle fullscreen
        case 'f':
          this.toggleFullscreen();
          break;
      }
    });

    window.addEventListener('keyup', e => {
      switch(e.key.toLowerCase()) {
        case 'w': case 'arrowup':    this.inputKeys.up = false;   break;
        case 's': case 'arrowdown':  this.inputKeys.down = false; break;
        case 'a': case 'arrowleft':  this.inputKeys.left = false; break;
        case 'd': case 'arrowright': this.inputKeys.right = false;break;
        case 'e':
          this.inputKeys.e = false;
          this.player.isWashing = false;
          break;
      }
    });

    // Mobile Joystick
    const joystickContainer = document.getElementById('joystickContainer');
    const joystickHandle = document.getElementById('joystickHandle');
    let joystickActive = false;
    let joystickStartX = 0;
    let joystickStartY = 0;

    joystickContainer.addEventListener('touchstart', e => {
      e.preventDefault();
      joystickActive = true;
      const touch = e.changedTouches[0];
      joystickStartX = touch.pageX;
      joystickStartY = touch.pageY;
    }, { passive: false });

    joystickContainer.addEventListener('touchmove', e => {
      if (!joystickActive) return;
      e.preventDefault();
      const touch = e.changedTouches[0];
      const dx = touch.pageX - joystickStartX;
      const dy = touch.pageY - joystickStartY;
      const radius = 60;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const angle = Math.atan2(dy, dx);

      const clampedDist = Math.min(dist, radius);
      const handleX = radius + clampedDist * Math.cos(angle);
      const handleY = radius + clampedDist * Math.sin(angle);

      joystickHandle.style.left = (handleX - 20) + 'px';
      joystickHandle.style.top = (handleY - 20) + 'px';

      const deadZone = 10;
      if (dist > deadZone) {
        this.inputKeys.up = (Math.abs(dy) > Math.abs(dx) && dy < 0);
        this.inputKeys.down = (Math.abs(dy) > Math.abs(dx) && dy > 0);
        this.inputKeys.left = (Math.abs(dx) > Math.abs(dy) && dx < 0);
        this.inputKeys.right = (Math.abs(dx) > Math.abs(dy) && dx > 0);
      } else {
        this.inputKeys.up = false;
        this.inputKeys.down = false;
        this.inputKeys.left = false;
        this.inputKeys.right = false;
      }
    }, { passive: false });

    joystickContainer.addEventListener('touchend', () => {
      joystickActive = false;
      joystickHandle.style.left = 'calc(50% - 20px)';
      joystickHandle.style.top = 'calc(50% - 20px)';
      this.inputKeys.up = false;
      this.inputKeys.down = false;
      this.inputKeys.left = false;
      this.inputKeys.right = false;
    });

    // Mobile Interact
    const interactButton = document.getElementById('interactButton');
    interactButton.addEventListener('touchstart', e => {
      e.preventDefault();
      this.inputKeys.e = true;
      if (!this.player.isWashing) this.handleInteraction();
    });
    interactButton.addEventListener('touchend', () => {
      this.inputKeys.e = false;
      this.player.isWashing = false;
    });
  },

  startGame() {
    if (!this.gameStarted) {
      this.gameStarted = true;
      this.gamePaused = false;
      document.getElementById('pauseOverlay').style.display = 'none';
      this.bgMusic.currentTime = 0;
      this.bgMusic.play();
      this.lastTime = performance.now();
      requestAnimationFrame(t => this.gameLoop(t));
    }
  },

  pauseGame() {
    this.gamePaused = true;
    this.bgMusic.pause();
    document.getElementById('pauseOverlay').style.display = 'flex';
  },

  resumeGame() {
    this.gamePaused = false;
    this.bgMusic.play();
    document.getElementById('pauseOverlay').style.display = 'none';
    this.lastTime = performance.now();
    requestAnimationFrame(t => this.gameLoop(t));
  },

  returnToMainMenu() {
    this.gamePaused = false;
    this.gameStarted = false;
    this.player.score = 0;
    this.player.heldItem = null;
    this.player.x = 400;
    this.player.y = 300;
    this.storedDishes = { plate:0, bowl:0, cup:0 };
    this.totalCleanedDishes = 0;  // Reset cleaned counter

    document.getElementById('pauseOverlay').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('inGameMenu').style.display = 'none';
    document.getElementById('mobileControls').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';

    this.bgMusic.pause();
    this.bgMusic.currentTime = 0;
  },

  gameLoop(currentTime) {
    if (this.gamePaused || !this.gameStarted) return;
    const delta = Math.min(currentTime - this.lastTime, 33);
    this.lastTime = currentTime;

    this.player.update(delta, this.inputKeys);
    this.updateWashingProgress(delta);
    this.updatePrompt();
    this.drawScene();

    requestAnimationFrame(t => this.gameLoop(t));
  },

  drawScene() {
    this.ctx.clearRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);

    // Draw sink
    if (this.images.sink.complete) {
      this.ctx.save();
      this.ctx.translate(this.zones.sink.x + this.zones.sink.width, this.zones.sink.y);
      this.ctx.scale(-1.2, 1);
      this.ctx.drawImage(this.images.sink, 0, 0, this.zones.sink.width, this.zones.sink.height);
      this.ctx.restore();
    }

    // bustub
    if (this.images.bustub.complete) {
      const scaleFactor = 2.5;
      const newW = this.zones.dishSpawn.width * scaleFactor;
      const newH = this.zones.dishSpawn.height * scaleFactor;
      this.ctx.drawImage(
        this.images.bustub,
        this.zones.dishSpawn.x,
        this.zones.dishSpawn.y,
        newW, newH
      );
    }

    // shelf + stored dishes
    if (this.images.shelf.complete) {
      this.ctx.drawImage(
        this.images.shelf,
        this.zones.shelf.x,
        this.zones.shelf.y,
        this.zones.shelf.width,
        this.zones.shelf.height
      );

      Object.entries(this.storedDishes).forEach(([type, count]) => {
        if (count > 0) {
          const zone = this.zones.shelf.zones[type];
          const itemKey = 'clean' + type.charAt(0).toUpperCase() + type.slice(1);
          const image = this.images[itemKey];
          if (image && image.complete) {
            let shelfDrawSize = 40;
            if (type === 'plate' || type === 'bowl') {
              shelfDrawSize = 60;
            }
            this.ctx.drawImage(image, zone.x, zone.y, shelfDrawSize, shelfDrawSize);
            this.ctx.fillStyle = '#000';
            this.ctx.font = '14px Mega';
            this.ctx.fillText(`x${count}`, zone.x + shelfDrawSize + 5, zone.y + shelfDrawSize / 2);
          }
        }
      });
    }

    // Held item float
    const timeNow = performance.now() / 300;
    const floatOffset = 4 * Math.sin(timeNow);
    if (this.player.heldItem) {
      const prefix = (this.player.heldItem.state === 'clean') ? 'clean' : 'dirty';
      const capitalType = this.player.heldItem.type.charAt(0).toUpperCase() + this.player.heldItem.type.slice(1);
      const itemKey = prefix + capitalType;
      const itemImg = this.images[itemKey];
      if (itemImg && itemImg.complete) {
        let itemSize = 80;
        if (this.player.heldItem.type === 'plate') itemSize = this.PLATE_SIZE;
        if (this.player.heldItem.type === 'bowl')  itemSize = this.BOWL_SIZE;
        if (this.player.heldItem.type === 'cup')   itemSize = this.CUP_SIZE;

        const drawX = this.player.x + 60;
        const drawY = this.player.y - 10 + floatOffset;
        const scale = 0.7;
        const scaledW = itemSize * scale;
        const scaledH = itemSize * scale;

        this.ctx.drawImage(itemImg, drawX, drawY, scaledW, scaledH);
      }
    }
  },

  updateWashingProgress(deltaMs) {
    const progressBar = document.getElementById('progressBar');
    const washingProgressElement = document.getElementById('washingProgress');
    if (this.player.isWashing) {
      washingProgressElement.style.display = 'block';
      const washRate = this.washingRateBase * this.player.washingSpeed * (deltaMs / 1000);
      this.washingProgress += washRate;
      progressBar.style.width = `${(this.washingProgress / 100) * 100}%`;

      if (this.washingProgress >= 100) {
        this.player.heldItem.state = 'clean';
        this.player.score += 10 * this.player.washingSpeed;
        this.updateScore();

        // Increment total cleaned dishes
        this.totalCleanedDishes++;
        this.updateCleanedDishesDisplay();

        this.player.isWashing = false;
        this.washingProgress = 0;
        washingProgressElement.style.display = 'none';
      }
    } else {
      this.washingProgress = 0;
      progressBar.style.width = '0%';
      washingProgressElement.style.display = 'none';
    }
  },

  updatePrompt() {
    const promptText = document.getElementById('promptText');
    const rectPlayer = {
      x: this.player.x,
      y: this.player.y,
      width: this.PLAYER_SIZE,
      height: this.PLAYER_SIZE
    };

    if (this.player.heldItem) {
      if (
        this.player.heldItem.state === 'dirty' &&
        this.checkCollision(rectPlayer, this.zones.sink)
      ) {
        promptText.textContent = 'Hold "E" or Interact to wash Dishes';
      } else if (this.player.heldItem.state === 'clean') {
        promptText.textContent = 'Press "E" or Interact to put away dishes';
      } else {
        promptText.textContent = '';
      }
    } else if (this.checkCollision(rectPlayer, this.zones.dishSpawn)) {
      promptText.textContent = '"E" or Interact to pick up Dirty Dishes';
    } else {
      promptText.textContent = '';
    }
  },

  handleInteraction() {
    const rectPlayer = {
      x: this.player.x,
      y: this.player.y,
      width: this.PLAYER_SIZE,
      height: this.PLAYER_SIZE
    };
    if (!this.player.heldItem) {
      if (this.checkCollision(rectPlayer, this.zones.dishSpawn)) {
        const randomType = ['plate','bowl','cup'][Math.floor(Math.random()*3)];
        this.player.heldItem = { type: randomType, state: 'dirty' };
      }
    }
    else if (this.player.heldItem.state === 'dirty') {
      if (this.checkCollision(rectPlayer, this.zones.sink)) {
        this.player.isWashing = true;
      }
    }
    else if (this.player.heldItem.state === 'clean') {
      const shelfZone = this.zones.shelf.zones[this.player.heldItem.type];
      if (
        this.checkCollision(rectPlayer, shelfZone) &&
        this.storedDishes[this.player.heldItem.type] < this.MAX_DISHES_PER_TYPE
      ) {
        this.storedDishes[this.player.heldItem.type]++;
        this.player.heldItem = null;
        this.player.score += 5;
        this.updateScore();
      }
    }
  },

  removeDishes() {
    const now = Date.now();
    Object.keys(this.storedDishes).forEach(type => {
      if (
        this.storedDishes[type] >= this.MIN_DISHES_BEFORE_REMOVAL &&
        now - this.lastDishRemoval[type] > this.DISH_REMOVAL_INTERVAL
      ) {
        this.storedDishes[type]--;
        this.lastDishRemoval[type] = now;
      }
    });
  },

  checkCollision(obj1, obj2) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  },

  // Update score
  updateScore() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    scoreDisplay.textContent = `Score: ${Math.floor(this.player.score)}`;
  },

  // Update cleaned dishes
  updateCleanedDishesDisplay() {
    const cleanedDishesEl = document.getElementById('cleanedDishesDisplay');
    if (cleanedDishesEl) {
      cleanedDishesEl.textContent = `Cleaned: ${this.totalCleanedDishes}`;
    }
  },

  // Shop Upgrades
  purchaseSpeedUpgrade() {
    if (this.player.score >= 100) {
      this.player.pixelPerSecond *= 1.2;
      this.player.score -= 100;
      this.updateScore();
      this.updateShopButtons();
    }
  },

  purchaseWashingUpgrade() {
    if (this.player.score >= 150) {
      this.player.washingSpeed *= 1.3;
      this.player.score -= 150;
      this.updateScore();
      this.updateShopButtons();
    }
  },

  purchaseStorageUpgrade() {
    if (this.player.score >= 200) {
      this.MAX_DISHES_PER_TYPE += 2;
      this.player.score -= 200;
      this.updateScore();
      this.updateShopButtons();
    }
  },

  updateShopButtons() {
    document.getElementById('speedUpgradeBtn').disabled = (this.player.score < 100);
    document.getElementById('washingUpgradeBtn').disabled = (this.player.score < 150);
    document.getElementById('storageUpgradeBtn').disabled = (this.player.score < 200);
  },

  // Volume
  updateBGMVolume() {
    if (this.bgMusic) {
      this.bgMusic.volume = this.bgmVolume / 100;
    }
  },

  // (ADDED) Toggle Fullscreen
  toggleFullscreen() {
    const doc = document;
    const docEl = document.documentElement;
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      }
    }
  }
};
