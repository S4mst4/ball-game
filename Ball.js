class Ball {
    constructor(x, y, radius, color, dx, dy) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.dx = dx;
        this.dy = dy;
        this.active = true;
        this.hasShield = false;
        this.shieldTimer = 0;
        this.isStuck = false;
        this.isInvisible = false;
        this.invisibleTimer = 0;    // Add timer for invisible duration
        this.stuckToOriginal = false;
        this.stuckTimer = 0;    // Add timer for stuck duration
        this.broken = false;  // Add new property for broken state
        this.inBin = false;
        this.binTimer = 0;
        this.originalX = x;
        this.originalY = y;
        this.binX = 0;  // Will be set when moving to bin
        this.binY = 0;
        this.frozen = false;  // Add this new property
        this.frozenTimer = 0;
    }

    draw(ctx) {
        if (this.isInvisible) return;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Draw shield if active
        if (this.hasShield) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
            ctx.lineWidth = 4;
            ctx.stroke();
        }
        
        // Add freeze effect
        if (this.frozen) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 191, 255, 0.7)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        ctx.closePath();
    }

    update(canvas, balls) {
        if (this.frozen || this.broken || this.inBin) {
            if (this.frozen) {
                this.frozenTimer--;
                if (this.frozenTimer <= 0) {
                    this.frozen = false;
                }
                return;  // Don't update position if frozen
            }

            if (this.inBin) {
                this.binTimer--;
                if (this.binTimer <= 0) {
                    this.inBin = false;
                    this.broken = false;
                    const newPos = getRandomPosition(canvas, this.radius);
                    this.x = newPos.x;
                    this.y = newPos.y;
                    this.originalX = newPos.x;
                    this.originalY = newPos.y;
                    this.dx = getRandomSpeed();
                    this.dy = getRandomSpeed();
                    
                    // Create simple revival effect
                    for (let i = 0; i < 10; i++) {
                        const cloud = new Cloud(this.x, this.y);
                        cloud.color = '#FF0000';
                        cloud.dx = (Math.random() - 0.5) * 8;
                        cloud.dy = (Math.random() - 0.5) * 8;
                        cloud.radius = this.radius / 2;
                        clouds.push(cloud);
                    }
                    
                    ballsInBin--;
                    binCountElement.textContent = ballsInBin;
                }
                return;
            }

            if (this.broken && !this.inBin) {
                const binRect = document.querySelector('.bin').getBoundingClientRect();
                const canvasRect = canvas.getBoundingClientRect();
                this.binX = binRect.left - canvasRect.left + binRect.width/2;
                this.binY = binRect.top - canvasRect.top + binRect.height/2;

                const dx = this.binX - this.x;
                const dy = this.binY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 5) {
                    this.inBin = true;
                    this.binTimer = 900;
                    this.x = this.binX;
                    this.y = this.binY;
                    ballsInBin++;
                    binCountElement.textContent = ballsInBin;
                } else {
                    const speed = 10;
                    this.x += (dx / distance) * speed;
                    this.y += (dy / distance) * speed;
                }
                return;
            }

            // Update shield timer
            if (this.hasShield) {
                this.shieldTimer--;
                if (this.shieldTimer <= 0) {
                    this.hasShield = false;
                    this.isStuck = false;
                }
            }

            // Update stuck timer
            if (this.stuckTimer > 0) {
                this.stuckTimer--;
                if (this.stuckTimer <= 0) {
                    this.isStuck = false;
                }
            }

            // Update invisible timer
            if (this.invisibleTimer > 0) {
                this.invisibleTimer--;
                if (this.invisibleTimer <= 0) {
                    this.isInvisible = false;
                }
            }

            // Don't update position if ball is stuck
            if (this.isStuck) return;

            // Increase base speed increase factor
            const speedIncrease = 1.3; // Changed from 1.1 to 1.3 for more bounciness

            // Allow movement even when stuck (but at reduced speed)
            const stuckSpeedMultiplier = this.isStuck ? 0.3 : 1;
            
            // Bounce off walls with more energy
            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
                this.dx = -this.dx * speedIncrease;
            }
            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
                this.dy = -this.dy * speedIncrease;
            }

            // Ball-to-ball collision
            balls.forEach(otherBall => {
                if (otherBall === this) return;
                if (this.isInvisible) return;

                const dx = otherBall.x - this.x;
                const dy = otherBall.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.radius + otherBall.radius && this.color !== otherBall.color) {
                    this.dx = -this.dx * speedIncrease;
                    this.dy = -this.dy * speedIncrease;
                    otherBall.dx = -otherBall.dx * speedIncrease;
                    otherBall.dy = -otherBall.dy * speedIncrease;
                }
            });

            // Increase max speed limit
            const maxSpeed = 25; // Increased from 15 to 25
            const currentSpeed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
            if (currentSpeed > maxSpeed) {
                const scale = maxSpeed / currentSpeed;
                this.dx *= scale;
                this.dy *= scale;
            }

            // Update position with stuck speed multiplier
            this.x += this.dx * stuckSpeedMultiplier;
            this.y += this.dy * stuckSpeedMultiplier;
        } else {
            // Update timers and handle stuck behavior
            if (this.frozen) {
                this.frozenTimer--;
                if (this.frozenTimer <= 0) {
                    this.frozen = false;
                }
                return;  // Don't update position if frozen
            }

            if (this.inBin) {
                this.binTimer--;
                if (this.binTimer <= 0) {
                    this.inBin = false;
                    this.broken = false;
                    const newPos = getRandomPosition(canvas, this.radius);
                    this.x = newPos.x;
                    this.y = newPos.y;
                    this.originalX = newPos.x;
                    this.originalY = newPos.y;
                    this.dx = getRandomSpeed();
                    this.dy = getRandomSpeed();
                    
                    // Create simple revival effect
                    for (let i = 0; i < 10; i++) {
                        const cloud = new Cloud(this.x, this.y);
                        cloud.color = '#FF0000';
                        cloud.dx = (Math.random() - 0.5) * 8;
                        cloud.dy = (Math.random() - 0.5) * 8;
                        cloud.radius = this.radius / 2;
                        clouds.push(cloud);
                    }
                    
                    ballsInBin--;
                    binCountElement.textContent = ballsInBin;
                }
                return;
            }

            if (this.broken && !this.inBin) {
                const binRect = document.querySelector('.bin').getBoundingClientRect();
                const canvasRect = canvas.getBoundingClientRect();
                this.binX = binRect.left - canvasRect.left + binRect.width/2;
                this.binY = binRect.top - canvasRect.top + binRect.height/2;

                const dx = this.binX - this.x;
                const dy = this.binY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 5) {
                    this.inBin = true;
                    this.binTimer = 900;
                    this.x = this.binX;
                    this.y = this.binY;
                    ballsInBin++;
                    binCountElement.textContent = ballsInBin;
                } else {
                    const speed = 10;
                    this.x += (dx / distance) * speed;
                    this.y += (dy / distance) * speed;
                }
                return;
            }

            // Update shield timer
            if (this.hasShield) {
                this.shieldTimer--;
                if (this.shieldTimer <= 0) {
                    this.hasShield = false;
                    this.isStuck = false;
                }
            }

            // Update stuck timer
            if (this.stuckTimer > 0) {
                this.stuckTimer--;
                if (this.stuckTimer <= 0) {
                    this.isStuck = false;
                }
            }

            // Update invisible timer
            if (this.invisibleTimer > 0) {
                this.invisibleTimer--;
                if (this.invisibleTimer <= 0) {
                    this.isInvisible = false;
                }
            }

            // Don't update position if ball is stuck
            if (this.isStuck) return;

            // Keep normal bouncing behavior
            const speedIncrease = 1.3;
            const stuckSpeedMultiplier = this.isStuck ? 0.3 : 1;
            
            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
                this.dx = -this.dx * speedIncrease;
            }
            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
                this.dy = -this.dy * speedIncrease;
            }

            // Ball-to-ball collision
            balls.forEach(otherBall => {
                if (otherBall === this) return;
                if (this.isInvisible) return;

                const dx = otherBall.x - this.x;
                const dy = otherBall.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.radius + otherBall.radius && this.color !== otherBall.color) {
                    this.dx = -this.dx * speedIncrease;
                    this.dy = -this.dy * speedIncrease;
                    otherBall.dx = -otherBall.dx * speedIncrease;
                    otherBall.dy = -otherBall.dy * speedIncrease;
                }
            });

            // Increase max speed limit
            const maxSpeed = 25;
            const currentSpeed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
            if (currentSpeed > maxSpeed) {
                const scale = maxSpeed / currentSpeed;
                this.dx *= scale;
                this.dy *= scale;
            }

            // Update position
            this.x += this.dx * stuckSpeedMultiplier;
            this.y += this.dy * stuckSpeedMultiplier;
        }

        // Add spike collision check for all balls
        spikes.forEach(spike => {
            const dx = this.x - spike.x;
            const dy = this.y - spike.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.radius + spike.size) {
                // Calculate impact speed
                const impactSpeed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
                
                if (impactSpeed > 8 && !this.isPlayer) {  // Break if hitting spikes too fast
                    this.broken = true;
                    
                    // Create impact effect
                    for (let i = 0; i < 10; i++) {
                        const particle = new Cloud(this.x, this.y);
                        particle.color = '#FF4444';  // Red color
                        particle.dx = (Math.random() - 0.5) * 8;
                        particle.dy = (Math.random() - 0.5) * 8;
                        particle.radius = 3;
                        particle.fadeSpeed = 0.04;
                        clouds.push(particle);
                    }
                } else {
                    // Normal bounce with speed loss
                    const angle = Math.atan2(dy, dx);
                    const bounceSpeed = impactSpeed * 0.7;  // Lose some speed on bounce
                    this.dx = Math.cos(angle) * bounceSpeed;
                    this.dy = Math.sin(angle) * bounceSpeed;
                }
            }
        });
    }

    createCollisionCloud(ctx, x, y) {
        for (let i = 0; i < 5; i++) {
            const cloud = new Cloud(x, y);
            clouds.push(cloud);
        }
    }
}
