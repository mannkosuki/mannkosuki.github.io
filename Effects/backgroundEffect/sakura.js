/**
 * Sakura (樱花飘落特效)
 * 修复：页面切换后速度异常问题
 */

(function() {
    "use strict";

    const CONFIG = {
        petalCount: 100,
        minRadius: 2,
        maxRadius: 7,
        minSpeedY: 0.5,
        maxSpeedY: 1.5,
        minSpeedX: -0.5,
        maxSpeedX: 0.5,
        minAlpha: 0.4,
        maxAlpha: 0.9,
        color: "#ffc0dd",
        zIndex: 9999,
        stopOnHidden: true,
    };

    class Petal {
        constructor(canvasWidth, canvasHeight) {
            this.reset(canvasWidth, canvasHeight, true);
        }

        reset(canvasWidth, canvasHeight, randomY = false) {
            this.x = Math.random() * canvasWidth;
            this.y = randomY ? Math.random() * canvasHeight : -10;
            this.r = Math.random() * (CONFIG.maxRadius - CONFIG.minRadius) + CONFIG.minRadius;
            this.sy = Math.random() * (CONFIG.maxSpeedY - CONFIG.minSpeedY) + CONFIG.minSpeedY;
            this.sx = Math.random() * (CONFIG.maxSpeedX - CONFIG.minSpeedX) + CONFIG.minSpeedX;
            this.alpha = Math.random() * (CONFIG.maxAlpha - CONFIG.minAlpha) + CONFIG.minAlpha;
            this.sway = Math.random() * 0.02 + 0.01;
            this.swayOffset = Math.random() * Math.PI * 2;
        }

        update(canvasWidth, canvasHeight, time) {
            this.y += this.sy;
            this.x += this.sx + Math.sin(time * this.sway + this.swayOffset) * 0.3;

            if (this.y > canvasHeight + 10) {
                this.reset(canvasWidth, canvasHeight, false);
            }
            if (this.x > canvasWidth + 10) {
                this.x = -10;
            } else if (this.x < -10) {
                this.x = canvasWidth + 10;
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = CONFIG.color;
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.r, this.r * 0.7, this.swayOffset, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class SakuraManager {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.petals = [];
            this.animationId = null;
            this.isRunning = false;
            this.isVisible = true;
            this.time = 0;
            this.lastFrameTime = 0;      // 新增：上一帧的真实时间
            this.frameCount = 0;         // 新增：用于控制摆动，替代 time
            this.init();
        }

        init() {
            this.canvas = document.createElement("canvas");
            this.canvas.id = "sakura-canvas";
            this.canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: ${CONFIG.zIndex};
            `;
            document.body.appendChild(this.canvas);

            this.ctx = this.canvas.getContext("2d");
            this.resize();

            this.petals = Array.from(
                { length: CONFIG.petalCount },
                () => new Petal(this.canvas.width, this.canvas.height)
            );

            window.addEventListener("resize", () => this.resize());

            if (CONFIG.stopOnHidden) {
                document.addEventListener("visibilitychange", () => {
                    if (document.hidden) {
                        this.isVisible = false;
                        this.lastFrameTime = 0;  // 重置时间基准
                    } else {
                        this.isVisible = true;
                        if (this.isRunning) {
                            this.lastFrameTime = 0;  // 恢复时重置，避免时间差累积
                            this.animate(performance.now());
                        }
                    }
                });
            }

            this.start();
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        // 核心修复：用 timestamp 控制，每帧只执行一次
        animate(timestamp) {
            if (!this.isRunning || !this.isVisible) return;

            // 限制帧率：如果距离上一帧不到 16ms，跳过
            if (this.lastFrameTime && (timestamp - this.lastFrameTime) < 14) {
                this.animationId = requestAnimationFrame((ts) => this.animate(ts));
                return;
            }

            this.lastFrameTime = timestamp;
            this.frameCount++;  // 用 frameCount 替代 time，每帧只增1

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.petals.forEach(petal => {
                petal.update(this.canvas.width, this.canvas.height, this.frameCount);
                petal.draw(this.ctx);
            });

            this.animationId = requestAnimationFrame((ts) => this.animate(ts));
        }

        start() {
            if (this.isRunning) return;
            this.isRunning = true;
            this.lastFrameTime = 0;
            this.frameCount = 0;
            this.animate(performance.now());
        }

        stop() {
            this.isRunning = false;
            this.lastFrameTime = 0;
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

        setPetalCount(count) {
            const current = this.petals.length;
            if (count > current) {
                for (let i = 0; i < count - current; i++) {
                    this.petals.push(new Petal(this.canvas.width, this.canvas.height));
                }
            } else if (count < current) {
                this.petals.splice(0, current - count);
            }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            window.sakura = new SakuraManager();
        });
    } else {
        window.sakura = new SakuraManager();
    }

    window.SakuraAPI = {
        start: () => window.sakura?.start(),
        stop: () => window.sakura?.stop(),
        destroy: () => window.sakura?.destroy(),
        setCount: (n) => window.sakura?.setPetalCount(n),
    };

})();