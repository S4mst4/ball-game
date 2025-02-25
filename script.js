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
        this.health = 300;  // Changed from 100 to 300 for regular balls
        this.isPlayer = false;  // Flag to distinguish regular balls from players
        this.isSpiky = false;
        this.spikyTimer = 0;
        this.rotationAngle = 0;  // Add rotation angle
        this.rotationSpeed = 0;  // Add rotation speed
        this.teleportCooldown = 0;  // Add teleport cooldown for spiky balls
    }

    draw(ctx) {
        if (this.isInvisible) return;
        
        if (this.isSpiky) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotationAngle);
            
            // Draw spiky ball
            ctx.beginPath();
            ctx.moveTo(this.radius * Math.cos(0), this.radius * Math.sin(0));
            
            // Draw spikes
            for (let i = 0; i < 12; i++) {
                const angle = (i * Math.PI * 2) / 12;
                const spikeOuterAngle = angle + Math.PI / 12;
                const spikeInnerAngle = angle - Math.PI / 12;
                
                // Outer spike point
                const outerX = (this.radius * 1.5) * Math.cos(angle);
                const outerY = (this.radius * 1.5) * Math.sin(angle);
                
                // Inner points for triangular spikes
                const innerX1 = this.radius * Math.cos(spikeInnerAngle);
                const innerY1 = this.radius * Math.sin(spikeInnerAngle);
                const innerX2 = this.radius * Math.cos(spikeOuterAngle);
                const innerY2 = this.radius * Math.sin(spikeOuterAngle);
                
                ctx.lineTo(innerX1, innerY1);
                ctx.lineTo(outerX, outerY);
                ctx.lineTo(innerX2, innerY2);
            }
            
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
            
            // Add sawblade effect
            ctx.strokeStyle = '#808080';  // Metallic color for saw teeth
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Add glow effect
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0;
            
            ctx.restore();

            // Draw health bar for spiky balls
            const healthBarWidth = 30;  // Reduced from 50 to 30
            const healthBarHeight = 4;  // Reduced from 6 to 4
            const barX = this.x - healthBarWidth / 2;
            const barY = this.y - this.radius * 2 - 10;  // Position higher above the ball

            // Draw background (empty health bar)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';  // Darker background for spiky ball health bar
            ctx.fillRect(barX, barY, healthBarWidth, healthBarHeight);

            // Draw health fill
            const healthPercentage = this.health / 500;  // Using 500 as max health for spiky balls
            const fillWidth = healthBarWidth * healthPercentage;
            
            // Special color gradient for spiky ball health
            let fillColor;
            if (healthPercentage > 0.6) {
                fillColor = '#FF4500';  // Orange-red for high health
            } else if (healthPercentage > 0.3) {
                fillColor = '#FF8C00';  // Dark orange for medium health
            } else {
                fillColor = '#FF0000';  // Red for low health
            }

            ctx.fillStyle = fillColor;
            ctx.fillRect(barX, barY, fillWidth, healthBarHeight);

            // Draw metallic border
            ctx.strokeStyle = '#C0C0C0';  // Metallic silver border
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, healthBarWidth, healthBarHeight);
        } else {
            // Draw normal ball
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        
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
        
        // Draw health bar for regular balls (not players and not spiky)
        if (!this.isPlayer && !this.broken && !this.inBin && !this.isSpiky) {
            const healthBarWidth = 40;
            const healthBarHeight = 4;
            const barX = this.x - healthBarWidth / 2;
            const barY = this.y - this.radius - 10;

            // Draw background (empty health bar)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(barX, barY, healthBarWidth, healthBarHeight);

            // Draw health fill
            const healthPercentage = this.health / 300;
            const fillWidth = healthBarWidth * healthPercentage;
            
            // Color gradient based on health
            let fillColor;
            if (healthPercentage > 0.6) {
                fillColor = '#00FF00';  // Green for high health
            } else if (healthPercentage > 0.3) {
                fillColor = '#FFA500';  // Orange for medium health
            } else {
                fillColor = '#FF0000';  // Red for low health
            }

            ctx.fillStyle = fillColor;
            ctx.fillRect(barX, barY, fillWidth, healthBarHeight);

            // Draw border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, healthBarWidth, healthBarHeight);
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

            // Don't process bin movement if the ball is spiky
            if (this.isSpiky) {
                this.broken = false;
                this.inBin = false;
                return;
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
                    this.health = 300;  // Restore full health when coming out of bin
                    
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
                if (this.isSpiky) return; // Skip collision if this ball is spiky
                if (otherBall.isSpiky) return; // Skip collision if other ball is spiky

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
                    this.health = 300;  // Restore full health when coming out of bin
                    
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
                if (this.isSpiky) return; // Skip collision if this ball is spiky
                if (otherBall.isSpiky) return; // Skip collision if other ball is spiky

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

        // Add collision damage between balls
        if (!this.isPlayer && !this.broken && !this.inBin) {
            balls.forEach(otherBall => {
                if (otherBall !== this && !otherBall.broken && !otherBall.inBin) {
                    const dx = otherBall.x - this.x;
                    const dy = otherBall.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < this.radius + otherBall.radius) {
                        const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
                        if (speed > 15) { // Only damage on high-speed collisions
                            this.takeDamage(speed * 2);
                            otherBall.takeDamage(speed * 2);
                        }
                    }
                }
            });
        }

        // Update spiky timer and rotation
        if (this.isSpiky) {
            this.rotationAngle += this.rotationSpeed; // Spin the spiky ball
            this.spikyTimer--;
            
            // Handle teleportation
            if (this.teleportCooldown > 0) {
                this.teleportCooldown--;
            } else {
                // Teleport to a random position
                const newPos = getRandomPosition(canvas, this.radius);
                
                // Create disappear effect at current position
                for (let i = 0; i < 15; i++) {
                    const particle = new Cloud(this.x, this.y);
                    particle.color = this.color;
                    const angle = (Math.PI * 2 * i) / 15;
                    const speed = 6;
                    particle.dx = Math.cos(angle) * speed;
                    particle.dy = Math.sin(angle) * speed;
                    particle.radius = 3;
                    particle.fadeSpeed = 0.04;
                    clouds.push(particle);
                }
                
                this.x = newPos.x;
                this.y = newPos.y;
                
                // Create appear effect at new position
                for (let i = 0; i < 15; i++) {
                    const particle = new Cloud(this.x, this.y);
                    particle.color = this.color;
                    const angle = (Math.PI * 2 * i) / 15;
                    const speed = 6;
                    particle.dx = Math.cos(angle) * speed;
                    particle.dy = Math.sin(angle) * speed;
                    particle.radius = 3;
                    particle.fadeSpeed = 0.04;
                    clouds.push(particle);
                }
                
                // Heal 50 health
                this.health = Math.min(300, this.health + 50);
                
                // Create healing effect
                for (let i = 0; i < 10; i++) {
                    const healParticle = new Cloud(this.x, this.y);
                    healParticle.color = '#00FF00';  // Green healing particles
                    healParticle.dx = (Math.random() - 0.5) * 4;
                    healParticle.dy = (Math.random() - 0.5) * 4;
                    healParticle.radius = 3;
                    healParticle.fadeSpeed = 0.03;
                    clouds.push(healParticle);
                }
                
                this.teleportCooldown = 120; // Reset cooldown (2 seconds at 60fps)
            }
            
            // Bounce off walls with more energy
            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
                this.dx = -this.dx * 1.2;
            }
            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
                this.dy = -this.dy * 1.2;
            }
            
            // Update position
            this.x += this.dx;
            this.y += this.dy;

            // Check collision with other balls while spiky
            balls.forEach(otherBall => {
                if (otherBall !== this && !otherBall.broken && !otherBall.inBin && !otherBall.isSpiky) {
                    const dx = otherBall.x - this.x;
                    const dy = otherBall.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < this.radius * 1.5 + otherBall.radius) {
                        if (otherBall.isPlayer) {
                            // Deal 30 damage to players
                            otherBall.takeDamage(30);
                            
                            // Create sawing effect
                            for (let i = 0; i < 10; i++) {
                                const spark = new Cloud(otherBall.x, otherBall.y);
                                spark.color = '#FFA500';  // Orange sparks
                                spark.dx = (Math.random() - 0.5) * 15;
                                spark.dy = (Math.random() - 0.5) * 15;
                                spark.radius = 2;
                                spark.fadeSpeed = 0.05;
                                clouds.push(spark);
                            }
                        }
                        
                        // Bounce off other balls with increased energy
                        const angle = Math.atan2(dy, dx);
                        const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy) * 1.1;
                        this.dx = Math.cos(angle) * -speed;
                        this.dy = Math.sin(angle) * -speed;
                    }
                }
            });

            if (this.spikyTimer <= 0) {
                this.isSpiky = false;
                this.rotationSpeed = 0;
                // Reduce speed when returning to normal
                this.dx *= 0.5;
                this.dy *= 0.5;
            }
            return;
        }
    }

    createCollisionCloud(ctx, x, y) {
        for (let i = 0; i < 5; i++) {
            const cloud = new Cloud(x, y);
            clouds.push(cloud);
        }
    }

    // Add method to handle ball damage
    takeDamage(amount) {
        if (this.isPlayer) return; // Don't apply this to players
        
        this.health -= amount;
        
        // Create hit effect
        for (let i = 0; i < 5; i++) {
            const particle = new Cloud(this.x, this.y);
            particle.color = this.color;
            particle.dx = (Math.random() - 0.5) * 5;
            particle.dy = (Math.random() - 0.5) * 5;
            particle.radius = 2;
            particle.fadeSpeed = 0.05;
            clouds.push(particle);
        }

        // Turn ball spiky if damage is 10 or more and ball isn't already spiky
        if (amount >= 10 && !this.isSpiky && !this.broken && !this.isPlayer) {  // Added !this.isPlayer check
            // Store current velocity but increase it for more dynamic movement
            const oldDx = this.dx * 1.5;
            const oldDy = this.dy * 1.5;

            // Create transformation effect
            for (let i = 0; i < 360; i += 30) {
                const angle = (i * Math.PI) / 180;
                const shockwave = new Cloud(this.x, this.y);
                shockwave.color = '#FFFFFF';
                shockwave.dx = Math.cos(angle) * 12;
                shockwave.dy = Math.sin(angle) * 12;
                shockwave.radius = 2;
                shockwave.fadeSpeed = 0.04;
                clouds.push(shockwave);
            }

            // Make the ball spiky and set its movement
            this.isSpiky = true;
            this.spikyTimer = 600; // 10 seconds at 60fps
            this.dx = oldDx * 0.25; // Quarter the speed for spiky balls (changed from 0.5)
            this.dy = oldDy * 0.25;
            this.rotationSpeed = 0.3; // Fast rotation speed
            this.health = 500; // Set health to 500 when becoming spiky
            this.broken = false; // Ensure the ball isn't marked as broken when becoming spiky
            
            // Add blood stain
            const bloodStain = new BloodStain(this.x, this.y, this.color);
            bloodStains.push(bloodStain);
            return;
        }

        // Critical explosion at 10 health
        if (this.health <= 10 && !this.broken && !this.isSpiky) {
            // Create explosion effect
            for (let i = 0; i < 20; i++) {
                const angle = (Math.PI * 2 * i) / 20;
                const speed = 8 + Math.random() * 4;
                const particle = new Cloud(this.x, this.y);
                particle.color = this.color;
                particle.dx = Math.cos(angle) * speed;
                particle.dy = Math.sin(angle) * speed;
                particle.radius = 4;
                particle.fadeSpeed = 0.02;
                clouds.push(particle);
            }

            // Add shockwave
            for (let i = 0; i < 360; i += 30) {
                const angle = (i * Math.PI) / 180;
                const particle = new Cloud(this.x, this.y);
                particle.color = '#FFFFFF';
                particle.dx = Math.cos(angle) * 12;
                particle.dy = Math.sin(angle) * 12;
                particle.radius = 2;
                particle.fadeSpeed = 0.04;
                clouds.push(particle);
            }

            this.broken = true;
        }
    }
}

