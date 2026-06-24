// ==============================
// 文章数据
// ==============================
const articles = [
  { title: "I2C tool的使用", desc: "作为实际应用中最常见的工具，如何优雅地使用？",
    path: "./article/article1/index.html", cover: "./images/article/homepageArticlePicture/article1/i2ctool.png" },

  { title: "BMC基础通信D-BUS编码规范",
    desc: "BMC 固件基于OpenBMC框架进行开发与演进。OpenBMC 以 systemd 及其管理的各类服务为核心，"
      +"构建了完整的服务器管理与监控体系。系统中，每个服务均以独立进程的形式在后台运行。为了实现各服务之间的数据交互与协同，"
      +"OpenBMC需要借助进程间通信(IPC)机制来完成信息传递。",
    path: "./article/article2/index.html", cover: "./images/article/homepageArticlePicture/article2/cover_dbus.png" },

  { title: "DBus常用命令", desc: "作为日常最常使用的debug手段，如何熟练使用？",
    path: "./article/article3/index.html", cover: "./images/article/homepageArticlePicture/article3/cover_dbus_cmd.png" },

  { title: "异步编程方式介绍", desc: "作为openBMC最常使用的异步编程，如何正确地使用？",
    path: "./article/article4/index.html", cover: "./images/article/homepageArticlePicture/article4/cover_async.png" },

  { title: "网卡监控协议", desc: "mctp协议作为网卡最常用的通信协议，需要知道些什么？",
  path: "./article/article5/index.html", cover: "./images/article/homepageArticlePicture/article5/cover_nic_protocol.png" },

  { title: "bitbake实用指南", desc: "bitbake 使用指南",
  path: "./article/article6/index.html", cover: "./images/article/homepageArticlePicture/article6/bitbake.png" },

  { title: "Bitbake 构建流程与变量详解", desc: "bitbake 是如何从bb 文件到编译出包的？",
  path: "./article/article7/index.html", cover: "./images/article/homepageArticlePicture/article7/bitbake_compile.png" },

  { title: "BMC基础知识介绍", desc: "基于2500对BMC各个模块基本介绍",
  path: "./article/article8/index.html", cover: "./images/article/homepageArticlePicture/article8/BMC基础知识.png" },
];

// ==============================
// 排序状态
// ==============================
let sortOrder = "new-to-old";

function getSortedArticles() {
  return sortOrder === "new-to-old" ? [...articles].reverse() : [...articles];
}

// ==============================
// 分页配置
// ==============================
const PAGE_SIZE = 10;
let currentPage = 1;

// ==============================
// 渲染当前页文章
// ==============================
function renderArticles() {
  const list = document.getElementById("articleList");
  const pagination = document.getElementById("pagination");
  list.innerHTML = "";

  const sortedArticles = getSortedArticles();
  const total = sortedArticles.length;
  const totalPage = Math.ceil(total / PAGE_SIZE);
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageData = sortedArticles.slice(start, end);

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

  renderPagination(totalPage);
}

// ==============================
// 渲染分页按钮
// ==============================
function renderPagination(totalPage) {
  const el = document.getElementById("pagination");
  el.innerHTML = "";

  if (totalPage <= 1) return;

  const first = createBtn("首页", currentPage === 1, () => {
    currentPage = 1;
    renderArticles();
  });

  const prev = createBtn("上一页", currentPage === 1, () => {
    currentPage--;
    renderArticles();
  });

  el.appendChild(first);
  el.appendChild(prev);

  for (let i = 1; i <= totalPage; i++) {
    const num = createBtn(i, false, () => {
      currentPage = i;
      renderArticles();
    });
    if (i === currentPage) num.classList.add("active");
    el.appendChild(num);
  }

  const next = createBtn("下一页", currentPage === totalPage, () => {
    currentPage++;
    renderArticles();
  });

  const last = createBtn("尾页", currentPage === totalPage, () => {
    currentPage = totalPage;
    renderArticles();
  });

  el.appendChild(next);
  el.appendChild(last);
}

