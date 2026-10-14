// Scroll-triggered section reveal
const revealEls = document.querySelectorAll('.reveal');

if (revealEls.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => revealObserver.observe(el));
} else {
    // No IntersectionObserver support: just show everything
    revealEls.forEach((el) => el.classList.add('is-visible'));
}

// Mobile nav
const navToggle = document.getElementById('navToggle');
const navList = document.getElementById('navList');

function closeNav(returnFocus) {
    if (!navList || !navToggle) return;
    navList.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) navToggle.focus();
}

if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
        const isOpen = navList.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navList.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => closeNav(false));
    });

    // Click outside closes the menu
    document.addEventListener('click', (e) => {
        if (!navList.classList.contains('open')) return;
        if (navList.contains(e.target) || navToggle.contains(e.target)) return;
        closeNav(false);
    });
}

// Highlight the nav link for the section currently in view
const navLinks = navList ? Array.from(navList.querySelectorAll('a[href^="#"]')) : [];
const linkById = new Map();
navLinks.forEach((a) => linkById.set(a.getAttribute('href').slice(1), a));

if (linkById.size && 'IntersectionObserver' in window) {
    const spyTargets = ['hero', ...linkById.keys()]
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    const setCurrent = (id) => {
        navLinks.forEach((a) => a.removeAttribute('aria-current'));
        const active = linkById.get(id);
        if (active) active.setAttribute('aria-current', 'true');
    };

    const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) setCurrent(entry.target.id);
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    spyTargets.forEach((el) => spy.observe(el));
}

// Certificate lightbox (dialog)
const lightbox = document.getElementById('certLightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const certThumbs = Array.from(document.querySelectorAll('.cert-thumb'));

let activeCert = 0;
let lastFocused = null;

function showCert(index) {
    if (!lightboxImage || !certThumbs.length) return;
    activeCert = (index + certThumbs.length) % certThumbs.length;
    const img = certThumbs[activeCert].querySelector('img');
    if (!img) return;
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt;
    if (lightboxCaption) {
        lightboxCaption.textContent = 'Certificate ' + (activeCert + 1) + ' of ' + certThumbs.length;
    }
}

function openLightbox(index) {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    showCert(index);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
}

function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    if (lightboxImage) lightboxImage.removeAttribute('src');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
}

certThumbs.forEach((button, index) => {
    button.addEventListener('click', () => openLightbox(index));
});

if (lightbox) {
    lightbox.querySelectorAll('[data-close]').forEach((el) => {
        el.addEventListener('click', closeLightbox);
    });

    if (lightboxPrev) lightboxPrev.addEventListener('click', () => showCert(activeCert - 1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => showCert(activeCert + 1));
}

document.addEventListener('keydown', (e) => {
    // Nav: Escape closes the open mobile menu
    if (e.key === 'Escape' && navList && navList.classList.contains('open')) {
        closeNav(true);
        return;
    }

    if (!lightbox || lightbox.hidden) return;

    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowRight') {
        showCert(activeCert + 1);
    } else if (e.key === 'ArrowLeft') {
        showCert(activeCert - 1);
    } else if (e.key === 'Tab') {
        // Keep focus inside the dialog
        const focusable = [lightboxClose, lightboxPrev, lightboxNext].filter(Boolean);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        } else if (!focusable.includes(document.activeElement)) {
            e.preventDefault();
            first.focus();
        }
    }
});