class Cloud {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 10 + 5;
        this.life = 1;
        this.dx = (Math.random() - 0.5) * 2;
        this.dy = (Math.random() - 0.5) * 2;
        this.color = 'rgba(150, 150, 150, 1)';
        this.expandSpeed = 0.2;  // Default expand speed
        this.fadeSpeed = 0.02;   // Default fade speed
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (this.color.startsWith('rgba')) {
            ctx.fillStyle = this.color.replace('1)', `${this.life})`);
        } else {
            ctx.fillStyle = this.color.replace('rgb', 'rgba').replace(')', `,${this.life})`);
        }
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.life -= this.fadeSpeed;
        this.x += this.dx;
        this.y += this.dy;
        this.radius += this.expandSpeed;
    }
}

// Add new BloodStain class after Cloud class
class BloodStain {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 15 + 5;
        this.color = color;
        this.alpha = 0.8;
        this.fadeSpeed = 0.0005; // Very slow fade
        this.splatterPoints = [];
        
        // Create random splatter points around the center
        const numPoints = Math.floor(Math.random() * 5) + 5;
        for (let i = 0; i < numPoints; i++) {
            const angle = (Math.PI * 2 * i) / numPoints;
            const distance = this.radius * (0.5 + Math.random() * 0.5);
            this.splatterPoints.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                radius: this.radius * (0.2 + Math.random() * 0.3)
            });
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Draw main blood pool
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Draw splatter points
        this.splatterPoints.forEach(point => {
            ctx.beginPath();
            ctx.arc(
                this.x + point.x, 
                this.y + point.y, 
                point.radius, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
        });
        
        ctx.restore();
    }

    update() {
        this.alpha -= this.fadeSpeed;
        return this.alpha > 0;
    }
}

// Add bloodStains array after clouds array declaration
const bloodStains = [];

// Add Lightning class after Cloud class
class Lightning {
    constructor(startX, startY, endX, endY) {
        this.start = { x: startX, y: startY };
        this.end = { x: endX, y: endY };
        this.segments = this.generateSegments();
        this.life = 1;
        this.branches = [];
        
        // Generate 1-3 branches
        const numBranches = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numBranches; i++) {
            this.branches.push(this.generateSegments());
        }
    }

    generateSegments() {
        const segments = [];
        let currentPoint = { ...this.start };
        const dx = this.end.x - this.start.x;
        const dy = this.end.y - this.start.y;
        const steps = 8;
        
        for (let i = 0; i < steps; i++) {
            const nextPoint = {
                x: this.start.x + (dx * (i + 1)) / steps + (Math.random() - 0.5) * 20,
                y: this.start.y + (dy * (i + 1)) / steps + (Math.random() - 0.5) * 20
            };
            segments.push({ start: { ...currentPoint }, end: { ...nextPoint } });
            currentPoint = { ...nextPoint };
        }
        return segments;
    }

    draw(ctx) {
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 0, ${this.life})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
        ctx.shadowBlur = 15;
        
        // Draw main lightning bolt
        this.segments.forEach(segment => {
            ctx.beginPath();
            ctx.moveTo(segment.start.x, segment.start.y);
            ctx.lineTo(segment.end.x, segment.end.y);
            ctx.stroke();
        });
        
        // Draw branches with reduced opacity
        ctx.strokeStyle = `rgba(255, 215, 0, ${this.life * 0.6})`;
        this.branches.forEach(branch => {
            branch.forEach(segment => {
                ctx.beginPath();
                ctx.moveTo(segment.start.x, segment.start.y);
                ctx.lineTo(segment.end.x, segment.end.y);
                ctx.stroke();
            });
        });
        
        ctx.restore();
    }

    update() {
        this.life -= 0.1;
        return this.life > 0;
    }
}

// Add lightnings array after bloodStains array
const lightnings = [];

// Add new Spike class
class Spike {
    constructor(x, y, size, direction) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.direction = direction; // 'left', 'right', 'up', or 'down'
    }

    draw(ctx) {
        ctx.beginPath();
        
        switch(this.direction) {
            case 'left':
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - this.size, this.y - this.size);
                ctx.lineTo(this.x - this.size, this.y + this.size);
                break;
            case 'right':
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.size, this.y - this.size);
                ctx.lineTo(this.x + this.size, this.y + this.size);
                break;
            case 'up':
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - this.size, this.y - this.size);
                ctx.lineTo(this.x + this.size, this.y - this.size);
                break;
            case 'down':
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - this.size, this.y + this.size);
                ctx.lineTo(this.x + this.size, this.y + this.size);
                break;
        }
        
        ctx.closePath();
        ctx.fillStyle = '#FF4444';
        ctx.fill();
    }
}

// Modify Wall class to include spikes
class Wall {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.spikes = [];
        
        // Add spikes along the wall
        const spikeSize = 8;
        const spikeSpacing = 50;
        
