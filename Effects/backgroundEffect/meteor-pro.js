/**
 * Cursor Meteor (增强版鼠标交互流星特效)
 * 鼠标移动：渐变色折线流星拖尾
 * 左键点击：十字星光爆发
 * 右键点击：环形冲击波 + 粒子爆发
 * 使用方式：<script src="cursor-meteor.js"></script>
 */

(function() {
    "use strict";

    const CONFIG = {
        // 移动拖尾 - 折线流星
        trailLength: 60,        // 拖尾长度
        trailWidth: 4,          // 线宽
        tailFade: 0.04,         // 渐隐速度（更慢，拖尾更长）
        glowBlur: 20,           // 发光强度

        // 左键十字星光
        starBurstRays: 4,       // 光芒道数
        starBurstLength: 60,    // 光芒长度
        starBurstLife: 0.8,     // 光芒寿命
        starParticleCount: 16,  // 伴随粒子数

        // 右键环形冲击波
        ringCount: 24,          // 环形粒子数
        ringSpeed: 10,
        ringParticleCount: 30,  // 额外粒子

        // 通用粒子
        gravity: 0.12,
        friction: 0.97,
        zIndex: 9998,
        stopOnHidden: true,
    };

    // ============================== 折线流星拖尾点 ==============================
    class MeteorPoint {
        constructor(x, y, speed) {
            this.x = x;
            this.y = y;
            this.life = 1;
            // 根据速度调整色相：慢=青色，快=紫色
            this.hue = Math.min(180 + speed * 2, 280);
            this.brightness = Math.min(60 + speed * 3, 95);
            this.size = Math.min(2 + speed * 0.15, 5);
        }

        update() {
            this.life -= CONFIG.tailFade;
        }
    }

    // ============================== 十字星光光芒 ==============================
    class StarRay {
        constructor(x, y, angle, length, hue) {
            this.x = x;
            this.y = y;
            this.angle = angle;
            this.length = length;
            this.life = 1;
            this.maxLife = CONFIG.starBurstLife;
            this.hue = hue;
            this.width = 3;
        }

        update() {
            this.life -= 0.025;
            this.length *= 0.97;
        }

        draw(ctx) {
            if (this.life <= 0) return;
            const alpha = this.life / this.maxLife;
            const endX = this.x + Math.cos(this.angle) * this.length;
            const endY = this.y + Math.sin(this.angle) * this.length;

            ctx.save();
            ctx.shadowBlur = 15 * alpha;
            ctx.shadowColor = `hsl(${this.hue}, 80%, 70%)`;
            ctx.strokeStyle = `hsla(${this.hue}, 90%, 85%, ${alpha})`;
            ctx.lineWidth = this.width * alpha;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            ctx.restore();
        }
    }

    // ============================== 通用粒子 ==============================
    class Particle {
        constructor(x, y, speed, life, hue, size = 2) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * speed + speed * 0.3;
            this.vx = Math.cos(angle) * spd;
            this.vy = Math.sin(angle) * spd;
            this.life = life;
            this.maxLife = life;
            this.hue = hue + Math.random() * 40 - 20;
            this.size = size + Math.random() * 2;
            this.brightness = 80 + Math.random() * 20;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += CONFIG.gravity;
            this.vx *= CONFIG.friction;
            this.vy *= CONFIG.friction;
            this.life -= 0.012;
        }

        draw(ctx) {
            if (this.life <= 0) return;
            const alpha = this.life / this.maxLife;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = 10 * alpha;
            ctx.shadowColor = `hsl(${this.hue}, 80%, 60%)`;
            ctx.fillStyle = `hsl(${this.hue}, 90%, ${this.brightness}%)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // ============================== 环形粒子 ==============================
    class RingParticle {
        constructor(x, y, angle, speed, hue) {
            this.x = x;
            this.y = y;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.life = 1;
            this.hue = hue;
            this.size = 3;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.08;
            this.vx *= 0.98;
            this.vy *= 0.98;
            this.life -= 0.015;
        }

        draw(ctx) {
            if (this.life <= 0) return;
            ctx.save();
            ctx.globalAlpha = this.life;
            ctx.shadowBlur = 12 * this.life;
            ctx.shadowColor = `hsl(${this.hue}, 80%, 70%)`;
            ctx.fillStyle = `hsl(${this.hue}, 95%, 80%)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // ============================== 主管理器 ==============================
    class CursorMeteorManager {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.trailPoints = [];
            this.starRays = [];
            this.particles = [];
            this.ringParticles = [];
            this.animationId = null;
            this.isRunning = false;
            this.isVisible = true;

            this.mouseX = -100;
            this.mouseY = -100;
            this.lastMouseX = -100;
            this.lastMouseY = -100;
            this.isMoving = false;
            this.moveTimeout = null;

            this.init();
        }

        init() {
            this.canvas = document.createElement("canvas");
            this.canvas.id = "cursor-meteor-canvas";
            this.canvas.style.cssText = `
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                pointer-events: none;
                z-index: ${CONFIG.zIndex};
            `;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext("2d");
            this.resize();

            document.addEventListener("mousemove", (e) => this.onMouseMove(e));
            document.addEventListener("click", (e) => this.onClick(e));
            document.addEventListener("contextmenu", (e) => this.onRightClick(e));
            window.addEventListener("resize", () => this.resize());

            if (CONFIG.stopOnHidden) {
                document.addEventListener("visibilitychange", () => {
                    this.isVisible = !document.hidden;
                    if (this.isVisible && this.isRunning) this.animate();
                });
            }

            this.start();
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        onMouseMove(e) {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            const vx = this.mouseX - this.lastMouseX;
            const vy = this.mouseY - this.lastMouseY;
            const speed = Math.sqrt(vx * vx + vy * vy);

            this.isMoving = true;

            if (speed > 3) {
                // 根据速度插入多个点，形成连续折线
                const steps = Math.min(Math.floor(speed / 4), 4);
                for (let i = 0; i < steps; i++) {
                    const t = i / steps;
                    this.trailPoints.push(new MeteorPoint(
                        this.lastMouseX + vx * t,
                        this.lastMouseY + vy * t,
                        speed
                    ));
                }
            }

            this.lastMouseX = this.mouseX;
            this.lastMouseY = this.mouseY;

            clearTimeout(this.moveTimeout);
            this.moveTimeout = setTimeout(() => { this.isMoving = false; }, 80);
        }

        onClick(e) {
            const hue = 200 + Math.random() * 60; // 蓝紫范围
            // 十字星光：4道光芒
            for (let i = 0; i < CONFIG.starBurstRays; i++) {
                const angle = (Math.PI * 2 / CONFIG.starBurstRays) * i + Math.random() * 0.3;
                this.starRays.push(new StarRay(
                    e.clientX, e.clientY, angle, 
                    CONFIG.starBurstLength + Math.random() * 20, hue
                ));
                // 反向光芒
                this.starRays.push(new StarRay(
                    e.clientX, e.clientY, angle + Math.PI, 
                    CONFIG.starBurstLength * 0.6 + Math.random() * 15, hue
                ));
            }
            // 伴随粒子
            for (let i = 0; i < CONFIG.starParticleCount; i++) {
                this.particles.push(new Particle(e.clientX, e.clientY, 6, 1.0, hue, 2));
            }
            // 中心闪光
            for (let i = 0; i < 8; i++) {
                const p = new Particle(e.clientX, e.clientY, 3, 0.6, hue + 30, 4);
                p.vx *= 0.5; p.vy *= 0.5;
                this.particles.push(p);
            }
        }

        onRightClick(e) {
            e.preventDefault();
            const hue = 260 + Math.random() * 40; // 紫色范围
            // 环形冲击波
            for (let i = 0; i < CONFIG.ringCount; i++) {
                const angle = (Math.PI * 2 / CONFIG.ringCount) * i;
                this.ringParticles.push(new RingParticle(
                    e.clientX, e.clientY, angle, 
                    CONFIG.ringSpeed + Math.random() * 4, hue
                ));
            }
            // 额外散射粒子
            for (let i = 0; i < CONFIG.ringParticleCount; i++) {
                this.particles.push(new Particle(e.clientX, e.clientY, 8, 1.2, hue, 3));
            }
            // 中心爆闪
            for (let i = 0; i < 12; i++) {
                const p = new Particle(e.clientX, e.clientY, 2, 0.5, hue + 40, 5);
                p.vx *= 0.3; p.vy *= 0.3;
                this.particles.push(p);
            }
        }

        drawMeteorTrail() {
            if (this.trailPoints.length < 2) return;
            const ctx = this.ctx;

            ctx.save();
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            // 绘制渐变折线拖尾
            for (let i = 1; i < this.trailPoints.length; i++) {
                const p = this.trailPoints[i];
                const prev = this.trailPoints[i - 1];
                const alpha = p.life;
                if (alpha <= 0) continue;

                // 动态宽度：头部粗，尾部细
                const width = alpha * CONFIG.trailWidth * (0.5 + alpha * 0.5);

                ctx.beginPath();
                ctx.moveTo(prev.x, prev.y);
                ctx.lineTo(p.x, p.y);

                ctx.shadowBlur = CONFIG.glowBlur * alpha;
                ctx.shadowColor = `hsl(${p.hue}, 80%, 60%)`;
                ctx.strokeStyle = `hsla(${p.hue}, 85%, ${p.brightness}%, ${alpha})`;
                ctx.lineWidth = width;
                ctx.stroke();
            }

            // 头部高光
            const head = this.trailPoints[this.trailPoints.length - 1];
            if (head && head.life > 0.3) {
                ctx.beginPath();
                ctx.arc(head.x, head.y, head.size, 0, Math.PI * 2);
                ctx.shadowBlur = 25;
                ctx.shadowColor = `hsl(${head.hue}, 80%, 70%)`;
                ctx.fillStyle = `hsla(${head.hue}, 50%, 95%, ${head.life})`;
                ctx.fill();
            }

            ctx.restore();
        }

        drawCursorGlow() {
            if (!this.isMoving) return;
            const ctx = this.ctx;
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.shadowBlur = 30;
            ctx.shadowColor = "rgba(135, 206, 235, 0.8)";
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.beginPath();
            ctx.arc(this.mouseX, this.mouseY, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        animate() {
            if (!this.isRunning || !this.isVisible) return;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // 更新拖尾
            this.trailPoints.forEach(p => p.update());
            this.trailPoints = this.trailPoints.filter(p => p.life > 0);
            if (this.trailPoints.length > CONFIG.trailLength) {
                this.trailPoints.splice(0, this.trailPoints.length - CONFIG.trailLength);
            }

            // 更新星光
            this.starRays.forEach(r => r.update());
            this.starRays = this.starRays.filter(r => r.life > 0);

            // 更新粒子
            this.particles.forEach(p => p.update());
            this.particles = this.particles.filter(p => p.life > 0);

            // 更新环形
            this.ringParticles.forEach(p => p.update());
            this.ringParticles = this.ringParticles.filter(p => p.life > 0);

            // 绘制（按层次）
            this.starRays.forEach(r => r.draw(this.ctx));
            this.ringParticles.forEach(p => p.draw(this.ctx));
            this.particles.forEach(p => p.draw(this.ctx));
            this.drawMeteorTrail();
            this.drawCursorGlow();

            this.animationId = requestAnimationFrame(() => this.animate());
        }

        start() { 
            if (this.isRunning) return; 
            this.isRunning = true; 
            this.animate(); 
        }

        stop() { 
            this.isRunning = false; 
            if (this.animationId) { 
                cancelAnimationFrame(this.animationId); 
                this.animationId = null; 
            } 
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); 
        }

        destroy() { 
            this.stop(); 
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas); 
            } 
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            window.cursorMeteor = new CursorMeteorManager();
        });
    } else {
        window.cursorMeteor = new CursorMeteorManager();
    }

    window.CursorMeteorAPI = {
        start: () => window.cursorMeteor?.start(),
        stop: () => window.cursorMeteor?.stop(),
        destroy: () => window.cursorMeteor?.destroy(),
    };

})();