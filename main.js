// ==============================
// 文章数据
// ==============================
const articles = [
    { title: "I2C tool的使用", desc: "作为实际应用中最常见的工具，如何优雅得使用？", path: "/article/1/index.html", cover: "https://picsum.photos/400/300?random=1" },
    { title: "文章2", desc: "描述2", path: "/article/2/index.html", cover: "https://picsum.photos/400/300?random=1" },
    { title: "文章3", desc: "描述3", path: "/article/3/index.html", cover: "https://picsum.photos/400/300?random=1" },
    { title: "文章4", desc: "描述4", path: "/article/4/index.html", cover: "https://picsum.photos/400/300?random=1" },
    { title: "文章5", desc: "描述5", path: "/article/5/index.html", cover: "https://picsum.photos/400/300?random=1" },
    { title: "文章6", desc: "描述6", path: "/article/6/index.html", cover: "https://picsum.photos/400/300?random=1" },
    { title: "文章7", desc: "描述7", path: "/article/7/index.html", cover: "https://picsum.photos/400/300?random=1" },
    { title: "文章8", desc: "描述8", path: "/article/8/index.html", cover: "https://picsum.photos/400/300?random=1" },
    { title: "文章9", desc: "描述9", path: "/article/9/index.html", cover: "https://picsum.photos/400/300?random=1" },
    { title: "文章10", desc: "描述10", path: "/article/10/index.html", cover: "https://picsum.photos/400/300?random=1" },
    { title: "文章11", desc: "描述11", path: "/article/11/index.html", cover: "https://picsum.photos/400/300?random=1" },
    { title: "文章12", desc: "描述12", path: "/article/12/index.html", cover: "https://picsum.photos/400/300?random=1" },
  ];
  
  // ==============================
  // 分页配置
  // ==============================
  const PAGE_SIZE = 10; // 每页10篇
  let currentPage = 1;
  
  // ==============================
  // 渲染当前页文章
  // ==============================
  function renderArticles() {
    const list = document.getElementById("articleList");
    const pagination = document.getElementById("pagination");
    list.innerHTML = "";
  
    // 计算分页
    const total = articles.length;
    const totalPage = Math.ceil(total / PAGE_SIZE);
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageData = articles.slice(start, end);
  
    // 渲染文章
    pageData.forEach((art, index) => {
        const globalIndex = (currentPage - 1) * PAGE_SIZE + index;
        const isRight = globalIndex % 2 === 1;
      
        list.innerHTML += `
        <a class="article-card ${isRight ? 'article-card-reverse' : ''}" href="${art.path}">
            <div class="card-text">
                <div class="card-title">${art.title}</div>
                <div class="card-excerpt">${art.desc}</div>
            </div>
            <div class="card-image" style="background-image: url('${art.cover || ''}');"></div>
        </a>`;
    });
  
    // 渲染分页按钮
    renderPagination(totalPage);
  }
  
  // ==============================
  // 渲染分页按钮
  // ==============================
  function renderPagination(totalPage) {
    const el = document.getElementById("pagination");
    el.innerHTML = "";
  
    if (totalPage <= 1) return;
  
    // 首页
    const first = createBtn("首页", currentPage === 1, () => {
      currentPage = 1;
      renderArticles();
    });
  
    // 上一页
    const prev = createBtn("上一页", currentPage === 1, () => {
      currentPage--;
      renderArticles();
    });
  
    el.appendChild(first);
    el.appendChild(prev);
  
    // 数字页
    for (let i = 1; i <= totalPage; i++) {
      const num = createBtn(i, false, () => {
        currentPage = i;
        renderArticles();
      });
      if (i === currentPage) num.classList.add("active");
      el.appendChild(num);
    }
  
    // 下一页
    const next = createBtn("下一页", currentPage === totalPage, () => {
      currentPage++;
      renderArticles();
    });
  
    // 尾页
    const last = createBtn("尾页", currentPage === totalPage, () => {
      currentPage = totalPage;
      renderArticles();
    });
  
    el.appendChild(next);
    el.appendChild(last);
  }
  
  // 按钮生成工具
  function createBtn(text, disabled, click) {
    const btn = document.createElement("button");
    btn.innerText = text;
    btn.disabled = disabled;
    btn.onclick = click;
    return btn;
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