        if (width > height) {
            // Horizontal wall - spikes on both sides
            for (let i = spikeSize; i < width - spikeSize; i += spikeSpacing) {
                // Top spikes
                this.spikes.push(new Spike(x + i, y, spikeSize, 'up'));
                // Bottom spikes
                this.spikes.push(new Spike(x + i, y + height, spikeSize, 'down'));
            }
        } else {
            // Vertical wall - spikes on both sides
            for (let i = spikeSize; i < height - spikeSize; i += spikeSpacing) {
                // Left spikes
                this.spikes.push(new Spike(x, y + i, spikeSize, 'left'));
                // Right spikes
                this.spikes.push(new Spike(x + width, y + i, spikeSize, 'right'));
            }
        }
    }

    draw(ctx) {
        // Draw wall
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw spikes
        this.spikes.forEach(spike => spike.draw(ctx));
    }

    checkCollision(ball) {
        const ballLeft = ball.x - ball.radius;
        const ballRight = ball.x + ball.radius;
        const ballTop = ball.y - ball.radius;
        const ballBottom = ball.y + ball.radius;

        if (ballRight > this.x && ballLeft < this.x + this.width &&
            ballBottom > this.y && ballTop < this.y + this.height) {
            
            // Determine which side was hit
            const left = ballRight - this.x;
            const right = (this.x + this.width) - ballLeft;
            const top = ballBottom - this.y;
            const bottom = (this.y + this.height) - ballTop;
            const min = Math.min(left, right, top, bottom);

            // Slow down factor
            const slowDown = 0.7;

            if (min === left || min === right) {
                ball.dx = -ball.dx * slowDown;
                ball.x = (min === left) ? this.x - ball.radius : this.x + this.width + ball.radius;
            } else {
                ball.dy = -ball.dy * slowDown;
                ball.y = (min === top) ? this.y - ball.radius : this.y + this.height + ball.radius;
            }

            // Create collision cloud
            for (let i = 0; i < 5; i++) {
                const cloud = new Cloud(ball.x, ball.y);
                clouds.push(cloud);
            }
        }

        // Modify spike collision check to only boost speed, no breaking
        this.spikes.forEach(spike => {
            const dx = ball.x - spike.x;
            const dy = ball.y - (spike.y + spike.size/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < ball.radius + spike.size) {
                if (ball.isPlayer) {
                    ball.speed = ball.boostedSpeed * 3;
                    ball.speedBoostTimer = 60;
                    
                    // Create clearer screen-wide fog effect
                    const numFogLayers = 12;
                    for (let i = 0; i < numFogLayers; i++) {
                        const cloud = new Cloud(
                            Math.random() * canvas.width,
                            Math.random() * canvas.height
                        );
                        cloud.life = 1;
                        cloud.color = 'rgba(255, 255, 255, 0.6)';
                        cloud.dx = (Math.random() - 0.5) * 0.5;
                        cloud.dy = (Math.random() - 0.5) * 0.5;
                        cloud.radius = canvas.width / 3;
                        cloud.expandSpeed = 0.4;
                        cloud.fadeSpeed = 0.008;
                        clouds.push(cloud);
                    }
                    
                    // Add brighter central burst effect
                    for (let i = 0; i < 20; i++) {
                        const sparkle = new Cloud(ball.x, ball.y);
                        sparkle.life = 1;
                        sparkle.color = '#FFFFFF';
                        sparkle.dx = (Math.random() - 0.5) * 15;
                        sparkle.dy = (Math.random() - 0.5) * 15;
                        sparkle.radius = 4;
                        sparkle.fadeSpeed = 0.02;
                        clouds.push(sparkle);
                    }
                } else {
                    // Normal bounce for other balls
                    ball.dx = -ball.dx * 1.2;
                    ball.dy = -ball.dy * 1.2;
                    
                    // Create regular collision effect
                    for (let i = 0; i < 8; i++) {
                        const cloud = new Cloud(ball.x, ball.y);
                        cloud.life = 1;
                        clouds.push(cloud);
                    }
                }
            }
        });
    }
}

// Setup canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Function to generate random color in rainbow spectrum
function getRandomRainbowColor() {
    const hue = Math.random() * 360;
    return `hsl(${hue}, 70%, 50%)`;
}

// Function to get random speed between -5 and 5, but not 0
function getRandomSpeed() {
    let speed = (Math.random() * 3 - 1.5);  // Changed from 6-3 to 3-1.5
    return speed === 0 ? 0.5 : speed;  // Changed from 1 to 0.5
}

const balls = [];
const clouds = []; // Array to store collision clouds
const numberOfBallsPerColor = 2;  // Now we want 2 balls per color
const fixedRadius = 20;

// Define specific colors
const ballColors = [
    '#008080', // teal
    '#FFA500', // orange
    '#0000FF', // blue
    '#00FF00', // lime
    '#FF0000', // red
    '#FFFF00', // yellow
    '#FFFFFF', // white
    '#000000', // black
    '#8B4513', // brown
    '#C8A2C8'  // lila
];

// Create balls with two of each color
ballColors.forEach(color => {
    for (let i = 0; i < numberOfBallsPerColor; i++) {
        const x = Math.random() * (canvas.width - fixedRadius * 2) + fixedRadius;
        const y = Math.random() * (canvas.height - fixedRadius * 2) + fixedRadius;
        const dx = getRandomSpeed();
        const dy = getRandomSpeed();
        
        balls.push(new Ball(x, y, fixedRadius, color, dx, dy));
    }
});

// Add after other ball creation code

// Add after canvas setup
const GLOBAL_FREEZE_INTERVAL = 6000; // 100 seconds at 60fps
const GLOBAL_FREEZE_DURATION = 600;  // 10 seconds at 60fps
let globalFreezeTimer = GLOBAL_FREEZE_INTERVAL;
let globalFreezeDuration = 0;
let isGloballyFrozen = false;

// After the canvas setup, add:
const timerFill = document.querySelector('.timer-fill');
const timerText = document.querySelector('.timer-text');

// Add after other global variables
let ballsInBin = 0;  // Track current number of balls in bin
const binCountElement = document.querySelector('.bin-count');

// Add this helper function for random position
function getRandomPosition(canvas, radius) {
    return {
        x: Math.random() * (canvas.width - radius * 2) + radius,
        y: Math.random() * (canvas.height - radius * 2) + radius
    };
}

// Add after other global variables
const spikes = [];
const spikeSize = 20;
const spikeSpacing = 50;  // Changed from 100 to 50 for twice as many spikes

// Add this function to create spikes
function createSpikes() {
    // Top spikes
    for (let x = spikeSpacing; x < canvas.width - spikeSpacing; x += spikeSpacing) {
        spikes.push(new Spike(x, 0, spikeSize, 'down'));
    }
    
    // Bottom spikes
    for (let x = spikeSpacing; x < canvas.width - spikeSpacing; x += spikeSpacing) {
        spikes.push(new Spike(x, canvas.height, spikeSize, 'up'));
    }
    
    // Left spikes
    for (let y = spikeSpacing; y < canvas.height - spikeSpacing; y += spikeSpacing) {
        spikes.push(new Spike(0, y, spikeSize, 'right'));
    }
    
    // Right spikes
    for (let y = spikeSpacing; y < canvas.height - spikeSpacing; y += spikeSpacing) {
        spikes.push(new Spike(canvas.width, y, spikeSize, 'left'));
    }
}

// Call createSpikes after canvas setup
createSpikes();

