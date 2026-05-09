document.addEventListener('DOMContentLoaded', () => {
    const kaban = document.getElementById('kaban');
    if (!kaban) return;

    const size = 110;
    const maxAngle = 15; // 把最大角度调小，转头更自然

    document.addEventListener('mousemove', (e) => {
        const kabanCenterX = 10 + size / 2;
        const kabanCenterY = window.innerHeight - 10 - size / 2;

        const dx = e.clientX - kabanCenterX;
        const dy = e.clientY - kabanCenterY;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);

        angle = Math.max(-maxAngle, Math.min(maxAngle, angle));

        kaban.style.transform = `rotate(${angle}deg)`;
    });
});