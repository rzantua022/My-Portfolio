// -------------------------------------------------------
// Mobile nav toggle
// -------------------------------------------------------
const navToggle = document.getElementById('navToggle');
const navList = document.getElementById('navList');

if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
        const isOpen = navList.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navList.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navList.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// -------------------------------------------------------
// Dark / light theme toggle
// (initial theme itself is set by the inline script in
// <head> before paint — this just wires up the button)
// -------------------------------------------------------
const themeToggle = document.getElementById('themeToggle');

function isLightTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light';
}

function updateThemeToggleLabel() {
    if (!themeToggle) return;
    const nowLight = isLightTheme();
    themeToggle.setAttribute('aria-pressed', String(nowLight));
    themeToggle.setAttribute('aria-label', nowLight ? 'Switch to dark theme' : 'Switch to light theme');
}

if (themeToggle) {
    updateThemeToggleLabel();

    themeToggle.addEventListener('click', () => {
        const nextIsLight = !isLightTheme();

        if (nextIsLight) {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        try {
            localStorage.setItem('theme', nextIsLight ? 'light' : 'dark');
        } catch (e) {
            // localStorage unavailable (private browsing, etc.) — theme still
            // applies for this session, it just won't persist on reload.
        }

        updateThemeToggleLabel();
    });
}

// -------------------------------------------------------
// Certificate lightbox
// -------------------------------------------------------
const lightbox = document.getElementById('certLightbox');
const lightboxImage = document.getElementById('lightboxImage');

function openLightbox(src, alt) {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    if (!lightbox || !lightboxImage) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
}

document.querySelectorAll('.cert-thumb').forEach((button) => {
    button.addEventListener('click', () => {
        const img = button.querySelector('img');
        if (img) openLightbox(img.src, img.alt);
    });
});

if (lightbox) {
    lightbox.querySelectorAll('[data-close]').forEach((el) => {
        el.addEventListener('click', closeLightbox);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
}

// -------------------------------------------------------
// Scroll progress bar
// -------------------------------------------------------
const scrollProgress = document.getElementById('scrollProgress');

function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
}

if (scrollProgress) {
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);
    updateScrollProgress();
}

// -------------------------------------------------------
// Back to top button + floating contact button
// Both are gated on the same scroll threshold so neither one
// sits on top of the hero's own buttons before the user scrolls.
// -------------------------------------------------------
const backToTop = document.getElementById('backToTop');
const fabContact = document.querySelector('.fab-contact');

function toggleFloatingButtons() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const pastHero = scrollTop > 480;
    if (backToTop) backToTop.classList.toggle('visible', pastHero);

    if (fabContact) {
        fabContact.classList.toggle('visible', pastHero);
        if (!pastHero) {
            const fabToggleBtn = document.getElementById('fabToggle');
            const fabMenuEl = document.getElementById('fabMenu');
            if (fabMenuEl) fabMenuEl.classList.remove('open');
            if (fabToggleBtn) {
                fabToggleBtn.classList.remove('open');
                fabToggleBtn.setAttribute('aria-expanded', 'false');
            }
        }
    }
}

if (backToTop || fabContact) {
    window.addEventListener('scroll', toggleFloatingButtons, { passive: true });
    toggleFloatingButtons();
}

if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// -------------------------------------------------------
// Floating contact button
// -------------------------------------------------------
const fabToggle = document.getElementById('fabToggle');
const fabMenu = document.getElementById('fabMenu');

if (fabToggle && fabMenu) {
    fabToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = fabMenu.classList.toggle('open');
        fabToggle.classList.toggle('open', isOpen);
        fabToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
        if (!fabToggle.contains(e.target) && !fabMenu.contains(e.target)) {
            fabMenu.classList.remove('open');
            fabToggle.classList.remove('open');
            fabToggle.setAttribute('aria-expanded', 'false');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fabMenu.classList.contains('open')) {
            fabMenu.classList.remove('open');
            fabToggle.classList.remove('open');
            fabToggle.setAttribute('aria-expanded', 'false');
            fabToggle.focus();
        }
    });
}

// -------------------------------------------------------
// Scroll-in reveal animations
// (the .js class from the inline head script keeps this
// from ever hiding content if JS fails to run)
// -------------------------------------------------------
const revealEls = document.querySelectorAll('.reveal');

if (revealEls.length) {
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        revealEls.forEach((el) => revealObserver.observe(el));
    } else {
        // No IntersectionObserver support — just show everything.
        revealEls.forEach((el) => el.classList.add('in-view'));
    }
}

// -------------------------------------------------------
// Page loader
// -------------------------------------------------------
const pageLoader = document.getElementById('pageLoader');

function hidePageLoader() {
    if (pageLoader && !pageLoader.classList.contains('loaded')) {
        pageLoader.classList.add('loaded');
    }
}

if (pageLoader) {
    // Normal path: hide shortly after everything finishes loading.
    window.addEventListener('load', () => setTimeout(hidePageLoader, 250));
    // Safety net: never let a slow asset or a stray error keep the
    // loader on screen indefinitely.
    setTimeout(hidePageLoader, 2500);
}