// Modify the animation loop
function animate() {
    // Fill background with purple instead of black
    ctx.fillStyle = '#4B0082';  // Indigo purple
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Handle global freeze timer
    if (!isGloballyFrozen) {
        globalFreezeTimer--;
        // Update scorebar
        const percentage = (globalFreezeTimer / GLOBAL_FREEZE_INTERVAL) * 100;
        timerFill.style.height = `${percentage}%`;
        timerText.textContent = `${Math.ceil(globalFreezeTimer / 60)} seconds`;
    }

    if (globalFreezeTimer <= 0) {
        globalFreezeTimer = GLOBAL_FREEZE_INTERVAL;
        isGloballyFrozen = true;
        globalFreezeDuration = GLOBAL_FREEZE_DURATION;
        timerText.textContent = 'FROZEN!';
        timerFill.style.backgroundColor = '#2196F3'; // Blue for frozen state
    }

    // Handle global freeze duration
    if (isGloballyFrozen) {
        globalFreezeDuration--;
        if (globalFreezeDuration <= 0) {
            isGloballyFrozen = false;
            timerFill.style.backgroundColor = '#4CAF50'; // Back to green
        }
    }

    // Draw blood stains first so they appear under everything else
    bloodStains.forEach((stain, index) => {
        if (!stain.update()) {
            bloodStains.splice(index, 1);
        } else {
            stain.draw(ctx);
        }
    });

    // Update and draw clouds
    for (let i = clouds.length - 1; i >= 0; i--) {
        clouds[i].update();
        clouds[i].draw(ctx);
        if (clouds[i].life <= 0) {
            clouds.splice(i, 1);
        }
    }

    // Update and draw lightning effects
    for (let i = lightnings.length - 1; i >= 0; i--) {
        if (!lightnings[i].update()) {
            lightnings.splice(i, 1);
        } else {
            lightnings[i].draw(ctx);
        }
    }

    // Draw spikes
    spikes.forEach(spike => {
        spike.draw(ctx);
    });

    // Update and draw balls
    balls.forEach(ball => {
        if (ball.active) {
            // Only update if not globally frozen
            if (!isGloballyFrozen) {
                ball.update(canvas, balls);
            }
            ball.draw(ctx);

            // Draw freeze indicator when globally frozen
            if (isGloballyFrozen) {
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius + 5, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(0, 191, 255, 0.7)'; // Light blue for freeze effect
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    });

    requestAnimationFrame(animate);
}

// Start animation
animate();

// Modify Player class to remove spear functionality
class Player extends Ball {
    constructor(x, y, radius) {
        super(x, y, radius, '#C0C0C0', 0, 0);
        this.speed = 28;           // Changed from 14 to 28
        this.isPlayer = true;
        this.speedBoostActive = false;  // New flag for toggle state
        this.normalSpeed = 28;     // Changed from 14 to 28
        this.boostedSpeed = 56;    // Changed from 28 to 56
        this.speedBoostCooldown = 0;
        this.shurikens = [];
        this.tridents = [];  // Add tridents array
        this.shurikenCooldown = 0;
        this.tridentCooldown = 0;  // Add trident cooldown
        this.boneArrows = [];  // Add this line
        this.explosionCooldown = 0;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.healthBarWidth = 60;  // Width of health bar
        this.healthBarHeight = 8;  // Height of health bar
        this.teleportCooldown = 0;  // Add this line
        this.invisibilityCooldown = 0;
        this.invisibilityDuration = 600;  // Changed from 180 to 600 (10 seconds at 60fps)
        this.waterSpears = [];  // Add water spears array
        this.waterSpearCooldown = 0;
        this.maxWaterSpears = 3;  // Maximum number of orbiting spears
        this.waterSpearActive = false;  // New flag to track if water spears are active
    }

    update(canvas, balls) {
        if (this.frozen) {
            this.frozenTimer--;
            if (this.frozenTimer <= 0) {
                this.frozen = false;
            }
            return;  // Don't update position if frozen
        }

        if (this.inBin || this.broken) {
            super.update(canvas, balls);
            return;
        }

        // Handle speed boost timer and cooldown
        if (this.speedBoostTimer > 0) {
            this.speedBoostTimer--;
            if (this.speedBoostTimer <= 0) {
                this.speed = this.normalSpeed;
            }
        }
        if (this.speedBoostCooldown > 0) {
            this.speedBoostCooldown--;
        }

        // Only handle movement if this is the active player
        if (this === activePlayer) {
            // Handle keyboard input
            if (keys.ArrowLeft || keys.a) this.x -= this.speed;
            if (keys.ArrowRight || keys.d) this.x += this.speed;
            if (keys.ArrowUp || keys.w) this.y -= this.speed;
            if (keys.ArrowDown || keys.s) this.y += this.speed;
        }

        // Keep player in bounds
        this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));

        // Update shurikens
        for (let i = this.shurikens.length - 1; i >= 0; i--) {
            const shuriken = this.shurikens[i];
            if (!shuriken.update()) {
                this.shurikens.splice(i, 1);
                continue;
            }
            
            // Check collisions with balls
            balls.forEach(ball => {
                if (shuriken.checkCollision(ball)) {
                    this.shurikens.splice(i, 1);
                }
            });
        }

        // Update tridents
        for (let i = this.tridents.length - 1; i >= 0; i--) {
            const trident = this.tridents[i];
            if (!trident.update()) {
                this.tridents.splice(i, 1);
                continue;
            }
            
            balls.forEach(ball => {
                if (trident.checkCollision(ball)) {
                    this.tridents.splice(i, 1);
                }
            });
        }

        // Update cooldowns
        if (this.tridentCooldown > 0) {
            this.tridentCooldown--;
        }
        if (this.shurikenCooldown > 0) {
            this.shurikenCooldown--;
        }

        // Update bone arrows
        for (let i = this.boneArrows.length - 1; i >= 0; i--) {
            if (!this.boneArrows[i].update(this)) {
                this.boneArrows.splice(i, 1);
            }
        }

        // Update explosion cooldown
        if (this.explosionCooldown > 0) {
            this.explosionCooldown--;
        }

        // Update invulnerability timer
        if (this.invulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }

        // Update invisibility cooldown
        if (this.invisibilityCooldown > 0) {
            this.invisibilityCooldown--;
        }

        // Update invisibility duration
        if (this.isInvisible) {
            this.invisibilityDuration--;
            if (this.invisibilityDuration <= 0) {
                this.isInvisible = false;
                // Create reappear effect
                this.createInvisibilityEffect('#FFFFFF');  // White particles for reappearing
            }
        }

        // Update water spears
        for (let i = this.waterSpears.length - 1; i >= 0; i--) {
            const spear = this.waterSpears[i];
            if (!spear.update(this)) {  // Pass 'this' for orbiting reference
                this.waterSpears.splice(i, 1);
                continue;
            }
            
            balls.forEach(ball => {
                if (spear.checkCollision(ball)) {
                    if (!spear.isOrbiting) {
                        this.waterSpears.splice(i, 1);
                    }
                }
            });
        }

        // Update water spear cooldown
        if (this.waterSpearCooldown > 0) {
            this.waterSpearCooldown--;
        }

        // Check spike collisions
        spikes.forEach(spike => {
            const dx = this.x - spike.x;
            const dy = this.y - spike.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.radius + spike.size && !this.invulnerable) {
                this.takeDamage(2);  // Spikes deal 2 damage
                
                // Create burst effect
                for (let i = 0; i < 25; i++) {
                    const particle = new Cloud(this.x, this.y);
                    // Alternate between red and white particles
                    particle.color = i % 2 === 0 ? '#FF0000' : '#FFFFFF';
                    const angle = (Math.PI * 2 * i) / 25;
                    const speed = 8 + Math.random() * 4;
                    particle.dx = Math.cos(angle) * speed;
                    particle.dy = Math.sin(angle) * speed;
                    particle.radius = 4;
                    particle.fadeSpeed = 0.03;
                    clouds.push(particle);
                }
                
                // Add blood stain effect
                const bloodStain = new BloodStain(this.x, this.y, '#FF0000');
                bloodStains.push(bloodStain);
                
                // Knockback effect
                const angle = Math.atan2(dy, dx);
                const knockback = 20;
                this.x += Math.cos(angle) * knockback;
                this.y += Math.sin(angle) * knockback;
                
                // Keep player in bounds after knockback
                this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
                this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
            }
        });

        // Update teleport cooldown
        if (this.teleportCooldown > 0) {
            this.teleportCooldown--;
        }
    }

    draw(ctx) {
        if (!this.isInvisible) {
            super.draw(ctx);
            
            // Add glow effect for active player
            if (this === activePlayer) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';  // Gold glow
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }
        
        // Draw health bar
        const barX = this.x - this.healthBarWidth / 2;
        const barY = this.y - this.radius - 20;  // Position above player

        // Draw background (empty health bar)
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, this.healthBarWidth, this.healthBarHeight);

        // Draw health fill
        const healthPercentage = this.health / this.maxHealth;
        const fillWidth = this.healthBarWidth * healthPercentage;
        
        // Color gradient based on health
        let fillColor;
        if (healthPercentage > 0.6) {
            fillColor = '#00FF00';  // Green for high health
        } else if (healthPercentage > 0.3) {
            fillColor = '#FFA500';  // Orange for medium health
        } else {
            fillColor = '#FF0000';  // Red for low health
        }

        ctx.fillStyle = fillColor;
        ctx.fillRect(barX, barY, fillWidth, this.healthBarHeight);

        // Draw border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, this.healthBarWidth, this.healthBarHeight);

        // Draw weapons
        this.shurikens.forEach(shuriken => shuriken.draw(ctx));
        this.tridents.forEach(trident => trident.draw(ctx));

        // Draw bone arrows
        this.boneArrows.forEach(arrow => arrow.draw(ctx));

        // Draw water spears
        this.waterSpears.forEach(spear => spear.draw(ctx));
    }

    takeDamage(amount) {
        if (this.invulnerable || this.isInvisible) return;

        this.health = Math.max(0, this.health - amount);
        this.invulnerable = true;
        this.invulnerableTimer = 45;  // 0.75 seconds of invulnerability

        // Create damage effect
        for (let i = 0; i < 8; i++) {
            const particle = new Cloud(this.x, this.y);
            particle.color = '#FF0000';
            particle.dx = (Math.random() - 0.5) * 8;
            particle.dy = (Math.random() - 0.5) * 8;
            particle.radius = 3;
            particle.fadeSpeed = 0.04;
            clouds.push(particle);
        }

        // Turn ball spiky if damage is 10 or more and ball isn't already spiky
        if (amount >= 10 && !this.isSpiky && !this.broken && !this.isPlayer) {  // Added !this.isPlayer check
            // Store current velocity but increase it for more dynamic movement
            const oldDx = this.dx * 1.5;
            const oldDy = this.dy * 1.5;

            // Create transformation effect
            for (let i = 0; i < 360; i += 30) {
                const angle = (i * Math.PI) / 180;
                const shockwave = new Cloud(this.x, this.y);
                shockwave.color = '#FFFFFF';
                shockwave.dx = Math.cos(angle) * 12;
                shockwave.dy = Math.sin(angle) * 12;
                shockwave.radius = 2;
                shockwave.fadeSpeed = 0.04;
                clouds.push(shockwave);
            }

            // Make the ball spiky and set its movement
            this.isSpiky = true;
            this.spikyTimer = 600; // 10 seconds at 60fps
            this.dx = oldDx * 0.25; // Quarter the speed for spiky balls (changed from 0.5)
            this.dy = oldDy * 0.25;
            this.rotationSpeed = 0.3; // Fast rotation speed
            this.health = 500; // Set health to 500 when becoming spiky
            this.broken = false; // Ensure the ball isn't marked as broken when becoming spiky
            
            // Add blood stain
            const bloodStain = new BloodStain(this.x, this.y, this.color);
            bloodStains.push(bloodStain);
            return;
        }

        // Critical health explosion effect (at 10 health or below)
        if (this.health <= 10 && !this.broken && !this.isSpiky) {
            // Create intense explosion effect
            for (let i = 0; i < 30; i++) {
                // Create circular burst of particles
                const angle = (Math.PI * 2 * i) / 30;
                const speed = 10 + Math.random() * 5;
                const distance = 30 + Math.random() * 20;
                
                const particle = new Cloud(
                    this.x + Math.cos(angle) * distance,
                    this.y + Math.sin(angle) * distance
                );
                
                // Alternate between red and orange for fire effect
                particle.color = i % 2 === 0 ? '#FF4500' : '#FF0000';
                particle.dx = Math.cos(angle) * speed;
                particle.dy = Math.sin(angle) * speed;
                particle.radius = 5;
                particle.fadeSpeed = 0.02;
                clouds.push(particle);
            }

            // Add smoke effect
            for (let i = 0; i < 15; i++) {
                const smoke = new Cloud(this.x, this.y);
                smoke.color = '#808080';
                smoke.dx = (Math.random() - 0.5) * 3;
                smoke.dy = (Math.random() - 0.5) * 3;
                smoke.radius = 15;
                smoke.fadeSpeed = 0.01;
                clouds.push(smoke);
            }

            // Add shockwave effect
            for (let i = 0; i < 360; i += 20) {
                const angle = (i * Math.PI) / 180;
                const shockwave = new Cloud(this.x, this.y);
                shockwave.color = '#FFD700';
                shockwave.dx = Math.cos(angle) * 15;
                shockwave.dy = Math.sin(angle) * 15;
                shockwave.radius = 2;
                shockwave.fadeSpeed = 0.04;
                clouds.push(shockwave);
            }

            // Screen shake effect
            canvas.style.transform = 'translate(5px, 5px)';
            setTimeout(() => {
                canvas.style.transform = 'translate(-5px, -5px)';
                setTimeout(() => {
                    canvas.style.transform = 'translate(0, 0)';
                }, 50);
            }, 50);
        }

        // Check if player died
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        // Create death explosion effect
        for (let i = 0; i < 40; i++) {
            const particle = new Cloud(this.x, this.y);
            particle.color = i % 2 === 0 ? '#FF0000' : '#FFFFFF';
            const angle = (Math.PI * 2 * i) / 40;
            const speed = 10 + Math.random() * 5;
            particle.dx = Math.cos(angle) * speed;
            particle.dy = Math.sin(angle) * speed;
            particle.radius = 5;
            particle.fadeSpeed = 0.02;
            clouds.push(particle);
        }

        // Reset health and position
        this.health = this.maxHealth;
        const newPos = getRandomPosition(canvas, this.radius);
        this.x = newPos.x;
        this.y = newPos.y;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        
        // Create healing effect
        for (let i = 0; i < 8; i++) {
            const particle = new Cloud(this.x, this.y);
            particle.color = '#00FF00';
            particle.dx = (Math.random() - 0.5) * 4;
            particle.dy = (Math.random() - 0.5) * 4;
            particle.radius = 3;
            particle.fadeSpeed = 0.03;
            clouds.push(particle);
        }
    }

    freezeNearestBalls(balls) {
        // Get distances to all non-player, unfrozen balls
        const ballDistances = balls
            .filter(ball => ball !== this && !ball.frozen && !ball.inBin && !ball.broken)
            .map(ball => ({
                ball,
                distance: Math.sqrt(
                    Math.pow(ball.x - this.x, 2) + 
                    Math.pow(ball.y - this.y, 2)
                )
            }))
            .sort((a, b) => a.distance - b.distance);

        // Freeze the 6 closest balls and shoot bone arrows at them
        ballDistances.slice(0, 6).forEach(({ball}) => {
            ball.frozen = true;
            ball.frozenTimer = 300; // 5 seconds at 60fps
            this.boneArrows.push(new BoneArrow(this.x, this.y, ball));
        });
    }

    throwShuriken() {
        if (this.shurikenCooldown > 0) return;

        const dx = mousePos.x - canvas.getBoundingClientRect().left - this.x;
        const dy = mousePos.y - canvas.getBoundingClientRect().top - this.y;
        const angle = Math.atan2(dy, dx);
        
        this.shurikens.push(new Shuriken(this.x, this.y, angle));
        this.shurikenCooldown = 15;  // 0.25 seconds at 60fps
    }

    throwTridents() {
        if (this.tridentCooldown > 0) return;

        const dx = mousePos.x - canvas.getBoundingClientRect().left - this.x;
        const dy = mousePos.y - canvas.getBoundingClientRect().top - this.y;
        const angle = Math.atan2(dy, dx);
        
        // Create two tridents, slightly offset
        this.tridents.push(new FireTrident(this.x, this.y, angle, true));
        this.tridents.push(new FireTrident(this.x, this.y, angle, false));
        
        this.tridentCooldown = 30;  // 0.5 seconds at 60fps
    }

    createExplosion() {
        if (this.explosionCooldown > 0) return;

        // Create multiple layers of explosion effects
        
        // Core explosion particles
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            const speed = 8 + Math.random() * 4;
            const particle = new Cloud(this.x, this.y);
            particle.color = '#FF4500';  // Orange-red
            particle.dx = Math.cos(angle) * speed;
            particle.dy = Math.sin(angle) * speed;
            particle.radius = 8;
            particle.fadeSpeed = 0.02;
            clouds.push(particle);
        }

        // Fire ring
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 6;
            const particle = new Cloud(this.x, this.y);
            particle.color = '#FFD700';  // Gold
            particle.dx = Math.cos(angle) * speed;
            particle.dy = Math.sin(angle) * speed;
            particle.radius = 6;
            particle.fadeSpeed = 0.015;
            clouds.push(particle);
        }

        // Smoke effect
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            const speed = 3;
            const particle = new Cloud(this.x, this.y);
            particle.color = '#808080';  // Gray
            particle.dx = Math.cos(angle) * speed;
            particle.dy = Math.sin(angle) * speed;
            particle.radius = 12;
            particle.fadeSpeed = 0.01;
            clouds.push(particle);
        }

        // Shockwave effect
        for (let i = 0; i < 360; i += 20) {
            const angle = (i * Math.PI) / 180;
            const particle = new Cloud(this.x, this.y);
            particle.color = '#FFFFFF';
            particle.dx = Math.cos(angle) * 12;
            particle.dy = Math.sin(angle) * 12;
            particle.radius = 2;
            particle.fadeSpeed = 0.04;
            clouds.push(particle);
        }

        // Check for nearby balls to affect
        balls.forEach(ball => {
            if (ball === this || ball.broken || ball.inBin) return;

            const dx = ball.x - this.x;
            const dy = ball.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const explosionRadius = 150;  // Explosion affect radius

            if (distance < explosionRadius) {
                // Calculate force based on distance (stronger closer to explosion)
                const force = (1 - distance / explosionRadius) * 20;
                const angle = Math.atan2(dy, dx);
                
                // Apply explosion force
                ball.dx = Math.cos(angle) * force;
                ball.dy = Math.sin(angle) * force;
                
                // Break balls that are very close
                if (distance < explosionRadius * 0.4) {
                    ball.broken = true;
                }
            }
        });

        // Deal 100 damage with ball explosion
        balls.forEach(ball => {
            if (ball !== this && ball.isPlayer) {
                const dx = ball.x - this.x;
                const dy = ball.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.radius * 3) {  // Explosion radius
                    ball.takeDamage(100);
                }
            }
        });

        this.explosionCooldown = 60;  // 1 second cooldown
    }

    teleport() {
        if (this.teleportCooldown > 0) return;

        // Create disappear effect at current position
        for (let i = 0; i < 20; i++) {
            const particle = new Cloud(this.x, this.y);
            particle.color = '#9370DB';  // Medium purple
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 8;
            particle.dx = Math.cos(angle) * speed;
            particle.dy = Math.sin(angle) * speed;
            particle.radius = 4;
            particle.fadeSpeed = 0.03;
            clouds.push(particle);
        }

        // Get mouse position relative to canvas
        const canvasRect = canvas.getBoundingClientRect();
        const targetX = mousePos.x - canvasRect.left;
        const targetY = mousePos.y - canvasRect.top;

        // Teleport to mouse position
        this.x = targetX;
        this.y = targetY;

        // Keep player in bounds
        this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));

        // Create appear effect at new position
        for (let i = 0; i < 20; i++) {
            const particle = new Cloud(this.x, this.y);
            particle.color = '#9370DB';  // Medium purple
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 8;
            particle.dx = Math.cos(angle) * speed;
            particle.dy = Math.sin(angle) * speed;
            particle.radius = 4;
            particle.fadeSpeed = 0.03;
            clouds.push(particle);
        }

        // Heal player
        this.heal(20);  // Heal 20 health points

        // Set cooldown
        this.teleportCooldown = 30;  // 0.5 seconds cooldown
    }

    activateInvisibility() {
        if (this.invisibilityCooldown > 0 || this.isInvisible) return;

        this.isInvisible = true;
        this.invisibilityDuration = 600;  // Changed from 180 to 600
        this.invisibilityCooldown = 300;  // Keep 5 second cooldown
        
        // Create vanish effect
        this.createInvisibilityEffect('#9400D3');

        // Deal damage to nearby spiky balls
        balls.forEach(ball => {
            if (ball.isSpiky) {
                const dx = ball.x - this.x;
                const dy = ball.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.radius * 4) {  // Damage spiky balls within range
                    ball.takeDamage(20);  // Deal 20 damage to spiky balls
                    
                    // Create damage effect
                    for (let i = 0; i < 8; i++) {
                        const particle = new Cloud(ball.x, ball.y);
                        particle.color = '#9400D3';  // Purple damage effect
                        particle.dx = (Math.random() - 0.5) * 8;
                        particle.dy = (Math.random() - 0.5) * 8;
                        particle.radius = 3;
                        particle.fadeSpeed = 0.04;
                        clouds.push(particle);
                    }
                }
            }
        });
    }

    createInvisibilityEffect(color) {
        for (let i = 0; i < 30; i++) {
            const particle = new Cloud(this.x, this.y);
            particle.color = color;
            const angle = (Math.PI * 2 * i) / 30;
            const speed = 6;
            particle.dx = Math.cos(angle) * speed;
            particle.dy = Math.sin(angle) * speed;
            particle.radius = 3;
            particle.fadeSpeed = 0.04;
            clouds.push(particle);
        }
    }

    toggleWaterSpears() {
        if (this.waterSpearCooldown > 0) return;
        
        if (!this.waterSpearActive) {
            // Create new orbiting spears
            for (let i = 0; i < this.maxWaterSpears; i++) {
                const angle = (Math.PI * 2 * i) / this.maxWaterSpears;
                this.waterSpears.push(new WaterSpear(this.x, this.y, angle));
            }
            this.waterSpearActive = true;
            
            // Create activation effect
            for (let i = 0; i < 15; i++) {
                const particle = new Cloud(this.x, this.y);
                particle.color = '#00CED1';  // Turquoise color
                const angle = (Math.PI * 2 * i) / 15;
                const speed = 6;
                particle.dx = Math.cos(angle) * speed;
                particle.dy = Math.sin(angle) * speed;
                particle.radius = 4;
                particle.fadeSpeed = 0.03;
                clouds.push(particle);
            }
        } else {
            // Launch all orbiting spears
            this.waterSpears.forEach(spear => {
                spear.isOrbiting = false;
                spear.dx = Math.cos(spear.angle) * spear.speed;
                spear.dy = Math.sin(spear.angle) * spear.speed;
            });
            
            // Create launch effect
            for (let i = 0; i < 10; i++) {
                const particle = new Cloud(this.x, this.y);
                particle.color = '#87CEEB';  // Sky blue color
                const angle = (Math.PI * 2 * i) / 10;
                const speed = 8;
                particle.dx = Math.cos(angle) * speed;
                particle.dy = Math.sin(angle) * speed;
                particle.radius = 3;
                particle.fadeSpeed = 0.04;
                clouds.push(particle);
            }
            
            this.waterSpearActive = false;
        }
        
        this.waterSpearCooldown = 30;  // 0.5 second cooldown
    }
}