function createBtn(text, disabled, click) {
  const btn = document.createElement("button");
  btn.innerText = text;
  btn.disabled = disabled;
  btn.onclick = click;
  return btn;
}

// ==============================
// 排序切换按钮
// ==============================
function initSortToggle() {
  const articleSection = document.querySelector(".article-section");
  if (!articleSection) return;

  const h2 = articleSection.querySelector("h2");
  if (h2) {
    h2.innerHTML = "文章列表";
    h2.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1.8rem;
      margin-bottom: 30px;
      padding-left: 15px;
      border-left: 4px solid #409eff;
      color: #ffffff !important;
    `;
  }

  const sortBtn = document.createElement("span");
  sortBtn.id = "sortBtn";
  sortBtn.style.cssText = `
    font-size: 14px;
    font-weight: normal;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    user-select: none;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    gap: 4px;
  `;

  const arrowIcon = sortOrder === "new-to-old" ? "↓" : "↑";
  sortBtn.innerHTML = `排序 ${arrowIcon}`;

  sortBtn.onmouseenter = () => sortBtn.style.color = "rgba(255, 255, 255, 0.9)";
  sortBtn.onmouseleave = () => sortBtn.style.color = "rgba(255, 255, 255, 0.6)";

  sortBtn.addEventListener("click", () => {
    sortOrder = sortOrder === "new-to-old" ? "old-to-new" : "new-to-old";
    const newArrow = sortOrder === "new-to-old" ? "↓" : "↑";
    sortBtn.innerHTML = `排序 ${newArrow}`;
    currentPage = 1;
    renderArticles();
  });

  if (h2) {
    h2.appendChild(sortBtn);
  }
}

// ==============================
// 音乐播放器
// ==============================
const musics = [
  { name: "化物語", path: "./music/bakemonogatari.mp3" },
  { name: "卡农", path: "./music/cannon.mp3" },
  { name: "超人不会飞", path: "./music/chaorenbuhuifei.mp3" },
  { name: "稻香", path: "./music/daoxiang.mp3" },
  { name: "fensehaiyang", path: "./music/fensehaiyang.mp3" },
  { name: "freelucky", path: "./music/freelucky.mp3" },
  { name: "打上花火", path: "./music/hanabiwouchiageru.mp3" },
  { name: "hisTheme", path: "./music/hisTheme.mp3" },
  { name: "モノクロ", path: "./music/monokuro.mp3" },
  { name: "無くした日々にさよなら", path: "./music/nakusitahibinisayonara.mp3" },
  { name: "なんでもないや", path: "./music/nanndemonaiya.mp3" },
  { name: "Normal No More", path: "./music/normalNoMore.mp3" },
  { name: "ヨスガノソラ Old Memory", path: "./music/oldMemory.mp3" },
  { name: "rain", path: "./music/rain.mp3" },
  { name: "Ref_rain", path: "./music/Ref_rain.mp3" },
  { name: "River Flows In You", path: "./music/riverFlowsInYou.mp3" },
  { name: "SacredPlaySecretPlace", path: "./music/SacredPlaySecretPlace.mp3" },
  { name: "粉色海洋", path: "./music/shanhuhai.mp3" },
  { name: "summer", path: "./music/summer.mp3" },
  { name: "ヤキモチ", path: "./music/yakimochi.mp3" },
  { name: "ヨスガノソラ メインテーマ", path: "./music/yosuganosora.mp3" },
  { name: "游园会", path: "./music/youYuanHui.mp3" },
  { name: "指纹", path: "./music/zhiwen.mp3" },
];

const bgm = document.getElementById("bgm");
let currentTrackIndex = 0;
let playMode = "order";
let isFirstPlay = true;

function initMusicPlayer() {
  const musicControl = document.querySelector(".music-control");
  if (!musicControl) return;

  const playerContainer = document.createElement("div");
  playerContainer.className = "music-player-container";
  musicControl.parentNode.insertBefore(playerContainer, musicControl);

  const prevBtn = document.createElement("button");
  prevBtn.className = "music-btn music-prev";
  prevBtn.innerHTML = "⏮";
  prevBtn.title = "上一首";
  prevBtn.onclick = playPrev;
  playerContainer.appendChild(prevBtn);

  const playBtn = document.createElement("button");
  playBtn.className = "music-btn music-play";
  playBtn.innerHTML = "▶";
  playBtn.title = "播放/暂停";
  playBtn.onclick = toggleMusic;
  playerContainer.appendChild(playBtn);

  const nextBtn = document.createElement("button");
  nextBtn.className = "music-btn music-next";
  nextBtn.innerHTML = "⏭";
  nextBtn.title = "下一首";
  nextBtn.onclick = playNext;
  playerContainer.appendChild(nextBtn);

  const modeBtn = document.createElement("button");
  modeBtn.className = "music-btn music-mode";
  modeBtn.innerHTML = getModeIcon(playMode);
  modeBtn.title = getModeTitle(playMode);
  modeBtn.onclick = () => {
      cyclePlayMode();
      modeBtn.innerHTML = getModeIcon(playMode);
      modeBtn.title = getModeTitle(playMode);
  };
  playerContainer.appendChild(modeBtn);

  const listBtn = document.createElement("button");
  listBtn.className = "music-btn music-list";
  listBtn.innerHTML = "☰";
  listBtn.title = "播放列表";
  listBtn.onclick = togglePlaylist;
  playerContainer.appendChild(listBtn);

  const trackInfo = document.createElement("div");
  trackInfo.className = "music-track-info";
  trackInfo.id = "trackInfo";
  trackInfo.innerHTML = `<span class="track-name" id="trackName">${musics[currentTrackIndex].name}</span>`;
  playerContainer.appendChild(trackInfo);

  // 加载保存的颜色
  const savedColor = localStorage.getItem("trackNameColor");
  if (savedColor) {
    document.documentElement.style.setProperty("--track-name-color", savedColor);
  } else {
    // 没有保存过，默认白色
    document.documentElement.style.setProperty("--track-name-color", "#ffffff");
  }

  // 右键菜单：颜色选择
  trackInfo.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showColorPicker(e.clientX, e.clientY);
  });

  // ==============================
  // 播放列表弹窗（带搜索）
  // ==============================
  const playlistPopup = document.createElement("div");
  playlistPopup.className = "music-playlist-popup";
  playlistPopup.id = "playlistPopup";
  playlistPopup.style.display = "none";

  const header = document.createElement("div");
  header.className = "playlist-header";
  header.innerText = "播放列表";
  playlistPopup.appendChild(header);

  const searchBox = document.createElement("div");
  searchBox.className = "playlist-search-box";
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "playlistSearch";
  searchInput.placeholder = "搜索歌曲...";
  searchBox.appendChild(searchInput);
  playlistPopup.appendChild(searchBox);

  const listContainer = document.createElement("div");
  listContainer.className = "playlist-items";
  listContainer.id = "playlistItems";
  playlistPopup.appendChild(listContainer);

  playerContainer.appendChild(playlistPopup);

  renderPlaylistItems();

  searchInput.addEventListener("input", (e) => {
    renderPlaylistItems(e.target.value);
  });

  listContainer.addEventListener("click", (e) => {
      const item = e.target.closest(".playlist-item");
      if (item) {
          const idx = parseInt(item.dataset.index);
          playTrack(idx);
          togglePlaylist();
      }
  });

  document.addEventListener("click", (e) => {
    const popup = document.getElementById("playlistPopup");
    const listButton = document.querySelector(".music-list");
    if (popup && popup.style.display === "block") {
      if (!popup.contains(e.target) && e.target !== listButton && !listButton.contains(e.target)) {
        popup.style.display = "none";
      }
    }
  });

  // ==============================
  // 颜色选择器弹窗
  // ==============================
  const colorPickerPopup = document.createElement("div");
  colorPickerPopup.id = "colorPickerPopup";
  colorPickerPopup.style.cssText = `
    position: fixed;
    display: none;
    z-index: 10000;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 12px;
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,0.1);
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    gap: 8px;
    flex-direction: column;
    align-items: center;
  `;

  colorPickerPopup.innerHTML = `
    <div style="font-size: 13px; color: #333; font-weight: 600; margin-bottom: 4px;">歌名颜色</div>
    <input type="color" id="colorPickerInput" value="${localStorage.getItem("trackNameColor") || "#ffffff"}">
    <div style="display: flex; gap: 6px; margin-top: 4px;">
      <button id="colorPickerReset" style="padding: 4px 12px; border: none; border-radius: 6px; background: #f0f0f0; color: #666; font-size: 12px; cursor: pointer;">重置</button>
      <button id="colorPickerClose" style="padding: 4px 12px; border: none; border-radius: 6px; background: #409eff; color: white; font-size: 12px; cursor: pointer;">确认</button>
    </div>
  `;

  document.body.appendChild(colorPickerPopup);

  const colorInput = document.getElementById("colorPickerInput");
  const colorReset = document.getElementById("colorPickerReset");
  const colorClose = document.getElementById("colorPickerClose");

  colorInput.addEventListener("input", (e) => {
    const color = e.target.value;
    document.documentElement.style.setProperty("--track-name-color", color);
  });

  colorInput.addEventListener("change", (e) => {
    localStorage.setItem("trackNameColor", e.target.value);
  });

  colorReset.addEventListener("click", () => {
    const defaultColor = "#ffffff"; // 重置为白色
    colorInput.value = defaultColor;
    document.documentElement.style.setProperty("--track-name-color", defaultColor);
    localStorage.removeItem("trackNameColor");
  });

  colorClose.addEventListener("click", () => {
    colorPickerPopup.style.display = "none";
  });

  document.addEventListener("click", (e) => {
    const popup = document.getElementById("colorPickerPopup");
    if (popup && popup.style.display === "flex") {
      if (!popup.contains(e.target) && e.target !== trackInfo && !trackInfo.contains(e.target)) {
        popup.style.display = "none";
      }
    }
  });

  function showColorPicker(x, y) {
    const popup = document.getElementById("colorPickerPopup");
    popup.style.display = "flex";
    const finalX = Math.min(x, window.innerWidth - 160);
    const finalY = Math.min(y, window.innerHeight - 120);
    popup.style.left = finalX + "px";
    popup.style.top = finalY + "px";
  }

  musicControl.style.display = "none";

  bgm.addEventListener("ended", onTrackEnded);
  bgm.addEventListener("play", updatePlayButton);
  bgm.addEventListener("pause", updatePlayButton);
}

// ==============================
// 渲染播放列表（支持搜索过滤）
// ==============================
function renderPlaylistItems(filter = "") {
  const listContainer = document.getElementById("playlistItems");
  if (!listContainer) return;

  const filterLower = filter.toLowerCase().trim();
  const filtered = musics.map((m, i) => ({ ...m, index: i }))
                        .filter(m => m.name.toLowerCase().includes(filterLower));

  let html = "";
  if (filtered.length === 0) {
    html = '<div class="playlist-empty">无匹配歌曲</div>';
  } else {
    filtered.forEach((m) => {
      html += `<div class="playlist-item ${m.index === currentTrackIndex ? 'active' : ''}" data-index="${m.index}">
          <span class="item-index">${m.index + 1}</span>
          <span class="item-name">${m.name}</span>
          <span class="item-status">${m.index === currentTrackIndex ? '▶' : ''}</span>
      </div>`;
    });
  }
  listContainer.innerHTML = html;
}

// ==============================
// 模式图标
// ==============================
function getModeIcon(mode) {
  const color = "#555";
  switch(mode) {
      case "loop": 
          return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 2.1l4 4-4 4"/>
            <path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8"/>
            <path d="M7 21.9l-4-4 4-4"/>
            <path d="M21 11.8v2a4 4 0 0 1-4 4H4.2"/>
            <text x="12" y="14" text-anchor="middle" fill="${color}" stroke="none" font-size="8" font-weight="bold">1</text>
          </svg>`;
      case "random": 
          return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 3h5v5"/>
            <path d="M4 20L21 3"/>
            <path d="M21 16v5h-5"/>
            <path d="M15 15l5 5"/>
            <path d="M4 4l5 5"/>
          </svg>`;
      default: 
          return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 2.1l4 4-4 4"/>
            <path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8"/>
            <path d="M7 21.9l-4-4 4-4"/>
            <path d="M21 11.8v2a4 4 0 0 1-4 4H4.2"/>
          </svg>`;
  }
}

