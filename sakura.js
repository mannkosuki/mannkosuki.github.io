/**
 * Sakura (樱花飘落特效)
 * 独立模块，零依赖，自动初始化
 * 使用方式：在 HTML 中引入 <script src="sakura.js"></script> 即可
 */

(function() {
    "use strict";

    // ============================== 配置项 ==============================
    const CONFIG = {
        petalCount: 100,        // 花瓣数量
        minRadius: 2,           // 最小半径
        maxRadius: 7,           // 最大半径
        minSpeedY: 0.5,         // 最小下落速度
        maxSpeedY: 1.5,         // 最大下落速度
        minSpeedX: -0.5,        // 最小水平漂移
        maxSpeedX: 0.5,         // 最大水平漂移
        minAlpha: 0.4,          // 最小透明度
        maxAlpha: 0.9,          // 最大透明度
        color: "#ffc0dd",       // 花瓣颜色
        zIndex: 9999,           // 层级
        stopOnHidden: true,     // 页面不可见时暂停
    };

    // ============================== 花瓣类 ==============================
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
            // 添加轻微摆动
            this.sway = Math.random() * 0.02 + 0.01;
            this.swayOffset = Math.random() * Math.PI * 2;
        }

        update(canvasWidth, canvasHeight, time) {
            this.y += this.sy;
            this.x += this.sx + Math.sin(time * this.sway + this.swayOffset) * 0.3;

            // 边界处理
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
            // 绘制樱花形状（椭圆而非正圆）
            ctx.ellipse(this.x, this.y, this.r, this.r * 0.7, this.swayOffset, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // ============================== 樱花管理器 ==============================
    class SakuraManager {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.petals = [];
            this.animationId = null;
            this.isRunning = false;
            this.isVisible = true;
            this.time = 0;
            this.init();
        }

        init() {
            // 创建 canvas 元素
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

            // 初始化花瓣
            this.petals = Array.from(
                { length: CONFIG.petalCount },
                () => new Petal(this.canvas.width, this.canvas.height)
            );

            // 监听窗口大小变化
            window.addEventListener("resize", () => this.resize());

            // 监听页面可见性（性能优化）
            if (CONFIG.stopOnHidden) {
                document.addEventListener("visibilitychange", () => {
                    this.isVisible = !document.hidden;
                    if (this.isVisible && this.isRunning) {
                        this.animate();
                    }
                });
            }

            // 启动动画
            this.start();
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        animate() {
            if (!this.isRunning || !this.isVisible) return;

            this.time++;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.petals.forEach(petal => {
                petal.update(this.canvas.width, this.canvas.height, this.time);
                petal.draw(this.ctx);
            });

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

        // 动态调整花瓣数量
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

    // ============================== 初始化 ==============================
    // 等待 DOM 加载完成
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            window.sakura = new SakuraManager();
        });
    } else {
        window.sakura = new SakuraManager();
    }

    // 暴露全局控制接口
    window.SakuraAPI = {
        start: () => window.sakura?.start(),
        stop: () => window.sakura?.stop(),
        destroy: () => window.sakura?.destroy(),
        setCount: (n) => window.sakura?.setPetalCount(n),
    };

})();