// Modify keyboard event listeners to remove spear controls
const keys = {};
window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    
    // Switch active player with G only if switching is allowed
    if (e.key.toLowerCase() === 'g' && canSwitchPlayers) {
        e.preventDefault();
        activePlayer = (activePlayer === player) ? player2 : player;
        createSwitchEffect(activePlayer);
    }
    
    // Speed boost toggle for player 2 with X key
    if (e.key.toLowerCase() === 'x' && activePlayer === player2 && activePlayer.speedBoostCooldown <= 0) {
        e.preventDefault();
        activePlayer.speedBoostActive = !activePlayer.speedBoostActive;  // Toggle the boost
        activePlayer.speed = activePlayer.speedBoostActive ? activePlayer.boostedSpeed : activePlayer.normalSpeed;
        activePlayer.speedBoostCooldown = 30; // Half second cooldown between toggles
        
        // Create speed boost effect
        for (let i = 0; i < 12; i++) {
            const particle = new Cloud(activePlayer.x, activePlayer.y);
            particle.color = activePlayer.speedBoostActive ? '#00FFFF' : '#FF4444';  // Cyan for boost, red for deactivate
            const angle = (Math.PI * 2 * i) / 12;
            const speed = 8;
            particle.dx = Math.cos(angle) * speed;
            particle.dy = Math.sin(angle) * speed;
            particle.radius = 3;
            particle.fadeSpeed = 0.04;
            clouds.push(particle);
        }
    }
    
    // Use activePlayer for all controls
    if (e.key === 'Tab') {
        e.preventDefault();
        activePlayer.freezeNearestBalls(balls);
    } else if (e.key === ' ') {  // Spacebar
        e.preventDefault();
        activePlayer.createExplosion();
    } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        activePlayer.teleport();
    } else if (e.key.toLowerCase() === 'l') {  // Add invisibility for L key
        e.preventDefault();
        activePlayer.activateInvisibility();
    } else if (e.key.toLowerCase() === 'j' && activePlayer === player2) {  // Toggle water spears with J
        e.preventDefault();
        activePlayer.toggleWaterSpears();
    } else if (e.key.toLowerCase() === 'f' && activePlayer === player2) {  // Launch water spears with F
        e.preventDefault();
        activePlayer.launchWaterSpears();
    }
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Create player after other ball creation
const player = new Player(canvas.width/2, canvas.height/2, fixedRadius);
balls.push(player);