function getModeTitle(mode) {
  switch(mode) {
      case "loop": return "单曲循环";
      case "random": return "随机播放";
      default: return "顺序播放";
  }
}

function cyclePlayMode() {
  if (playMode === "order") playMode = "loop";
  else if (playMode === "loop") playMode = "random";
  else playMode = "order";
}

function loadTrack(index) {
  currentTrackIndex = index;
  bgm.innerHTML = `<source src="${musics[index].path}" type="audio/mpeg">`;
  bgm.load();
  updateTrackInfo();
  updatePlaylistUI();
}

function playTrack(index) {
  loadTrack(index);
  bgm.play().catch(() => {});
}

function playNext() {
  let nextIndex;
  if (playMode === "random") {
      nextIndex = Math.floor(Math.random() * musics.length);
  } else {
      nextIndex = (currentTrackIndex + 1) % musics.length;
  }
  playTrack(nextIndex);
}

function playPrev() {
  let prevIndex;
  if (playMode === "random") {
      prevIndex = Math.floor(Math.random() * musics.length);
  } else {
      prevIndex = (currentTrackIndex - 1 + musics.length) % musics.length;
  }
  playTrack(prevIndex);
}

function onTrackEnded() {
  if (playMode === "loop") {
      bgm.currentTime = 0;
      bgm.play();
  } else {
      playNext();
  }
}

