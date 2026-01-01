document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);


    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    const page = document.querySelector('.page');
    const introColumns = document.querySelectorAll('.intro-col');
    const nameLines = document.querySelectorAll('.name-line');
    const heroTag = document.querySelector('.hero-tag');
    const heroRole = document.querySelector('.hero-role');
    const heroRight = document.querySelector('.hero-right');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const metaRows = document.querySelectorAll('.meta-row');
    const sidebarTop = document.querySelector('.sidebar-top');
    const pfpContainer = document.querySelector('.pfp-container');

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const hoverables = document.querySelectorAll('a, button, .work-row, .stack-tags span, .pfp-wrapper');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            follower.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            follower.classList.remove('hover');
        });
    });

    const master = gsap.timeline();

    master.to(introColumns, {
        scaleY: 0,
        transformOrigin: 'top',
        duration: 1.2,
        ease: 'expo.inOut',
        stagger: {
            each: 0.06,
            from: 'center'
        }
    });

    master.to(page, {
        opacity: 1,
        duration: 0.4
    }, '-=0.6');

    master.from(heroTag, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'expo.out'
    }, '-=0.3');

    nameLines.forEach((line, i) => {
        const text = line.textContent;
        line.innerHTML = `<span style="display:inline-block;transform:translateY(120%)">${text}</span>`;
        const span = line.querySelector('span');

        master.to(span, {
            y: 0,
            duration: 1,
            ease: 'expo.out'
        }, `-=${0.7 - i * 0.1}`);
    });

    master.from(heroRole, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'expo.out'
    }, '-=0.6');

    master.from(heroRight, {
        x: 100,
        opacity: 0,
        duration: 1,
        ease: 'expo.out'
    }, '-=0.9');

    master.from(sidebarTop, {
        y: -20,
        opacity: 0,
        duration: 0.6,
        ease: 'expo.out'
    }, '-=0.7');

    master.from(pfpContainer, {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.7)'
    }, '-=0.5');

    master.from(metaRows, {
        x: 30,
        opacity: 0,
        duration: 0.5,
        ease: 'expo.out',
        stagger: 0.08
    }, '-=0.4');

    master.from(scrollIndicator, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'expo.out'
    }, '-=0.4');

    master.set('.intro', { display: 'none' });

    gsap.from('.large-text', {
        scrollTrigger: {
            trigger: '.about-intro',
            start: 'top 80%',
            once: true
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'expo.out'
    });

    gsap.from('.about-col', {
        scrollTrigger: {
            trigger: '.about-cols',
            start: 'top 80%',
            once: true
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'expo.out',
        stagger: 0.2
    });

    const workRows = document.querySelectorAll('.work-row');
    workRows.forEach((row, i) => {
        gsap.from(row, {
            scrollTrigger: {
                trigger: row,
                start: 'top 85%',
                once: true
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'expo.out'
        });
    });

    gsap.from('.more-link', {
        scrollTrigger: {
            trigger: '.more-link',
            start: 'top 90%',
            once: true
        },
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'expo.out'
    });

    const certCards = document.querySelectorAll('.cert-card');
    certCards.forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                once: true
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'expo.out'
        });
    });

    gsap.from('.contact-heading', {
        scrollTrigger: {
            trigger: '.contact',
            start: 'top 70%',
            once: true
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'expo.out'
    });

    gsap.from('.contact-email', {
        scrollTrigger: {
            trigger: '.contact',
            start: 'top 65%',
            once: true
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'expo.out'
    });

    gsap.from('.contact-links a', {
        scrollTrigger: {
            trigger: '.contact-links',
            start: 'top 85%',
            once: true
        },
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'expo.out',
        stagger: 0.1
    });

    const toTopBtn = document.querySelector('.to-top');
    if (toTopBtn) {
        toTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const stackTags = document.querySelectorAll('.stack-tags span');
    stackTags.forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            gsap.to(tag, {
                scale: 1.05,
                duration: 0.3,
                ease: 'expo.out'
            });
        });
        tag.addEventListener('mouseleave', () => {
            gsap.to(tag, {
                scale: 1,
                duration: 0.3,
                ease: 'expo.out'
            });
        });
    });

    workRows.forEach(row => {
        const name = row.querySelector('.work-name');

        row.addEventListener('mouseenter', () => {
            gsap.to(name, {
                x: 10,
                duration: 0.4,
                ease: 'expo.out'
            });
        });

        row.addEventListener('mouseleave', () => {
            gsap.to(name, {
                x: 0,
                duration: 0.4,
                ease: 'expo.out'
            });
        });
    });

    const pfpWrapper = document.querySelector('.pfp-wrapper');
    if (pfpWrapper) {
        gsap.to(pfpWrapper, {
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            },
            y: 40,
            scale: 0.9,
            ease: 'none'
        });
    }

    const pfpOrbit = document.querySelector('.pfp-orbit');
    if (pfpOrbit) {
        gsap.to(pfpOrbit, {
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            },
            rotation: 180,
            ease: 'none'
        });
    }

    const yearSpan = document.querySelector('.footer span');
    if (yearSpan) {
        const year = new Date().getFullYear();
        yearSpan.innerHTML = yearSpan.innerHTML.replace(/\d{4}/, year);
    }

    const timeEl = document.querySelector('.sidebar-time');
    function updateTime() {
        const now = new Date();
        const opts = { hour: '2-digit', minute: '2-digit', hour12: false };
        timeEl.textContent = now.toLocaleTimeString('en-US', opts);
    }
    updateTime();
    setInterval(updateTime, 1000);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    gsap.to(scrollIndicator, {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: '30% top',
            scrub: true
        },
        opacity: 0,
        y: -20,
        ease: 'none'
    });
});
