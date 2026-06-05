// 鼠标绿色细线拖尾 修复黑屏版
(function(){
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    // 关键：画布透明，不遮挡页面
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

    // 轨迹点数组
    let points = [];
    // 最大线条长度(点数)
    const MAX_LEN = 30;
    // 绿色细线
    const LINE_COLOR = '#39ff14';
    const LINE_WIDTH = 2;

    // 鼠标移动记录坐标
    window.addEventListener('mousemove', e => {
        points.push({ x: e.clientX, y: e.clientY });
        // 超过最大长度 从头部移除
        if(points.length > MAX_LEN){
            points.shift();
        }
    });

    // 禁用右键菜单 无多余特效
    window.addEventListener('contextmenu', e => {
        e.preventDefault();
    });

    function animate(){
        // 只清画布，不用遮罩填充，不会黑屏
        ctx.clearRect(0, 0, w, h);

        if(points.length < 2){
            requestAnimationFrame(animate);
            return;
        }

        // 画绿色平滑细线
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for(let i = 1; i < points.length; i++){
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = LINE_COLOR;
        ctx.lineWidth = LINE_WIDTH;
        ctx.lineCap = 'round';
        ctx.stroke();

        requestAnimationFrame(animate);
    }
    animate();
})();