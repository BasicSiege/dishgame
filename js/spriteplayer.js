/* spritePlayer.js
   Manages the Player Sprite: movement, animation, etc.
*/

export class SpritePlayer {
  constructor() {
    this.element = document.getElementById('player');
    this.x = 400;
    this.y = 300;
    this.pixelPerSecond = 180;
    this.washingSpeed = 1;
    this.score = 0;
    this.heldItem = null;
    this.isWashing = false;

    // Animation
    this.direction = 'SOUTH';
    this.currentFrame = 0;
    this.frameTime = 0;
    this.frameDuration = 0.1;
    this.isMoving = false;

    // Paths - Adjust if your folder is different
    this.frames = {
      'NORTH': {
        walking: [
          './assets/sprite/NORTHFRAME1.png','./assets/sprite/NORTHFRAME2.png',
          './assets/sprite/NORTHFRAME3.png','./assets/sprite/NORTHFRAME4.png',
          './assets/sprite/NORTHFRAME5.png','./assets/sprite/NORTHFRAME6.png',
          './assets/sprite/NORTHFRAME7.png','./assets/sprite/NORTHFRAME8.png'
        ],
        standing: ['./assets/sprite/STANDING-NORTH-FRAME.png']
      },
      'SOUTH': {
        walking: [
          './assets/sprite/SOUTHFRAME1.png','./assets/sprite/SOUTHFRAME2.png',
          './assets/sprite/SOUTHFRAME3.png','./assets/sprite/SOUTHFRAME4.png',
          './assets/sprite/SOUTHFRAME5.png','./assets/sprite/SOUTHFRAME6.png',
          './assets/sprite/SOUTHFRAME7.png','./assets/sprite/SOUTHFRAME8.png'
        ],
        standing: ['./assets/sprite/STANDING-SOUTH-FRAME.png']
      },
      'EAST': {
        walking: [
          './assets/sprite/EASTFRAME1.png','./assets/sprite/EASTFRAME2.png',
          './assets/sprite/EASTFRAME3.png','./assets/sprite/EASTFRAME4.png',
          './assets/sprite/EASTFRAME5.png','./assets/sprite/EASTFRAME6.png',
          './assets/sprite/EASTFRAME7.png','./assets/sprite/EASTFRAME8.png'
        ],
        standing: ['./assets/sprite/STANDING-EAST-FRAME.png']
      },
      'WEST': {
        walking: [
          './assets/sprite/WESTFRAME1.png','./assets/sprite/WESTFRAME2.png',
          './assets/sprite/WESTFRAME3.png','./assets/sprite/WESTFRAME4.png',
          './assets/sprite/WESTFRAME5.png','./assets/sprite/WESTFRAME6.png',
          './assets/sprite/WESTFRAME7.png','./assets/sprite/WESTFRAME8.png'
        ],
        standing: ['./assets/sprite/STANDING-WEST-FRAME.png']
      },
      'NORTH-EAST': {
        walking: [
          './assets/sprite/NORTH-EAST-FRAME1.png','./assets/sprite/NORTH-EAST-FRAME2.png',
          './assets/sprite/NORTH-EAST-FRAME3.png','./assets/sprite/NORTH-EAST-FRAME4.png',
          './assets/sprite/NORTH-EAST-FRAME5.png','./assets/sprite/NORTH-EAST-FRAME6.png',
          './assets/sprite/NORTH-EAST-FRAME7.png','./assets/sprite/NORTH-EAST-FRAME8.png'
        ],
        standing: ['./assets/sprite/STANDING-NORTH-EAST-FRAME.png']
      },
      'NORTH-WEST': {
        walking: [
          './assets/sprite/NORTH-WEST-FRAME1.png','./assets/sprite/NORTH-WEST-FRAME2.png',
          './assets/sprite/NORTH-WEST-FRAME3.png','./assets/sprite/NORTH-WEST-FRAME4.png',
          './assets/sprite/NORTH-WEST-FRAME5.png','./assets/sprite/NORTH-WEST-FRAME6.png',
          './assets/sprite/NORTH-WEST-FRAME7.png','./assets/sprite/NORTH-WEST-FRAME8.png'
        ],
        standing: ['./assets/sprite/STANDING-NORTH-WEST-FRAME.png']
      },
      'SOUTH-EAST': {
        walking: [
          './assets/sprite/SOUTH-EAST-FRAME1.png','./assets/sprite/SOUTH-EAST-FRAME2.png',
          './assets/sprite/SOUTH-EAST-FRAME3.png','./assets/sprite/SOUTH-EAST-FRAME4.png',
          './assets/sprite/SOUTH-EAST-FRAME5.png','./assets/sprite/SOUTH-EAST-FRAME6.png',
          './assets/sprite/SOUTH-EAST-FRAME7.png','./assets/sprite/SOUTH-EAST-FRAME8.png'
        ],
        standing: ['./assets/sprite/STANDING-SOUTH-EAST-FRAME.png']
      },
      'SOUTH-WEST': {
        walking: [
          './assets/sprite/SOUTH-WEST-FRAME1.png','./assets/sprite/SOUTH-WEST-FRAME2.png',
          './assets/sprite/SOUTH-WEST-FRAME3.png','./assets/sprite/SOUTH-WEST-FRAME4.png',
          './assets/sprite/SOUTH-WEST-FRAME5.png','./assets/sprite/SOUTH-WEST-FRAME6.png',
          './assets/sprite/SOUTH-WEST-FRAME7.png','./assets/sprite/SOUTH-WEST-FRAME8.png'
        ],
        standing: ['./assets/sprite/STANDING-SOUTH-WEST-FRAME.png']
      },
      'STANDING': {
        walking: [],
        standing: ['./assets/sprite/STANDING-SOUTH-FRAME.png']
      }
    };

    this.loadedFrames = {};
    this.preloadImages().catch(() =>
      console.warn('Some frames failed to load or are missing.')
    );
  }

