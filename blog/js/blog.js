document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    const BLOG_DATA_URL = 'data/posts.json';
    
    let allPosts = [];
    let filteredPosts = [];
    let currentTag = 'all';
    let currentSort = 'latest';
    let postsPerPage = 6;
    let currentPage = 1;


    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2
    });

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    lenis.on('scroll', ScrollTrigger.update);

    ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value) {
            if (arguments.length) {
                lenis.scrollTo(value, { immediate: true });
            }
            return lenis.scroll;
        },
        getBoundingClientRect() {
            return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        }
    });
    
    ScrollTrigger.defaults({ scroller: document.body });

    const cursor = document.querySelector('.cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    
    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        dotX += (mouseX - dotX) * 0.3;
        dotY += (mouseY - dotY) * 0.3;
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        
        cursorDot.style.left = dotX + 'px';
        cursorDot.style.top = dotY + 'px';
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.querySelectorAll('a, button, .blog-card, .featured-card').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    const readingProgress = document.querySelector('.reading-progress');
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        readingProgress.style.width = progress + '%';
    });

    const titleLines = document.querySelectorAll('.title-inner');
    const heroDesc = document.querySelector('.blog-hero-desc');
    const blogStats = document.querySelector('.blog-stats');

    gsap.to(titleLines, {
        y: 0,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.1,
        delay: 0.3
    });

    gsap.to(heroDesc, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
        delay: 0.8
    });

    gsap.from(blogStats, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'expo.out',
        delay: 1
    });

    const searchToggle = document.getElementById('searchToggle');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    function openSearch() {
        searchOverlay.classList.add('active');
        searchInput.focus();
        lenis.stop();
    }

    function closeSearch() {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '<div class="search-empty">Start typing to search...</div>';
        lenis.start();
    }

    searchToggle.addEventListener('click', openSearch);
    
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) closeSearch();
    });

    const searchModal = document.querySelector('.search-modal');
    searchModal.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
        }
        if (e.key === 'Escape') closeSearch();
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (!query) {
            searchResults.innerHTML = '<div class="search-empty">Start typing to search...</div>';
            return;
        }

        const results = allPosts.filter(post => 
            post.title.toLowerCase().includes(query) ||
            post.excerpt.toLowerCase().includes(query) ||
            post.tags.some(tag => tag.toLowerCase().includes(query))
        );

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-empty">No posts found</div>';
            return;
        }

        searchResults.innerHTML = results.slice(0, 5).map(post => `
            <a href="post.html?slug=${post.slug}" class="search-result">
                <div class="search-result-title">${highlightMatch(post.title, query)}</div>
                <div class="search-result-excerpt">${highlightMatch(post.excerpt, query)}</div>
            </a>
        `).join('');
    });

    function highlightMatch(text, query) {
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark style="background: var(--fg); color: var(--bg);">$1</mark>');
    }

    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    async function fetchBlogPosts() {
        try {
            const response = await fetch(BLOG_DATA_URL);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            allPosts = data.posts;
            initializeBlog();
        } catch (error) {
            console.error('Error loading posts:', error);
            document.getElementById('blogGrid').innerHTML = '<p style="color: var(--muted); grid-column: 1/-1; text-align: center;">Failed to load posts. Please try again later.</p>';
        }
    }

    function initializeBlog() {
        updateStats();
        renderTags();
        renderFeaturedPost();
        filterAndRenderPosts();
        setupFilters();
        checkUrlParams();
    }

    function checkUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const tagParam = params.get('tag');
        if (tagParam) {
            currentTag = tagParam;
            document.querySelectorAll('.filter-tag').forEach(t => {
                t.classList.toggle('active', t.dataset.tag === tagParam);
            });
            filterAndRenderPosts();
        }
    }

    function updateStats() {
        const postCount = document.getElementById('postCount');
        const totalReads = document.getElementById('totalReads');
        const tagCount = document.getElementById('tagCount');

        const uniqueTags = [...new Set(allPosts.flatMap(p => p.tags))];
        const totalViews = allPosts.reduce((sum, p) => sum + p.views, 0);

        animateCounter(postCount, allPosts.length);
        animateCounter(totalReads, totalViews, 'k');
        animateCounter(tagCount, uniqueTags.length);
    }

    function animateCounter(el, target, suffix = '') {
        const duration = 1500;
        const start = performance.now();
        const startVal = 0;

        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            let current = Math.floor(startVal + (target - startVal) * easeProgress);
            
            if (suffix === 'k' && target > 1000) {
                el.textContent = (current / 1000).toFixed(1) + 'k';
            } else {
                el.textContent = current;
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }

    function renderTags() {
        const filterTags = document.getElementById('filterTags');
        const uniqueTags = [...new Set(allPosts.flatMap(p => p.tags))];
        
        filterTags.innerHTML = `
            <button class="filter-tag active" data-tag="all">All</button>
            ${uniqueTags.slice(0, 8).map(tag => `
                <button class="filter-tag" data-tag="${tag}">${tag}</button>
            `).join('')}
        `;
    }

    function renderFeaturedPost() {
        const featuredCard = document.getElementById('featuredCard');
        const featured = allPosts.find(p => p.featured) || allPosts[0];
        const postUrl = `post.html?slug=${featured.slug}`;

        featuredCard.innerHTML = `
            <a href="${postUrl}" class="featured-image">
                <img src="${featured.image}" alt="${featured.title}">
            </a>
            <div class="featured-content">
                <span class="featured-tag">${featured.tags[0]}</span>
                <h2 class="featured-title">${featured.title}</h2>
                <p class="featured-excerpt">${featured.excerpt}</p>
                <div class="featured-meta">
                    <div class="featured-author">
                        <img src="${featured.author.avatar}" alt="${featured.author.name}" class="author-avatar">
                        <span>${featured.author.name}</span>
                    </div>
                    <span class="featured-date">${formatDate(featured.date)}</span>
                    <span class="featured-read-time">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                        ${featured.readTime}
                    </span>
                </div>
                <a href="${postUrl}" class="featured-cta">
                    Read Article
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19"/>
                    </svg>
                </a>
            </div>
        `;

        gsap.from(featuredCard, {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: 'expo.out',
            scrollTrigger: {
                trigger: featuredCard,
                start: 'top 85%',
                once: true
            }
        });
    }

    function filterAndRenderPosts() {
        filteredPosts = allPosts.filter(p => !p.featured);

        if (currentTag !== 'all') {
            filteredPosts = filteredPosts.filter(p => p.tags.includes(currentTag));
        }

        if (currentSort === 'latest') {
            filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else {
            filteredPosts.sort((a, b) => b.views - a.views);
        }

        renderPosts();
    }

    function renderPosts() {
        const blogGrid = document.getElementById('blogGrid');
        const loadMore = document.getElementById('loadMore');
        const postsToShow = filteredPosts.slice(0, currentPage * postsPerPage);

        blogGrid.innerHTML = postsToShow.map((post, i) => `
            <a href="post.html?slug=${post.slug}" class="blog-card" data-index="${i}">
                <div class="card-header">
                    <span class="card-tag">${post.tags[0]}</span>
                    <span class="card-index">${String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 class="card-title">${post.title}</h3>
                <p class="card-excerpt">${post.excerpt}</p>
                <div class="card-footer">
                    <div class="card-meta">
                        <span>${formatDate(post.date)}</span>
                        <span>·</span>
                        <span>${post.readTime}</span>
                    </div>
                    <div class="card-arrow">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M7 17L17 7M17 7H7M17 7V17"/>
                        </svg>
                    </div>
                </div>
            </a>
        `).join('');

        loadMore.style.display = postsToShow.length < filteredPosts.length ? 'flex' : 'none';

        blogGrid.querySelectorAll('.blog-card').forEach((card, i) => {
            gsap.from(card, {
                opacity: 0,
                y: 30,
                duration: 0.6,
                delay: i * 0.1,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 90%',
                    once: true
                }
            });
        });

        blogGrid.querySelectorAll('.blog-card').forEach(card => {
            card.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            card.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    function setupFilters() {
        const filterTags = document.getElementById('filterTags');
        const sortBtns = document.querySelectorAll('.sort-btn');

        filterTags.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-tag')) {
                filterTags.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                currentTag = e.target.dataset.tag;
                currentPage = 1;
                filterAndRenderPosts();
            }
        });

        sortBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sortBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSort = btn.dataset.sort;
                currentPage = 1;
                filterAndRenderPosts();
            });
        });

        document.getElementById('loadMore').addEventListener('click', () => {
            currentPage++;
            renderPosts();
        });
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    }

    document.getElementById('newsletterForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = e.target.querySelector('input');
        const email = input.value;
        
        gsap.to(e.target, {
            scale: 0.98,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                input.value = '';
                input.placeholder = 'Thanks! We\'ll be in touch';
                setTimeout(() => {
                    input.placeholder = 'your@email.com';
                }, 3000);
            }
        });
    });

    document.getElementById('backToTop').addEventListener('click', (e) => {
        e.preventDefault();
        lenis.scrollTo(0);
    });

    fetchBlogPosts();
});
