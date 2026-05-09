// ==============================
// 文章配置（只改这里）
// ==============================
const articles = [
    {
        title: "I2C tool使用手册",
        desc: "i2c作为工作中常用到的协议之一，如何优雅的使用？",
        path: "./article/article1/index.html",
        cover: ""
    },
    {
        title: "Docker教程",
        desc: "Docker为什么会出现？开发和上线两套环境的问题，用容器化技术一次性解决",
        path: "./article/article1/index.html",
        cover: "https://picsum.photos/400/300?random=1"
    }
];

// ==============================
// 自动渲染文章
// ==============================
function renderArticles() {
    const list = document.getElementById('articleList');
    list.innerHTML = '';
    articles.forEach(art => {
        list.innerHTML += `
        <a class="article-card" href="${art.path}">
            <div class="card-cover" style="background-image: url('${art.cover}')"></div>
            <div class="card-content">
                <div class="card-title">${art.title}</div>
                <div class="card-excerpt">${art.desc}</div>
            </div>
        </a>`;
    });
    document.getElementById('articleCount').innerText = articles.length;
}

// ==============================
// 音乐
// ==============================
const musics = [
    "./music/nanndemonaiya.mp3",
    "./music/yakimochi.mp3",
    "./music/hanabiwouchiageru.mp3",
];
const bgm = document.getElementById("bgm");
bgm.innerHTML = `<source src="${musics[Math.floor(Math.random() * musics.length)]}" type="audio/mpeg">`;

window.addEventListener("load", () => {
    document.addEventListener('click', () => bgm.play(), { once: true });
});

function toggleMusic() {
    bgm.paused ? bgm.play() : bgm.pause();
}

// ==============================
// 文字动画
// ==============================
const text = "难过的时候，就慢慢地活下去";
const container = document.getElementById("textContainer");
const letters = [];

for (let i = 0; i < text.length; i++) {
    const s = document.createElement("span");
    s.innerText = text[i];
    container.appendChild(s);
    letters.push(s);
}

async function runText() {
    while (true) {
        for (let i = 0; i < letters.length; i++) {
            await new Promise(r => setTimeout(r, 120));
            letters[i].style.opacity = 1;
        }
        await new Promise(r => setTimeout(r, 2000));
        for (let i = letters.length - 1; i >= 0; i--) {
            await new Promise(r => setTimeout(r, 120));
            letters[i].style.opacity = 0;
        }
        await new Promise(r => setTimeout(r, 800));
    }
}

// ==============================
// 樱花特效
// ==============================
const canvas = document.getElementById("sakura");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Petal {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.r = Math.random() * 5 + 2;
        this.sy = Math.random() * 1 + 0.5;
        this.sx = Math.random() * 0.5 - 0.25;
        this.alpha = Math.random() * 0.6 + 0.4;
    }
    update() {
        this.y += this.sy;
        this.x += this.sx;
        if (this.y > canvas.height) {
            this.y = -10;
            this.x = Math.random() * canvas.width;
        }
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = "#ffc0dd";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

const petals = Array.from({ length: 100 }, () => new Petal());

function animateSakura() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateSakura);
}

// ==============================
// 启动
// ==============================
renderArticles();
runText();
animateSakura();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});