  async preloadImages() {
    const allDirs = Object.keys(this.frames);
    let allUrls = [];
    for (const dir of allDirs) {
      allUrls.push(...this.frames[dir].walking, ...this.frames[dir].standing);
    }
    allUrls = [...new Set(allUrls)];

    const promises = allUrls.map(url => new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        this.loadedFrames[url] = img;
        resolve();
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${url}`);
        resolve();
      };
      img.src = url;
    }));

    await Promise.all(promises);
  }

  update(deltaMs, inputKeys) {
    // Store old position in case we need to revert (collision)
    const oldX = this.x;
    const oldY = this.y;
  
    // Movement (existing)
    const moveAmt = this.pixelPerSecond * (deltaMs / 1000);
    let dx = 0, dy = 0;
    if (inputKeys.up)    dy -= moveAmt;
    if (inputKeys.down)  dy += moveAmt;
    if (inputKeys.left)  dx -= moveAmt;
    if (inputKeys.right) dx += moveAmt;
  
    this.isMoving = (dx !== 0 || dy !== 0);
  
    if (this.isMoving) {
      const newDir = this.computeDirection(inputKeys);
      if (newDir !== this.direction) {
        this.direction = newDir;
        this.currentFrame = 0;
        this.frameTime = 0;
      }
    }
  
    this.x += dx;
    this.y += dy;
  
    // Keep within 800x600 minus sprite size (existing)
    this.x = Math.max(0, Math.min(800 - 70, this.x));
    this.y = Math.max(0, Math.min(600 - 100, this.y));
  
    // ADDED: Collision with table
    const playerRect = {
      x: this.x,
      y: this.y,
      width: 70,   // approx sprite bounding box
      height: 100
    };
  
    if (this.game) {
      const tableRect = this.game.zones.table;
      if (this.game.checkCollision(playerRect, tableRect)) {
        // Revert if colliding
        this.x = oldX;
        this.y = oldY;
      }
    }
  
    // Animate and update DOM position (existing)
    this.animate(deltaMs);
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }
  

  computeDirection(keys) {
    const { up, down, left, right } = keys;
    if (up && right) return 'NORTH-EAST';
    if (up && left)  return 'NORTH-WEST';
    if (down && right) return 'SOUTH-EAST';
    if (down && left)  return 'SOUTH-WEST';
    if (up)    return 'NORTH';
    if (down)  return 'SOUTH';
    if (left)  return 'WEST';
    if (right) return 'EAST';
    return 'SOUTH';
  }

  animate(deltaMs) {
    if (this.isMoving) {
      const framesArr = this.frames[this.direction].walking;
      if (framesArr && framesArr.length) {
        this.frameTime += deltaMs / 1000;
        if (this.frameTime >= this.frameDuration) {
          this.currentFrame = (this.currentFrame + 1) % framesArr.length;
          this.frameTime = 0;
        }
        this.element.style.backgroundImage = `url('${framesArr[this.currentFrame]}')`;
      } else {
        const standFrame = this.frames[this.direction].standing[0];
        this.element.style.backgroundImage = `url('${standFrame}')`;
      }
    } else {
      const standFrame = this.frames[this.direction].standing[0];
      this.element.style.backgroundImage = `url('${standFrame}')`;
      this.currentFrame = 0;
      this.frameTime = 0;
    }
  }
}
