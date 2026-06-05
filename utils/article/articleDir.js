// 自动生成右侧目录
document.addEventListener('DOMContentLoaded', () => {
    const tocList = document.getElementById('toc-list');
    const headings = document.querySelectorAll('.article-content h2, .article-content h3');
    
    headings.forEach((heading, index) => {
        if (!heading.id) heading.id = `heading-${index}`;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        if (heading.tagName === 'H3') {
            li.style.paddingLeft = '15px';
        }
        li.appendChild(a);
        tocList.appendChild(li);
    });

    // 目录点击平滑滚动
    document.querySelectorAll('.article-toc a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
});