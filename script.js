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
    // No IntersectionObserver support — just show everything
    revealEls.forEach((el) => el.classList.add('is-visible'));
}

// Mobile nav toggle
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

// Certificate lightbox
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
    lightboxImage.src = '';
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
