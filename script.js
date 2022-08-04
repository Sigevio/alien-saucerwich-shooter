/** @type {HTMLCanvasElement} */

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');

let aboutToGameOver;
let gameOver;

let score;

let timeToNextEnemy;
let lastTime;
let enemyInterval = 500;

let enemies;
let explosions;
let particles;

const initialize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  collisionCanvas.width = window.innerWidth;
  collisionCanvas.height = window.innerHeight;

  aboutToGameOver = false;
  gameOver = false;

  score = 0;
  ctx.font = '50px Impact';

  timeToNextEnemy = 0;
  lastTime = 0;

  enemies = explosions = particles = [];
}

class Enemy {
  constructor() {
    this.sizeModifier = Math.random() * 0.6 + 0.4;
    this.spriteWidth = 205;
    this.spriteHeight = 176;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = Math.random() * 3 + 3;
    this.directionY = Math.random() * 5 - 2.5;
    this.markedForDestruction = false;
    this.image = new Image();
    this.image.src = 'assets/alien.png';
    this.frame = 0;
    this.maxFrame = 4;
    this.timeSinceFrame = 0;
    this.frameInterval = Math.random() * 50 + 50;
    this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
    this.color = `rgb(${this.randomColors[0]}, ${this.randomColors[1]}, ${this.randomColors[2]})`;
  }

  update(delta) {
    if (this.y < 0 || this.y > canvas.height - this.height) {
      this.directionY = this.directionY * -1;
    }
    this.x -= this.directionX;
    this.y += this.directionY;
    if (this.x < 0 - this.width) {
      this.markedForDestruction = true;
    }
    this.timeSinceFrame += delta;
    if (this.timeSinceFrame > this.frameInterval) {
      if (this.frame > this.maxFrame) {
        this.frame = 0;
      }
      else {
        this.frame++;
      }
      this.timeSinceFrame = 0;
      for (let i = 0; i < 5; i++) {
        particles.push(new Particle(this.x, this.y, this.width, this.color));
      }
    }
    if (this.x < 0 - this.width) {
      aboutToGameOver = true;
    }
  }

  draw() {
    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
  }
}

class Explosion {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = 'assets/boom.png';
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.size = size;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.sound = new Audio();
    this.sound.src = 'assets/boom.wav';
    this.timeSinceLastFrame = 0;
    this.frameInterval = 100;
    this.markedForDestruction = false;
  }

  update(delta) {
    if (this.frame === 0) {
      this.sound.play();
    }
    this.timeSinceLastFrame += delta;
    console.log(this.frame)
    if (this.timeSinceLastFrame > this.frameInterval) {
      this.frame++;
      this.timeSinceLastFrame = 0;
      if (this.frame > 5) {
        this.markedForDestruction = true;
      }
    }
  }

  draw() {
    ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x - this.size * 0.5, this.y - this.size * 0.5, this.size, this.size);
  }
}

class Particle {
  constructor(x, y, size, color) {
    this.size = size;
    this.x = x + this.size * 0.5 + Math.random() * 50 - 25;
    this.y = y + this.size * 0.33 + Math.random() * 50 - 25;
    this.radius = Math.random() * this.size * 0.1;
    this.maxRadius = Math.random() * 20 + 35;
    this.markedForDestruction = false;
    this.speedX = Math.random() + 0.5;
    this.color = color;
  }

  update() {
    this.x += this.speedX;
    this.radius += 0.5;
    if (this.radius > this.maxRadius - 5) {
      this.markedForDestruction = true;
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = 1 - this.radius / this.maxRadius;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const drawScore = () => {
  ctx.fillStyle = 'black';
  ctx.fillText('Score: ' + score, 50, 75);
  ctx.fillStyle = 'white';
  ctx.fillText('Score: ' + score, 55, 80);
}

const drawGameOver = () => {
  // background
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fill();
  ctx.closePath();
  // text
  ctx.textAlign = 'center';
  ctx.font = '60pt Impact';
  ctx.fillStyle = 'black';
  ctx.fillText('GAME OVER', canvas.width * 0.5, canvas.height * 0.2);
  ctx.fillStyle = 'white';
  ctx.fillText('GAME OVER', canvas.width * 0.5 + 5, canvas.height * 0.2 + 5);
  // score
  ctx.font = '50pt Impact';
  ctx.fillStyle = 'black';
  ctx.fillText('Score: ' + score, canvas.width * 0.5, canvas.height * 0.4);
  ctx.fillStyle = 'white';
  ctx.fillText('Score: ' + score, canvas.width * 0.5 + 5, canvas.height * 0.4 + 5);
  // button
  ctx.beginPath();
  ctx.rect(canvas.width * 0.5 - 100, canvas.height * 0.75, 200, 100); 
  ctx.fillStyle = 'rgba(225, 225, 225, 0.75)';
  ctx.fill(); 
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();
  ctx.font = '40pt Impact';
  ctx.fillStyle = 'black';
  ctx.fillText('Retry', canvas.width * 0.5, canvas.height * 0.83);
}

canvas.addEventListener('click', e => {
  if (gameOver) {
    let mouseX = e.clientX;
    let mouseY = e.clientY;
    let rectX = canvas.width * 0.5 - 100;
    let rectY = canvas.height * 0.75;
    let rectWidth = 200;
    let rectHeight = 100;

    if (mouseX > rectX &&
        mouseX < rectX + rectWidth &&
        mouseY < rectY + rectHeight &&
        mouseY > rectY) {
      initialize();
      animate(0);
    }
  }
});

window.addEventListener('click', e => {
  const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
  const pixelColor = detectPixelColor.data;
  enemies.forEach(enemy => {
    if (enemy.randomColors[0] === pixelColor[0] &&
        enemy.randomColors[1] === pixelColor[1] &&
        enemy.randomColors[2] === pixelColor[2]) {
      enemy.markedForDestruction = true;
      score++;
      explosions.push(new Explosion(e.x, e.y, enemy.width));
    }
  });
});

const animate = timestamp => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  collisionCtx.clearRect(0, 0, canvas.width, canvas.height);

  let delta = timestamp - lastTime;
  lastTime = timestamp;
  timeToNextEnemy += delta;
  if (timeToNextEnemy > enemyInterval) {
    enemies.push(new Enemy());
    timeToNextEnemy = 0;
    enemies.sort((a, b) => a.width - b.width);
  }

  if (!aboutToGameOver) {
    drawScore();
  } else {
    gameOver = true;
  }

  [...particles, ...enemies, ...explosions].forEach(object => {
    object.update(delta);
    object.draw(delta);
  });

  enemies = enemies.filter(enemy => !enemy.markedForDestruction);
  explosions = explosions.filter(explosion => !explosion.markedForDestruction);
  particles = particles.filter(particle => !particle.markedForDestruction);

  if (!gameOver) {
    requestAnimationFrame(animate);
  } else {
    drawGameOver();
  }
}

initialize();
animate(0);