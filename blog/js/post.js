document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    const BLOG_DATA_URL = 'data/posts.json';
    
    let allPosts = [];
    let currentPost = null;

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

    function setupCursorHovers() {
        document.querySelectorAll('a, button, .related-card').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    const readingProgress = document.querySelector('.reading-progress');
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        readingProgress.style.width = progress + '%';
    });

    function getSlugFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('slug');
    }

    async function loadPost() {
        const slug = getSlugFromURL();
        
        if (!slug) {
            window.location.href = 'index.html';
            return;
        }

        try {
            const response = await fetch(BLOG_DATA_URL);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            allPosts = data.posts;
        } catch (error) {
            console.error('Error loading posts:', error);
            window.location.href = 'index.html';
            return;
        }

        currentPost = allPosts.find(p => p.slug === slug);
        
        if (!currentPost) {
            window.location.href = 'index.html';
            return;
        }

        renderPost();
        renderRelatedPosts();
        setupSharing();
        animateIn();
        setupCursorHovers();
    }

    function renderPost() {
        document.title = `${currentPost.title} — The Chronicle`;

        updateSEOTags();

        document.getElementById('postTag').textContent = currentPost.tags[0];
        document.getElementById('postDate').textContent = formatDate(currentPost.date);
        document.getElementById('postReadTime').textContent = currentPost.readTime;
        
        document.getElementById('postTitle').textContent = currentPost.title;
        document.getElementById('postExcerpt').textContent = currentPost.excerpt;
        
        document.getElementById('authorAvatar').src = currentPost.author.avatar;
        document.getElementById('authorAvatar').alt = currentPost.author.name;
        document.getElementById('authorName').textContent = currentPost.author.name;
        
        document.getElementById('postImage').src = currentPost.image;
        document.getElementById('postImage').alt = currentPost.title;
        
        document.getElementById('postContent').innerHTML = currentPost.content;
        
        document.getElementById('postTags').innerHTML = currentPost.tags.map(tag => 
            `<a href="index.html?tag=${encodeURIComponent(tag)}" class="tag">${tag}</a>`
        ).join('');
    }

    function updateSEOTags() {
        const pageUrl = window.location.href;
        const canonicalUrl = `${window.location.origin}${window.location.pathname}?slug=${currentPost.slug}`;
        
        updateMetaTag('description', currentPost.excerpt);
        updateMetaTag('keywords', currentPost.tags.join(', '));
        updateMetaTag('author', currentPost.author.name);
        
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (canonicalLink) {
            canonicalLink.href = canonicalUrl;
        }
        
        updateMetaProperty('og:url', canonicalUrl);
        updateMetaProperty('og:title', currentPost.title);
        updateMetaProperty('og:description', currentPost.excerpt);
        updateMetaProperty('og:image', currentPost.image);
        updateMetaProperty('article:published_time', currentPost.date);
        updateMetaProperty('article:author', currentPost.author.name);
        updateMetaProperty('article:section', currentPost.tags[0]);
        
        currentPost.tags.forEach(tag => {
            const metaTag = document.createElement('meta');
            metaTag.setAttribute('property', 'article:tag');
            metaTag.setAttribute('content', tag);
            document.head.appendChild(metaTag);
        });
        
        updateMetaTag('twitter:url', canonicalUrl, 'name');
        updateMetaTag('twitter:title', currentPost.title, 'name');
        updateMetaTag('twitter:description', currentPost.excerpt, 'name');
        updateMetaTag('twitter:image', currentPost.image, 'name');
        updateMetaTag('twitter:creator', `@${currentPost.author.name}`, 'name');
        
        const articleSchema = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": currentPost.title,
            "description": currentPost.excerpt,
            "image": currentPost.image,
            "datePublished": currentPost.date,
            "dateModified": currentPost.date,
            "author": {
                "@type": "Person",
                "name": currentPost.author.name,
                "image": currentPost.author.avatar
            },
            "publisher": {
                "@type": "Organization",
                "name": "Kitsuri Studios",
                "logo": {
                    "@type": "ImageObject",
                    "url": `${window.location.origin}/assets/logo.png`
                }
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": canonicalUrl
            },
            "keywords": currentPost.tags.join(', '),
            "articleSection": currentPost.tags[0],
            "wordCount": estimateWordCount(currentPost.content),
            "timeRequired": `PT${parseInt(currentPost.readTime)}M`
        };
        
        const schemaScript = document.getElementById('articleSchema');
        if (schemaScript) {
            schemaScript.textContent = JSON.stringify(articleSchema, null, 2);
        }
    }
    
    function updateMetaTag(name, content, attr = 'name') {
        let meta = document.querySelector(`meta[${attr}="${name}"]`);
        if (meta) {
            meta.setAttribute('content', content);
        }
    }
    
    function updateMetaProperty(property, content) {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (meta) {
            meta.setAttribute('content', content);
        }
    }
    
    function estimateWordCount(html) {
        const text = html.replace(/<[^>]*>/g, ' ');
        return text.split(/\s+/).filter(w => w.length > 0).length;
    }

    function renderRelatedPosts() {
        const relatedGrid = document.getElementById('relatedGrid');
        
        const currentTags = new Set(currentPost.tags);
        const related = allPosts
            .filter(p => p.id !== currentPost.id)
            .map(p => ({
                ...p,
                score: p.tags.filter(t => currentTags.has(t)).length
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        relatedGrid.innerHTML = related.map(post => `
            <a href="post.html?slug=${post.slug}" class="related-card">
                <span class="card-tag">${post.tags[0]}</span>
                <h3 class="card-title">${post.title}</h3>
                <span class="card-meta">${formatDate(post.date)} · ${post.readTime}</span>
            </a>
        `).join('');
    }

    function setupSharing() {
        const pageUrl = encodeURIComponent(window.location.href);
        const pageTitle = encodeURIComponent(currentPost.title);

        document.getElementById('shareTwitter').href = 
            `https://twitter.com/intent/tweet?text=${pageTitle}&url=${pageUrl}`;

        document.getElementById('shareLinkedIn').href = 
            `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`;

        const copyHandler = async () => {
            try {
                await navigator.clipboard.writeText(window.location.href);
                showToast('Link copied to clipboard!');
            } catch (err) {
                showToast('Failed to copy link');
            }
        };

        document.getElementById('copyLink').addEventListener('click', copyHandler);
        document.getElementById('copyArticleLink').addEventListener('click', copyHandler);

        document.getElementById('shareBtn').addEventListener('click', async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: currentPost.title,
                        text: currentPost.excerpt,
                        url: window.location.href
                    });
                } catch (err) {
                }
            } else {
                copyHandler();
            }
        });
    }

    function showToast(message) {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    function animateIn() {
        gsap.from('.post-meta', {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: 'expo.out',
            delay: 0.2
        });

        gsap.from('.post-title', {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: 'expo.out',
            delay: 0.3
        });

        gsap.from('.post-excerpt', {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: 'expo.out',
            delay: 0.4
        });

        gsap.from('.post-author', {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: 'expo.out',
            delay: 0.5
        });

        gsap.from('.post-image-wrapper', {
            opacity: 0,
            scale: 0.95,
            duration: 1,
            ease: 'expo.out',
            delay: 0.6
        });

        gsap.from('.post-content', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'expo.out',
            delay: 0.8
        });

        gsap.from('.related-posts', {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: 'expo.out',
            scrollTrigger: {
                trigger: '.related-posts',
                start: 'top 85%',
                once: true
            }
        });
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
        });
    }

    loadPost();
});
