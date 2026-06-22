// ==============================
// 顶部导航搜索功能
// ==============================

// 文章数据（需要在使用前赋值，或从页面全局变量获取）
let searchArticlesData = [];

/**
 * 初始化搜索功能
 * @param {Array} articles - 文章数据数组，格式同你的 articles 变量
 */
function initSearch(articles) {
    searchArticlesData = articles || [];
    createNavBar();
    bindEvents();
}

/**
 * 创建导航栏 HTML
 */
function createNavBar() {
    const nav = document.createElement('div');
    nav.className = 'top-nav';
    nav.id = 'topNav';

    nav.innerHTML = `
        <a href="./index.html" class="nav-item">
            <span class="nav-icon">🏠</span>
            <span>首页</span>
        </a>
        <a href="#" class="nav-item">
            <span class="nav-icon">⏱</span>
            <span>时光机</span>
        </a>
        <a href="#" class="nav-item">
            <span class="nav-icon">🏷</span>
            <span>标签</span>
        </a>
        <a href="#" class="nav-item">
            <span class="nav-icon">📁</span>
            <span>分类</span>
        </a>
        <div class="nav-item nav-search" id="navSearch">
            <span class="nav-icon">🔍</span>
            <span>搜索</span>
            <div class="search-popup" id="searchPopup">
                <div class="search-popup-header">
                    <div class="search-input-wrapper">
                        <input type="text" id="searchInput" placeholder="搜索文章..." autocomplete="off">
                    </div>
                    <button class="search-popup-close" id="searchClose">✕</button>
                </div>
                <div class="search-results" id="searchResults"></div>
            </div>
        </div>
        <a href="#" class="nav-item">
            <span class="nav-icon">📋</span>
            <span>清单</span>
        </a>
        <a href="#" class="nav-item">
            <span class="nav-icon">🔗</span>
            <span>友链</span>
        </a>
        <a href="#" class="nav-item">
            <span class="nav-icon">💬</span>
            <span>留言板</span>
        </a>
        <a href="#" class="nav-item">
            <span class="nav-icon">❤</span>
            <span>关于</span>
        </a>
    `;

    // 插入到 body 最前面
    document.body.insertBefore(nav, document.body.firstChild);
}

/**
 * 绑定事件
 */
function bindEvents() {
    const navSearch = document.getElementById('navSearch');
    const searchPopup = document.getElementById('searchPopup');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');
    const searchResults = document.getElementById('searchResults');

    // 点击搜索按钮展开/收起弹窗
    navSearch.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = searchPopup.classList.contains('active');
        if (!isActive) {
            searchPopup.classList.add('active');
            setTimeout(() => searchInput.focus(), 100);
        }
    });

    // 关闭按钮
    searchClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSearch();
    });

    // 输入搜索
    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.trim();
        if (keyword) {
            performSearch(keyword);
        } else {
            searchResults.innerHTML = '';
        }
    });

    // 点击弹窗外部关闭
    document.addEventListener('click', (e) => {
        if (searchPopup.classList.contains('active') && 
            !searchPopup.contains(e.target) && 
            !navSearch.contains(e.target)) {
            closeSearch();
        }
    });

    // 阻止弹窗内点击冒泡
    searchPopup.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // ESC 关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchPopup.classList.contains('active')) {
            closeSearch();
        }
    });
}

/**
 * 关闭搜索弹窗
 */
function closeSearch() {
    const searchPopup = document.getElementById('searchPopup');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    searchPopup.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
}

/**
 * 执行搜索
 */
function performSearch(keyword) {
    const searchResults = document.getElementById('searchResults');
    const lowerKeyword = keyword.toLowerCase();

    const results = searchArticlesData.filter(art => {
        return art.title.toLowerCase().includes(lowerKeyword) ||
               (art.desc && art.desc.toLowerCase().includes(lowerKeyword));
    });

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-empty">没有找到相关文章</div>';
        return;
    }

    let html = '';
    results.forEach(art => {
        html += `
            <a href="${art.path}" class="search-result-item" onclick="closeSearch()">
                <div class="search-result-thumb" style="background-image: url('${art.cover || ''}')"></div>
                <div class="search-result-info">
                    <div class="search-result-title">${highlightText(art.title, keyword)}</div>
                    <div class="search-result-desc">${art.desc ? highlightText(art.desc, keyword) : ''}</div>
                </div>
            </a>
        `;
    });

    searchResults.innerHTML = html;
}

/**
 * 高亮匹配文本
 */
function highlightText(text, keyword) {
    if (!keyword) return text;
    const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
    return text.replace(regex, '<mark style="background: rgba(64,158,255,0.2); color: #1677ff; border-radius: 2px; padding: 0 2px;">$1</mark>');
}

/**
 * 转义正则特殊字符
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}