// Add this helper function for random position
function getRandomPosition(canvas, radius) {
    return {
        x: Math.random() * (canvas.width - radius * 2) + radius,
        y: Math.random() * (canvas.height - radius * 2) + radius
    };
}

// Add mouse position tracking (after keyboard event listeners)
const mousePos = { x: 0, y: 0 };
window.addEventListener('mousemove', e => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
});

// Optional: Add CSS to ensure the canvas background is black even before first render
canvas.style.backgroundColor = '#4B0082';  // Match the purple color

// Add after other class definitions
class Shuriken {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.angle = angle;
        this.speed = 12;
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;
        this.rotationAngle = 0;
        this.rotationSpeed = 0.3;
        this.active = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotationAngle);

        // Draw shuriken base
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI / 2);
            ctx.moveTo(0, 0);
            ctx.lineTo(this.radius * Math.cos(angle), this.radius * Math.sin(angle));
        }
        ctx.strokeStyle = '#FFD700';  // Gold
        ctx.lineWidth = 3;
        ctx.stroke();

        // Add golden glow effect
        ctx.shadowColor = '#FFA500';  // Orange glow
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#DAA520';  // Goldenrod
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.rotationAngle += this.rotationSpeed;

        // Create golden trail effect
        if (Math.random() < 0.3) {  // 30% chance each frame
            const trail = new Cloud(this.x, this.y);
            trail.color = '#FFD700';  // Gold
            trail.fadeSpeed = 0.04;
            trail.radius = 5;
            trail.dx = (Math.random() - 0.5) * 2;
            trail.dy = (Math.random() - 0.5) * 2;
            clouds.push(trail);
        }

        // Check if shuriken is off screen
        return this.x > 0 && this.x < canvas.width && 
               this.y > 0 && this.y < canvas.height;
    }

    checkCollision(ball) {
        if (!ball.active || ball === player || ball.broken || ball.inBin) return false;
        
        const dx = ball.x - this.x;
        const dy = ball.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius + ball.radius) {
            // Create golden burst effect on hit
            for (let i = 0; i < 15; i++) {
                const spark = new Cloud(ball.x, ball.y);
                spark.color = i % 2 === 0 ? '#FFD700' : '#DAA520';  // Alternate gold colors
                spark.dx = (Math.random() - 0.5) * 10;
                spark.dy = (Math.random() - 0.5) * 10;
                spark.radius = 3;
                spark.fadeSpeed = 0.03;
                clouds.push(spark);
            }
            
            // Deal 5 damage with shuriken
            if (ball.isPlayer) {
                ball.takeDamage(5);
            }
            return true;
        }
        return false;
    }
}

