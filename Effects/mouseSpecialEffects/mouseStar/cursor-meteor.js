/**
 * Cursor Meteor (极简折线拖尾特效)
 * 鼠标移动：细线条折线拖尾，无大光团
 * 左键点击：小型粒子散射
 * 右键点击：小型环形扩散
 * 使用方式：<script src="cursor-meteor.js"></script>
 */

(function() {
    "use strict";

    const CONFIG = {
        // 拖尾
        maxPoints: 50,          // 最大拖尾点数
        lineWidth: 1.5,         // 线宽（细线）
        fadeSpeed: 0.06,        // 渐隐速度

        // 颜色
        // hueBase颜色对照
        // 120 绿色 | 200 青色 | 260 紫色 | 0 红色  | 30 橙色 | 330 粉色
        hueBase: 330,           // 基础色相（青色）
        hueRange: 60,           // 色相变化范围

        // 左键点击
        clickParticles: 12,     // 粒子数量
        clickSpeed: 5,          // 粒子速度
        clickLife: 0.6,         // 粒子寿命

        // 右键点击
        rightParticles: 18,
        rightSpeed: 7,
        rightLife: 0.8,

        zIndex: 9998,
    };

    // ============================== 拖尾点 ==============================
    class TrailPoint {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.life = 1;
        }
        update() {
            this.life -= CONFIG.fadeSpeed;
        }
    }

    // ============================== 粒子 ==============================
    class Particle {
        constructor(x, y, speed, life, hue) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * speed + 1;
            this.vx = Math.cos(angle) * spd;
            this.vy = Math.sin(angle) * spd;
            this.life = life;
            this.maxLife = life;
            this.hue = hue + Math.random() * 30 - 15;
            this.size = Math.random() * 1.5 + 0.5;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.96;
            this.vy *= 0.96;
            this.life -= 0.02;
        }

        draw(ctx) {
            if (this.life <= 0) return;
            const alpha = this.life / this.maxLife;
            ctx.save();
            ctx.globalAlpha = alpha * 0.8;
            ctx.fillStyle = `hsl(${this.hue}, 70%, 70%)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
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
            this.particles = [];
            this.animationId = null;
            this.isRunning = false;
            this.isVisible = true;

            this.mouseX = -100;
            this.mouseY = -100;
            this.lastMouseX = -100;
            this.lastMouseY = -100;

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

            document.addEventListener("visibilitychange", () => {
                this.isVisible = !document.hidden;
                if (this.isVisible && this.isRunning) this.animate();
            });

            this.start();
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        onMouseMove(e) {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            // 只在鼠标实际移动时添加点，不预生成
            if (this.lastMouseX > 0) {
                const dx = this.mouseX - this.lastMouseX;
                const dy = this.mouseY - this.lastMouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // 插值添加点，保证线条连续
                if (dist > 5) {
                    const steps = Math.ceil(dist / 5);
                    for (let i = 0; i < steps; i++) {
                        const t = i / steps;
                        this.trailPoints.push(new TrailPoint(
                            this.lastMouseX + dx * t,
                            this.lastMouseY + dy * t
                        ));
                    }
                } else {
                    this.trailPoints.push(new TrailPoint(this.mouseX, this.mouseY));
                }
            }

            this.lastMouseX = this.mouseX;
            this.lastMouseY = this.mouseY;
        }

        onClick(e) {
            const hue = CONFIG.hueBase + Math.random() * CONFIG.hueRange;
            for (let i = 0; i < CONFIG.clickParticles; i++) {
                this.particles.push(new Particle(e.clientX, e.clientY, CONFIG.clickSpeed, CONFIG.clickLife, hue));
            }
        }

        onRightClick(e) {
            e.preventDefault();
            const hue = 260 + Math.random() * 40;
            for (let i = 0; i < CONFIG.rightParticles; i++) {
                this.particles.push(new Particle(e.clientX, e.clientY, CONFIG.rightSpeed, CONFIG.rightLife, hue));
            }
        }

        drawTrail() {
            if (this.trailPoints.length < 2) return;
            const ctx = this.ctx;

            ctx.save();
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            // 绘制整条折线，使用渐变
            for (let i = 1; i < this.trailPoints.length; i++) {
                const p = this.trailPoints[i];
                const prev = this.trailPoints[i - 1];
                const alpha = p.life;
                if (alpha <= 0) continue;

                // 颜色从青色渐变到紫色
                const hue = CONFIG.hueBase + (1 - alpha) * CONFIG.hueRange;

                ctx.beginPath();
                ctx.moveTo(prev.x, prev.y);
                ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = `hsla(${hue}, 60%, 60%, ${alpha * 0.7})`;
                ctx.lineWidth = CONFIG.lineWidth * alpha;
                ctx.stroke();
            }

            ctx.restore();
        }

        animate() {
            if (!this.isRunning || !this.isVisible) return;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // 更新拖尾
            this.trailPoints.forEach(p => p.update());
            this.trailPoints = this.trailPoints.filter(p => p.life > 0);
            if (this.trailPoints.length > CONFIG.maxPoints) {
                this.trailPoints.splice(0, this.trailPoints.length - CONFIG.maxPoints);
            }

            // 更新粒子
            this.particles.forEach(p => p.update());
            this.particles = this.particles.filter(p => p.life > 0);

            // 绘制
            this.drawTrail();
            this.particles.forEach(p => p.draw(this.ctx));

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