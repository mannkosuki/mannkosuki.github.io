// 美化版 鼠标流星拖尾 + 右键闪星特效（黑曜石暗黑版）
(function(){
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    canvas.style.background = 'transparent';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let w, h;
    function resize(){
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // 流星拖尾粒子 — 暗黑版（黑色柔光）
    class TrailParticle {
        constructor(x,y){
            this.x = x;
            this.y = y;
            this.radius = Math.random() * 1.2 + 0.8;
            this.alpha = 1;
            this.speedX = (Math.random() - 0.5) * 0.6;
            this.speedY = (Math.random() - 0.5) * 0.6;
            this.decay = Math.random() * 0.025 + 0.02;
        }
        update(){
            this.x += this.speedX;
            this.y += this.speedY;
            this.alpha -= this.decay;
        }
        draw(){
            ctx.save();
            ctx.globalAlpha = this.alpha;
            // 黑色粒子，暗影微微透光
            ctx.fillStyle = '#000000';
            ctx.shadowColor = '#222222';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
        }
    }

    // 右键闪星 — 暗黑星尘（黑色闪亮）
    class StarParticle {
        constructor(x,y){
            this.x = x;
            this.y = y;
            this.radius = Math.random() * 2 + 1;
            this.alpha = 1;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2.5 + 1;
            this.speedX = Math.cos(angle) * speed;
            this.speedY = Math.sin(angle) * speed;
        }
        update(){
            this.x += this.speedX;
            this.y += this.speedY;
            this.alpha -= 0.025;
            this.radius *= 0.97;
        }
        draw(){
            ctx.save();
            ctx.globalAlpha = this.alpha;
            // 黑色星芒
            ctx.fillStyle = '#000000';
            ctx.shadowColor = '#333333';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
        }
    }

    let trailList = [];
    let starList = [];

    window.addEventListener('mousemove', e => {
        if(trailList.length > 80) return;
        trailList.push(new TrailParticle(e.clientX, e.clientY));
    });

    window.addEventListener('contextmenu', e => {
        e.preventDefault();
        for(let i = 0; i < 16; i++){
            starList.push(new StarParticle(e.clientX, e.clientY));
        }
    });

    function animate(){
        ctx.clearRect(0,0,w,h);
        for(let i = trailList.length - 1; i >= 0; i--){
            const p = trailList[i];
            p.update();
            p.draw();
            if(p.alpha <= 0) trailList.splice(i,1);
        }
        for(let i = starList.length - 1; i >= 0; i--){
            const p = starList[i];
            p.update();
            p.draw();
            if(p.alpha <= 0 || p.radius < 0.15) starList.splice(i,1);
        }
        requestAnimationFrame(animate);
    }
    animate();
})();