// Space Invaders Game for Game Boy Color Mobile Experience
class SpaceInvaders {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Game state
        this.gameRunning = false;
        this.score = 0;
        this.level = 1;
        this.gameSpeed = 1;
        
        // Player
        this.player = {
            x: this.width / 2 - 15,
            y: this.height - 40,
            width: 30,
            height: 20,
            speed: 3,
            color: '#9bbc0f'
        };
        
        // Bullets
        this.bullets = [];
        this.bulletSpeed = 5;
        
        // Invaders
        this.invaders = [];
        this.invaderBullets = [];
        this.invaderSpeed = 1;
        this.invaderDirection = 1;
        this.invaderDropDistance = 20;
        
        // Game timing
        this.lastTime = 0;
        this.invaderShootTimer = 0;
        this.invaderShootDelay = 120; // frames
        
        this.init();
    }
    
    init() {
        this.createInvaders();
        this.setupControls();
    }
    
    createInvaders() {
        this.invaders = [];
        const rows = 5;
        const cols = 8;
        const invaderWidth = 20;
        const invaderHeight = 15;
        const startX = 30;
        const startY = 50;
        const spacing = 25;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.invaders.push({
                    x: startX + col * spacing,
                    y: startY + row * spacing,
                    width: invaderWidth,
                    height: invaderHeight,
                    alive: true,
                    color: row < 2 ? '#ff6b6b' : row < 4 ? '#63b3ed' : '#9bbc0f'
                });
            }
        }
    }
    
    setupControls() {
        // Touch controls
        const leftBtn = document.getElementById('move-left');
        const rightBtn = document.getElementById('move-right');
        const shootBtn = document.getElementById('shoot-btn');
        
        // Left movement
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys = this.keys || {};
            this.keys.left = true;
        });
        
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys = this.keys || {};
            this.keys.left = false;
        });
        
        // Right movement
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys = this.keys || {};
            this.keys.right = true;
        });
        
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys = this.keys || {};
            this.keys.right = false;
        });
        
        // Shooting
        shootBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.shoot();
        });
        
        // Prevent default touch behaviors
        [leftBtn, rightBtn, shootBtn].forEach(btn => {
            btn.addEventListener('touchmove', (e) => e.preventDefault());
        });
        
        // Keyboard controls for testing
        this.keys = {};
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') {
                e.preventDefault();
                this.shoot();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    shoot() {
        // Limit bullets on screen
        if (this.bullets.length < 3) {
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 2,
                y: this.player.y,
                width: 4,
                height: 8,
                speed: this.bulletSpeed,
                color: '#9bbc0f'
            });
        }
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Update player
        if (this.keys && this.keys.left && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys && this.keys.right && this.player.x < this.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        
        // Alternative arrow key support
        if (this.keys && this.keys.arrowleft && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys && this.keys.arrowright && this.player.x < this.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > 0;
        });
        
        // Update invader bullets
        this.invaderBullets = this.invaderBullets.filter(bullet => {
            bullet.y += bullet.speed;
            return bullet.y < this.height;
        });
        
        // Update invaders
        this.updateInvaders();
        
        // Check collisions
        this.checkCollisions();
        
        // Invader shooting
        this.invaderShootTimer++;
        if (this.invaderShootTimer > this.invaderShootDelay) {
            this.invaderShoot();
            this.invaderShootTimer = 0;
        }
        
        // Check win condition
        const aliveInvaders = this.invaders.filter(invader => invader.alive);
        if (aliveInvaders.length === 0) {
            this.nextLevel();
        }
    }
    
    updateInvaders() {
        const aliveInvaders = this.invaders.filter(invader => invader.alive);
        if (aliveInvaders.length === 0) return;
        
        let shouldDrop = false;
        
        // Check if invaders hit edges
        for (let invader of aliveInvaders) {
            if ((invader.x <= 0 && this.invaderDirection === -1) || 
                (invader.x + invader.width >= this.width && this.invaderDirection === 1)) {
                shouldDrop = true;
                break;
            }
        }
        
        if (shouldDrop) {
            this.invaderDirection *= -1;
            for (let invader of this.invaders) {
                if (invader.alive) {
                    invader.y += this.invaderDropDistance;
                }
            }
            this.invaderSpeed += 0.2; // Speed up
        } else {
            for (let invader of this.invaders) {
                if (invader.alive) {
                    invader.x += this.invaderDirection * this.invaderSpeed;
                }
            }
        }
    }
    
    invaderShoot() {
        const aliveInvaders = this.invaders.filter(invader => invader.alive);
        if (aliveInvaders.length === 0) return;
        
        const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
        this.invaderBullets.push({
            x: shooter.x + shooter.width / 2 - 2,
            y: shooter.y + shooter.height,
            width: 4,
            height: 8,
            speed: 2,
            color: '#ff6b6b'
        });
    }
    
    checkCollisions() {
        // Bullet vs Invaders
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let invader of this.invaders) {
                if (invader.alive && this.collision(bullet, invader)) {
                    invader.alive = false;
                    this.bullets.splice(i, 1);
                    this.score += 10;
                    this.updateScore();
                    break;
                }
            }
        }
        
        // Invader bullets vs Player
        for (let i = this.invaderBullets.length - 1; i >= 0; i--) {
            const bullet = this.invaderBullets[i];
            if (this.collision(bullet, this.player)) {
                this.gameOver();
                return;
            }
        }
        
        // Invaders vs Player (collision)
        for (let invader of this.invaders) {
            if (invader.alive && this.collision(invader, this.player)) {
                this.gameOver();
                return;
            }
            
            // Invaders reached bottom
            if (invader.alive && invader.y + invader.height >= this.player.y) {
                this.gameOver();
                return;
            }
        }
    }
    
    collision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    nextLevel() {
        this.level++;
        this.invaderSpeed = 1 + this.level * 0.3;
        this.invaderShootDelay = Math.max(60, this.invaderShootDelay - 10);
        this.createInvaders();
        
        // Bonus points for completing level
        this.score += this.level * 50;
        this.updateScore();
    }
    
    updateScore() {
        const scoreElement = document.getElementById('game-score');
        if (scoreElement) {
            scoreElement.textContent = this.score.toString().padStart(4, '0');
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // Show game over screen
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = 'bold 16px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 20);
        
        this.ctx.fillStyle = '#9bbc0f';
        this.ctx.font = 'bold 12px monospace';
        this.ctx.fillText(`FINAL SCORE: ${this.score}`, this.width / 2, this.height / 2 + 10);
        
        this.ctx.fillStyle = '#8b956d';
        this.ctx.font = '10px monospace';
        this.ctx.fillText('PRESS EXIT TO RETURN', this.width / 2, this.height / 2 + 40);
    }
    
    draw() {
        // Clear canvas with Game Boy green
        this.ctx.fillStyle = '#0f380f';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        if (!this.gameRunning) return;
        
        // Draw player
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw player bullets
        for (let bullet of this.bullets) {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // Draw invaders
        for (let invader of this.invaders) {
            if (invader.alive) {
                this.ctx.fillStyle = invader.color;
                this.ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
            }
        }
        
        // Draw invader bullets
        for (let bullet of this.invaderBullets) {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
    }
    
    gameLoop(currentTime) {
        if (currentTime - this.lastTime > 16) { // ~60 FPS
            this.update();
            this.draw();
            this.lastTime = currentTime;
        }
        
        if (this.gameRunning) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
    
    start() {
        this.gameRunning = true;
        this.score = 0;
        this.level = 1;
        this.invaderSpeed = 1;
        this.invaderShootDelay = 120;
        this.bullets = [];
        this.invaderBullets = [];
        this.invaderShootTimer = 0;
        this.player.x = this.width / 2 - 15;
        
        this.createInvaders();
        this.updateScore();
        this.gameLoop(0);
    }
    
    stop() {
        this.gameRunning = false;
    }
}

// Game initialization and control
let spaceInvadersGame = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize game when DOM is ready
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
        spaceInvadersGame = new SpaceInvaders(canvas);
    }
    
    // Press Start button functionality
    const pressStartBtn = document.getElementById('press-start-btn');
    const gameContainer = document.getElementById('space-invaders-game');
    
    if (pressStartBtn && gameContainer) {
        pressStartBtn.addEventListener('click', () => {
            gameContainer.classList.add('active');
            if (spaceInvadersGame) {
                spaceInvadersGame.start();
            }
        });
    }
    
    // Exit game functionality
    const exitBtn = document.getElementById('exit-game');
    if (exitBtn && gameContainer) {
        exitBtn.addEventListener('click', () => {
            gameContainer.classList.remove('active');
            if (spaceInvadersGame) {
                spaceInvadersGame.stop();
            }
        });
    }
});