function toggleMusic() {
  if (isFirstPlay) {
      loadTrack(currentTrackIndex);
      isFirstPlay = false;
  }
  if (bgm.paused) {
      bgm.play().catch(() => {});
  } else {
      bgm.pause();
  }
}

function updatePlayButton() {
  const playBtn = document.querySelector(".music-play");
  if (playBtn) {
      playBtn.innerHTML = bgm.paused ? "▶" : "⏸";
  }
}

function updateTrackInfo() {
  const trackInfo = document.querySelector(".music-track-info");
  const trackName = document.querySelector(".music-track-info .track-name");
  if (!trackInfo || !trackName) return;

  const name = musics[currentTrackIndex].name;

  // 先重置为纯文本，移除 scroll 类
  trackName.classList.remove("scroll");
  trackName.innerText = name;

  // 测量原始宽度
  requestAnimationFrame(() => {
    const isOverflow = trackName.scrollWidth > trackInfo.clientWidth;

    if (isOverflow) {
      // 溢出：复制文本实现无缝循环滚动
      trackName.innerHTML = `<span class="scroll-content">${name}&nbsp;&nbsp;&nbsp;&nbsp;${name}</span>`;
      trackName.classList.add("scroll");
    }
  });
}

function updatePlaylistUI() {
  const searchInput = document.getElementById("playlistSearch");
  renderPlaylistItems(searchInput ? searchInput.value : "");
}

function togglePlaylist() {
  const popup = document.getElementById("playlistPopup");
  if (popup) {
      popup.style.display = popup.style.display === "none" ? "block" : "none";
  }
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
initSortToggle();
runText();
animateSakura();
initMusicPlayer();

document.getElementById("articleCount").innerText = articles.length;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});