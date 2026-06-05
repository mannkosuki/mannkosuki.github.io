/**
 * C.C. Girl v2 (基于图片的看板娘 + 动态眼睛追踪)
 * 使用方式：<script src="../../kanbanJS/cc-girl.js"></script>
 * 图片路径：../../images/kanban/cc.png
 */

(function() {
    "use strict";

    const CONFIG = {
        position: "right",
        bottom: 0,
        size: 280,
        zIndex: 9997,
        blinkInterval: 4000,
    };

    // 自动计算图片路径（根据当前HTML位置）
    function getImagePath() {
        // 获取当前脚本的路径，计算相对路径
        const scripts = document.getElementsByTagName('script');
        let scriptPath = '';
        for (let i = scripts.length - 1; i >= 0; i--) {
            if (scripts[i].src && scripts[i].src.includes('cc-girl.js')) {
                scriptPath = scripts[i].src;
                break;
            }
        }

        if (scriptPath) {
            // 从脚本路径计算图片路径
            // 脚本在 /kanbanJS/cc-girl.js
            // 图片在 /images/kanban/cc.png
            const basePath = scriptPath.substring(0, scriptPath.lastIndexOf('/'));
            return basePath.replace('/kanbanJS', '/images/kanban') + '/cc.png';
        }

        // 兜底：使用相对路径
        return '../../images/kanban/cc.png';
    }

    class CCGirlV2 {
        constructor() {
            this.container = null;
            this.mouseX = 0;
            this.mouseY = 0;
            this.isBlinking = false;
            this.imagePath = getImagePath();
            this.init();
        }

        init() {
            this.createDOM();
            this.bindEvents();
            this.startBlink();
        }

        createDOM() {
            this.container = document.createElement("div");
            this.container.id = "cc-girl-v2";
            this.container.style.cssText = `
                position: fixed;
                ${CONFIG.position}: 0;
                bottom: ${CONFIG.bottom}px;
                width: ${CONFIG.size}px;
                height: ${CONFIG.size * 1.2}px;
                z-index: ${CONFIG.zIndex};
                pointer-events: auto;
                cursor: pointer;
                user-select: none;
            `;

            this.container.innerHTML = `
                <img src="${this.imagePath}" style="
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    object-position: bottom;
                    display: block;
                " alt="C.C." onerror="this.style.display='none'; this.nextElementSibling.style.display='none'; console.log('CC图片加载失败:', this.src);">

                <svg class="eyes-overlay" viewBox="0 0 280 336" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                " xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="eyeGrad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#a5d6a7"/>
                            <stop offset="50%" style="stop-color:#66bb6a"/>
                            <stop offset="100%" style="stop-color:#43a047"/>
                        </radialGradient>
                    </defs>

                    <g class="eye-left" transform="translate(95, 128)">
                        <ellipse cx="0" cy="0" rx="14" ry="12" fill="#fff" opacity="0.9"/>
                        <g class="pupil-left">
                            <ellipse cx="0" cy="0" rx="10" ry="8" fill="url(#eyeGrad)"/>
                            <ellipse cx="0" cy="0" rx="5" ry="6" fill="#2e7d32"/>
                            <circle cx="3" cy="-3" r="3" fill="#fff" opacity="0.9"/>
                            <circle cx="-2" cy="2" r="1.5" fill="#fff" opacity="0.6"/>
                        </g>
                        <path class="eyelid-left" d="M-15,0 Q0,-14 15,0 Z" fill="#ffe8e0" opacity="0"/>
                    </g>

                    <g class="eye-right" transform="translate(175, 128)">
                        <ellipse cx="0" cy="0" rx="14" ry="12" fill="#fff" opacity="0.9"/>
                        <g class="pupil-right">
                            <ellipse cx="0" cy="0" rx="10" ry="8" fill="url(#eyeGrad)"/>
                            <ellipse cx="0" cy="0" rx="5" ry="6" fill="#2e7d32"/>
                            <circle cx="3" cy="-3" r="3" fill="#fff" opacity="0.9"/>
                            <circle cx="-2" cy="2" r="1.5" fill="#fff" opacity="0.6"/>
                        </g>
                        <path class="eyelid-right" d="M-15,0 Q0,-14 15,0 Z" fill="#ffe8e0" opacity="0"/>
                    </g>
                </svg>
            `;

            document.body.appendChild(this.container);

            this.pupilLeft = this.container.querySelector(".pupil-left");
            this.pupilRight = this.container.querySelector(".pupil-right");
            this.eyelidLeft = this.container.querySelector(".eyelid-left");
            this.eyelidRight = this.container.querySelector(".eyelid-right");
        }

        bindEvents() {
            document.addEventListener("mousemove", (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
                if (!this.isBlinking) {
                    this.updateEyes();
                }
            });

            this.container.addEventListener("click", () => this.onClick());
            window.addEventListener("resize", () => this.updateEyes());
        }

        updateEyes() {
            const rect = this.container.getBoundingClientRect();
            const eyeCenterX = rect.left + rect.width * 0.48;
            const eyeCenterY = rect.top + rect.height * 0.38;

            const dx = this.mouseX - eyeCenterX;
            const dy = this.mouseY - eyeCenterY;
            const angle = Math.atan2(dy, dx);

            const maxDistance = 4;
            const distance = Math.min(Math.sqrt(dx * dx + dy * dy) / 40, maxDistance);

            const pupilX = Math.cos(angle) * distance;
            const pupilY = Math.sin(angle) * distance;

            this.pupilLeft.setAttribute("transform", `translate(${pupilX}, ${pupilY})`);
            this.pupilRight.setAttribute("transform", `translate(${pupilX}, ${pupilY})`);
        }

        startBlink() {
            const blink = () => {
                if (this.isBlinking) return;
                this.isBlinking = true;

                this.eyelidLeft.setAttribute("opacity", "1");
                this.eyelidRight.setAttribute("opacity", "1");

                setTimeout(() => {
                    this.eyelidLeft.setAttribute("opacity", "0");
                    this.eyelidRight.setAttribute("opacity", "0");
                    this.isBlinking = false;
                    this.updateEyes();
                }, 150);

                setTimeout(blink, CONFIG.blinkInterval + Math.random() * 2000);
            };

            setTimeout(blink, CONFIG.blinkInterval);
        }

        onClick() {
            this.container.style.transform = "scale(1.05)";
            this.container.style.transition = "transform 0.2s";
            setTimeout(() => {
                this.container.style.transform = "scale(1)";
            }, 200);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            window.ccGirlV2 = new CCGirlV2();
        });
    } else {
        window.ccGirlV2 = new CCGirlV2();
    }

    window.CCGirlV2API = {
        moveTo: (side) => {
            const el = document.getElementById("cc-girl-v2");
            if (el) {
                el.style.left = side === "left" ? "0" : "auto";
                el.style.right = side === "right" ? "0" : "auto";
            }
        },
        show: () => {
            const el = document.getElementById("cc-girl-v2");
            if (el) el.style.display = "block";
        },
        hide: () => {
            const el = document.getElementById("cc-girl-v2");
            if (el) el.style.display = "none";
        },
        destroy: () => {
            const el = document.getElementById("cc-girl-v2");
            if (el && el.parentNode) el.parentNode.removeChild(el);
        }
    };

})();