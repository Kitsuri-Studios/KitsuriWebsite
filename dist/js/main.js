
document.addEventListener('DOMContentLoaded', () => {
    
    gsap.registerPlugin(ScrollTrigger);
    
   
   
   
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

   
    lenis.on('scroll', ScrollTrigger.update);
    
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

   
   
   
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
       
        dotX += (mouseX - dotX) * 0.5;
        dotY += (mouseY - dotY) * 0.5;
        
       
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        
        cursorDot.style.transform = `translate(${dotX - 3}px, ${dotY - 3}px)`;
        cursorRing.style.transform = `translate(${ringX - 24}px, ${ringY - 24}px)`;
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    
   
    const hoverElements = document.querySelectorAll('.work-item, .contact-cta');
    const linkElements = document.querySelectorAll('a, button');
    
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
    
    linkElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-link'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-link'));
    });

   
   
   
    const loader = document.getElementById('loader');
    const loaderWord = document.querySelector('.loader-word');
    const loaderBar = document.querySelector('.loader-bar');
    const loaderPercent = document.querySelector('.loader-percent');
    
    const loaderTl = gsap.timeline({
        onComplete: () => {
            loader.style.pointerEvents = 'none';
            initAnimations();
        }
    });
    
   
    loaderTl.to(loaderWord, {
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
    });
    
   
    loaderTl.to(loaderBar, {
        width: '100%',
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: function() {
            const progress = Math.round(this.progress() * 100);
            loaderPercent.textContent = progress + '%';
        }
    }, '+=0.2');
    
   
    loaderTl.to([loaderWord, loaderPercent], {
        y: -30,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.in',
        stagger: 0.05
    }, '+=0.3');
    
    loaderTl.to(loader, {
        yPercent: -100,
        duration: 1,
        ease: 'power3.inOut'
    }, '-=0.2');

   
   
   
    function initAnimations() {
       
        const titleInners = document.querySelectorAll('.title-inner');
        gsap.to(titleInners, {
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            stagger: 0.1
        });
        
       
        gsap.to('.hero-tagline', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            delay: 0.6
        });
        
       
        gsap.to('.hero-content', {
            yPercent: 30,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
        
       
        document.querySelectorAll('.section-header').forEach(header => {
            gsap.from(header.querySelector('.section-label'), {
                x: -30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: header,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });
            
            gsap.from(header.querySelector('.section-line'), {
                scaleX: 0,
                transformOrigin: 'left',
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: header,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });
        });
        
       
        document.querySelectorAll('.work-item').forEach((item, i) => {
            gsap.from(item.querySelector('.work-item-inner'), {
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: item,
                    start: 'top 90%',
                    toggleActions: 'play none none reverse'
                }
            });
        });
        
       
        const aboutTitle = document.querySelector('.about-title');
        if (aboutTitle) {
            const words = aboutTitle.textContent.split(' ');
            aboutTitle.innerHTML = words.map(word => 
                `<span class="word"><span class="word-inner">${word}</span></span>`
            ).join(' ');
            
            gsap.from('.about-title .word-inner', {
                y: '100%',
                duration: 0.8,
                ease: 'power3.out',
                stagger: 0.05,
                scrollTrigger: {
                    trigger: aboutTitle,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });
        }
        
       
        gsap.from('.about-text', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.about-text',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
        
       
        document.querySelectorAll('.stat-number').forEach(num => {
            const target = parseInt(num.dataset.count);
            
            ScrollTrigger.create({
                trigger: num,
                start: 'top 85%',
                onEnter: () => {
                    gsap.to(num, {
                        innerHTML: target,
                        duration: 2,
                        ease: 'power2.out',
                        snap: { innerHTML: 1 },
                        onUpdate: function() {
                            num.textContent = Math.round(parseFloat(num.textContent));
                        }
                    });
                },
                once: true
            });
        });
        
       
        gsap.from('.stat-item', {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.15,
            scrollTrigger: {
                trigger: '.about-stats',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
        
       
        gsap.from('.contact-line span', {
            y: '100%',
            duration: 1,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: {
                trigger: '.contact-title',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
        
       
        gsap.from('.contact-cta', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.contact-cta',
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            }
        });
        
       
        gsap.from('.contact-col', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: {
                trigger: '.contact-info',
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            }
        });
        
        document.querySelectorAll('.team-member').forEach((member, i) => {
            gsap.from(member, {
                y: 40,
                opacity: 0,
                duration: 0.6,
                delay: i * 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.team-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });
        });
    }

   
   
   
    const workItems = document.querySelectorAll('.work-item');
    const workImage = document.getElementById('workImage');
    const workImageEl = document.getElementById('workImageEl');
    
    let imgX = 0, imgY = 0;
    let targetX = 0, targetY = 0;
    
    function animateWorkImage() {
        imgX += (targetX - imgX) * 0.1;
        imgY += (targetY - imgY) * 0.1;
        
        workImage.style.left = imgX + 'px';
        workImage.style.top = imgY + 'px';
        
        requestAnimationFrame(animateWorkImage);
    }
    animateWorkImage();
    
    workItems.forEach(item => {
        const imgSrc = item.dataset.img;
        
        item.addEventListener('mouseenter', () => {
            workImageEl.src = imgSrc;
            workImage.classList.add('active');
        });
        
        item.addEventListener('mousemove', (e) => {
            targetX = e.clientX + 20;
            targetY = e.clientY - 110;
        });
        
        item.addEventListener('mouseleave', () => {
            workImage.classList.remove('active');
        });
    });

   
   const magneticBtns = document.querySelectorAll('.contact-cta, .work-link, .footer-top');
    
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(btn, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.4,
                ease: 'power2.out'
            });
        });
        
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.7,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    });

   
   
   
    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        
        document.getElementById('time').textContent = `${hours}:${mins}:${secs}`;
    }
    updateTime();
    setInterval(updateTime, 1000);

   
   
   
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                lenis.scrollTo(target, { offset: -100 });
            }
        });
    });

   
    document.getElementById('backToTop')?.addEventListener('click', (e) => {
        e.preventDefault();
        lenis.scrollTo(0);
    });

   
   
   
    let lastScroll = 0;
    const header = document.getElementById('header');
    
    lenis.on('scroll', ({ scroll }) => {
        if (scroll > lastScroll && scroll > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        lastScroll = scroll;
    });
    
    header.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';

   
   
   
    const style = document.createElement('style');
    style.textContent = `
        .word {
            display: inline-block;
            overflow: hidden;
        }
        .word-inner {
            display: inline-block;
        }
    `;
    document.head.appendChild(style);

});