// Add right-click event listener (after other event listeners)
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();  // Prevent context menu from appearing
});

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Left click
        player.throwTridents();
    } else if (e.button === 2) { // Right click
        player.throwShuriken();
    }
});

// Add after Shuriken class
class FireTrident {
    constructor(x, y, angle, isLeft) {
        this.x = x;
        this.y = y;
        this.width = 40;  // Length of trident
        this.height = 20; // Width of prongs
        this.angle = angle;
        this.speed = 14;
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;
        this.isLeft = isLeft; // To offset the tridents left or right
        this.active = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Offset based on whether it's left or right trident
        const offset = this.isLeft ? -10 : 10;
        ctx.translate(0, offset);

        // Draw trident handle
        ctx.beginPath();
        ctx.moveTo(-this.width/2, 0);
        ctx.lineTo(this.width/2, 0);
        ctx.strokeStyle = '#8B4513';  // Saddle brown for handle
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw prongs
        ctx.beginPath();
        // Middle prong
        ctx.moveTo(this.width/2, 0);
        ctx.lineTo(this.width/2 + 15, 0);
        // Side prongs
        ctx.moveTo(this.width/2, -this.height/2);
        ctx.lineTo(this.width/2 + 10, -this.height/2);
        ctx.moveTo(this.width/2, this.height/2);
        ctx.lineTo(this.width/2 + 10, this.height/2);
        
        // Fire effect styling
        ctx.strokeStyle = '#FF4500';  // Orange-red
        ctx.lineWidth = 4;
        ctx.shadowColor = '#FF8C00';
        ctx.shadowBlur = 15;
        ctx.stroke();

        ctx.restore();
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        // Create fire trail effect
        if (Math.random() < 0.4) {  // 40% chance each frame
            const trail = new Cloud(
                this.x + (Math.random() - 0.5) * 10,
                this.y + (Math.random() - 0.5) * 10
            );
            trail.color = Math.random() < 0.5 ? '#FF4500' : '#FF8C00';
            trail.fadeSpeed = 0.03;
            trail.radius = 6;
            trail.dx = (Math.random() - 0.5) * 2;
            trail.dy = (Math.random() - 0.5) * 2;
            clouds.push(trail);
        }

        // Check if trident is off screen
        return this.x > 0 && this.x < canvas.width && 
               this.y > 0 && this.y < canvas.height;
    }

    checkCollision(ball) {
        if (!ball.active || ball === player || ball === player2 || ball.broken || ball.inBin) return false;
        
        const dx = ball.x - this.x;
        const dy = ball.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.width/2 + ball.radius) {
            // Create fire burst effect
            for (let i = 0; i < 20; i++) {
                const spark = new Cloud(ball.x, ball.y);
                spark.color = i % 2 === 0 ? '#FF4500' : '#FF8C00';
                spark.dx = (Math.random() - 0.5) * 12;
                spark.dy = (Math.random() - 0.5) * 12;
                spark.radius = 4;
                spark.fadeSpeed = 0.02;
                clouds.push(spark);
            }
            
            // Deal 20 damage with trident
            if (ball.isPlayer) {
                ball.takeDamage(20);
            }
            return true;
        }
        return false;
    }
}

// Add after FireTrident class
class BoneArrow {
    constructor(x, y, targetBall) {
        this.x = x;
        this.y = y;
        this.targetBall = targetBall;
        this.speed = 16;
        this.returning = false;
        this.width = 30;
        this.active = true;
        
        // Calculate initial direction to target
        const dx = targetBall.x - x;
        const dy = targetBall.y - y;
        const angle = Math.atan2(dy, dx);
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.atan2(this.dy, this.dx));

        // Draw bone shaft
        ctx.beginPath();
        ctx.moveTo(-this.width/2, 0);
        ctx.lineTo(this.width/2, 0);
        ctx.strokeStyle = '#F0F0F0';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Draw bone ends
        for (let end of [-1, 1]) {
            ctx.beginPath();
            ctx.arc(this.width/2 * end, -5, 4, 0, Math.PI * 2);
            ctx.arc(this.width/2 * end, 5, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#F0F0F0';
            ctx.fill();
        }

        // Add glow effect
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 10;
        ctx.stroke();

        ctx.restore();
    }

    update(player) {
        if (this.returning) {
            // Pull target ball towards player
            const pullSpeed = 15;
            const dx = player.x - this.targetBall.x;
            const dy = player.y - this.targetBall.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 5) {
                this.targetBall.x += (dx / dist) * pullSpeed;
                this.targetBall.y += (dy / dist) * pullSpeed;
                
                // Arrow follows the ball
                this.x = this.targetBall.x;
                this.y = this.targetBall.y;
                
                // Create bone dust effect
                if (Math.random() < 0.3) {
                    const dust = new Cloud(this.x, this.y);
                    dust.color = '#F0F0F0';
                    dust.fadeSpeed = 0.05;
                    dust.radius = 3;
                    dust.dx = (Math.random() - 0.5) * 2;
                    dust.dy = (Math.random() - 0.5) * 2;
                    clouds.push(dust);
                }
                return true;
            }
            return false;
        }

        // Moving towards target
        this.x += this.dx;
        this.y += this.dy;

        // Check if hit target
        const dx = this.targetBall.x - this.x;
        const dy = this.targetBall.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.targetBall.radius) {
            this.returning = true;
            // Create hit effect
            for (let i = 0; i < 10; i++) {
                const spark = new Cloud(this.x, this.y);
                spark.color = '#F0F0F0';
                spark.dx = (Math.random() - 0.5) * 8;
                spark.dy = (Math.random() - 0.5) * 8;
                spark.radius = 4;
                spark.fadeSpeed = 0.03;
                clouds.push(spark);
            }
        }
        return true;
    }
}

// After creating the first player, add a second player
const player2 = new Player(canvas.width/4, canvas.height/2, fixedRadius);
player2.color = '#C0C0C0';  // Silver color
balls.push(player2);

// Add activePlayer variable at the top with other globals
let activePlayer = player;  // Start with player 1 as active

// Add switch effect function
function createSwitchEffect(player) {
    // Create burst effect around new active player
    for (let i = 0; i < 20; i++) {
        const particle = new Cloud(player.x, player.y);
        particle.color = '#FFD700';  // Gold color
        const angle = (Math.PI * 2 * i) / 20;
        const speed = 8;
        particle.dx = Math.cos(angle) * speed;
        particle.dy = Math.sin(angle) * speed;
        particle.radius = 4;
        particle.fadeSpeed = 0.03;
        clouds.push(particle);
    }
}

// Add WaterSpear class
class WaterSpear {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 10;
        this.angle = angle;
        this.speed = 12;
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;
        this.active = true;
        this.orbitAngle = angle;
        this.orbitRadius = 70;    // Increased orbit radius for ring effect
        this.orbitSpeed = 0.03;   // Slowed down orbit speed
        this.isOrbiting = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI/4);  // Rotate 45 degrees to make ring effect
        
        // Draw spear as a flattened ellipse for ring effect
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width/2, this.height/2, 0, 0, Math.PI * 2);
        
        // Water effect gradient with more transparency
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width/2);
        gradient.addColorStop(0, 'rgba(0, 206, 209, 0.8)');   // Dark turquoise
        gradient.addColorStop(0.5, 'rgba(64, 224, 208, 0.6)'); // Turquoise
        gradient.addColorStop(1, 'rgba(127, 255, 212, 0.4)');  // Aquamarine
        
        ctx.fillStyle = gradient;
        
        // Add glow effect
        ctx.shadowColor = '#00CED1';
        ctx.shadowBlur = 15;
        ctx.fill();

        ctx.restore();
    }

    update(player) {
        if (this.isOrbiting) {
            // Update orbit position with slight vertical oscillation
            this.orbitAngle += this.orbitSpeed;
            const verticalOffset = Math.sin(this.orbitAngle * 2) * 10;  // Add wobble
            this.x = player.x + Math.cos(this.orbitAngle) * this.orbitRadius;
            this.y = player.y + Math.sin(this.orbitAngle) * this.orbitRadius * 0.4 + verticalOffset;  // Flatten the orbit
            
            // Update spear angle to follow orbit
            this.angle = this.orbitAngle;
            
            // Create subtle particle trail
            if (Math.random() < 0.2) {
                const trail = new Cloud(
                    this.x + (Math.random() - 0.5) * 5,
                    this.y + (Math.random() - 0.5) * 5
                );
                trail.color = 'rgba(0, 206, 209, 0.3)';
                trail.fadeSpeed = 0.06;
                trail.radius = 2;
                clouds.push(trail);
            }
            
            return true;
        } else {
            // Normal projectile movement
            this.x += this.dx;
            this.y += this.dy;

            // Create water trail effect
            if (Math.random() < 0.3) {
                const trail = new Cloud(
                    this.x + (Math.random() - 0.5) * 10,
                    this.y + (Math.random() - 0.5) * 10
                );
                trail.color = '#00CED1';
                trail.fadeSpeed = 0.04;
                trail.radius = 3;
                clouds.push(trail);
            }

            return this.x > 0 && this.x < canvas.width && 
                   this.y > 0 && this.y < canvas.height;
        }
    }

    checkCollision(ball) {
        if (!ball.active || ball === player || ball === player2 || ball.broken || ball.inBin) return false;
        
        const dx = ball.x - this.x;
        const dy = ball.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.width/2 + ball.radius) {
            // Create ice/water splash effect
            for (let i = 0; i < 15; i++) {
                const splash = new Cloud(ball.x, ball.y);
                splash.color = i % 2 === 0 ? '#00CED1' : '#87CEEB';  // Mix of water and ice colors
                splash.dx = (Math.random() - 0.5) * 10;
                splash.dy = (Math.random() - 0.5) * 10;
                splash.radius = 3;
                splash.fadeSpeed = 0.03;
                clouds.push(splash);
            }
            
            if (ball.isPlayer) {
                ball.takeDamage(40);  // Deal 40 damage to players
            } else {
                // Random number between 0 and 1
                const chance = Math.random();
                
                if (chance < 0.7) {  // 70% chance to freeze
                    ball.frozen = true;
                    ball.frozenTimer = 180;  // Freeze for 3 seconds
                    
                    // Add freeze effect
                    for (let i = 0; i < 12; i++) {
                        const iceParticle = new Cloud(ball.x, ball.y);
                        iceParticle.color = '#87CEEB';  // Light blue for ice
                        const angle = (Math.PI * 2 * i) / 12;
                        const speed = 6;
                        iceParticle.dx = Math.cos(angle) * speed;
                        iceParticle.dy = Math.sin(angle) * speed;
                        iceParticle.radius = 4;
                        iceParticle.fadeSpeed = 0.03;
                        clouds.push(iceParticle);
                    }
                } else if (chance < 0.9) {  // 20% chance to break
                    ball.broken = true;
                    
                    // Add break effect
                    for (let i = 0; i < 15; i++) {
                        const breakParticle = new Cloud(ball.x, ball.y);
                        breakParticle.color = '#B0E0E6';  // Powder blue for break
                        breakParticle.dx = (Math.random() - 0.5) * 12;
                        breakParticle.dy = (Math.random() - 0.5) * 12;
                        breakParticle.radius = 3;
                        breakParticle.fadeSpeed = 0.04;
                        clouds.push(breakParticle);
                    }
                } else {  // 10% chance to deflect
                    // Reverse and increase ball's velocity
                    ball.dx = -ball.dx * 1.5;
                    ball.dy = -ball.dy * 1.5;
                    
                    // Add deflect effect
                    for (let i = 0; i < 10; i++) {
                        const deflectParticle = new Cloud(ball.x, ball.y);
                        deflectParticle.color = '#E0FFFF';  // Light cyan for deflect
                        const angle = (Math.PI * 2 * i) / 10;
                        const speed = 10;
                        deflectParticle.dx = Math.cos(angle) * speed;
                        deflectParticle.dy = Math.sin(angle) * speed;
                        deflectParticle.radius = 3;
                        deflectParticle.fadeSpeed = 0.05;
                        clouds.push(deflectParticle);
                    }
                }
            }
            return true;
        }
        return false;
    }
}

// Party joining functionality
const hostPartyBtn = document.querySelector('.host-party-btn');
const joinPartyBtn = document.querySelector('.join-party-btn');
const partyInterface = document.querySelector('.party-interface');
const codeInput = document.querySelector('.code-input');
const hostCodeDisplay = document.querySelector('.host-code-display');
const joinCodeInput = document.querySelector('.join-code-input');
const codeDisplayDiv = document.querySelector('.code-display');
const partyHeader = document.querySelector('.party-header');
const characterSelects = document.querySelectorAll('.character-select');

let partyCode = null;
let selectedCharacter = null;
let isHost = false;
let hostSelectedCharacter = null;

let canSwitchPlayers = true; // Add this variable to control player switching

hostPartyBtn.addEventListener('click', () => {
    isHost = true;
    partyInterface.style.display = 'block';
    hostCodeDisplay.style.display = 'block';
    joinCodeInput.style.display = 'none';
    partyHeader.textContent = 'Host a Party';
    
    // Generate 5-digit code
    partyCode = Math.floor(10000 + Math.random() * 90000);
    codeDisplayDiv.textContent = partyCode;
});

joinPartyBtn.addEventListener('click', () => {
    isHost = false;
    partyInterface.style.display = 'block';
    hostCodeDisplay.style.display = 'none';
    joinCodeInput.style.display = 'block';
    partyHeader.textContent = 'Join a Party';
});

codeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const enteredCode = parseInt(codeInput.value);
        if (enteredCode === partyCode) {
            if (hostSelectedCharacter) {
                // Show character selection for joiner with only the remaining option
                const joinerCharacterSelect = joinCodeInput.querySelector('.character-select');
                joinerCharacterSelect.style.display = 'block';
                const options = joinerCharacterSelect.querySelectorAll('.character-option');
                
                options.forEach(option => {
                    if (option.dataset.character === hostSelectedCharacter) {
                        option.style.display = 'none';
                    } else {
                        option.style.display = 'block';
                    }
                });
            } else {
                alert('Please wait for the host to select their character first!');
            }
        }
    
    }
});

// Update character selection logic to disable switching for player 2
characterSelects.forEach(select => {
    const options = select.querySelectorAll('.character-option');
    options.forEach(option => {
        option.addEventListener('click', () => {
            selectedCharacter = option.dataset.character;
            if (isHost) {
                hostSelectedCharacter = selectedCharacter;
                canSwitchPlayers = true; // Host can switch players
            } else {
                canSwitchPlayers = false; // Player 2 cannot switch players
            }
            partyInterface.style.display = 'none';
            
            // Initialize the game with the selected character
            if (selectedCharacter === 'knight') {
                activePlayer = player;
                player.color = '#C0C0C0';  // Silver for Knight
            } else if (selectedCharacter === 'mage') {
                activePlayer = player2;
                player2.color = '#9370DB';  // Purple for Mage
            }
        });
    });
});