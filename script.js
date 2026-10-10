// -------------------------------------------------------
// Theme toggle (dark / light), persisted in localStorage
// -------------------------------------------------------
(function initTheme() {
    const root = document.documentElement;
    const STORAGE_KEY = 'theme';

    function getStoredTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    function applyTheme(theme) {
        if (theme === 'light') {
            root.setAttribute('data-theme', 'light');
        } else {
            root.setAttribute('data-theme', 'dark');
        }
    }

    const stored = getStoredTheme();
    if (stored) {
        applyTheme(stored);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        applyTheme('light');
    } else {
        applyTheme('dark');
    }

    window.addEventListener('DOMContentLoaded', () => {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        themeToggle.addEventListener('click', () => {
            const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
            const next = current === 'light' ? 'dark' : 'light';
            applyTheme(next);
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch (e) {
                // localStorage unavailable (private browsing, etc.) — theme still
                // applies for this page view via the DOM attribute above.
            }
        });
    });
})();

// -------------------------------------------------------
// Page loader
// -------------------------------------------------------
(function initLoader() {
    const loader = document.getElementById('pageLoader');
    if (!loader) return;

    let hidden = false;
    function hideLoader() {
        if (hidden) return;
        hidden = true;
        loader.setAttribute('hidden', '');
    }

    window.addEventListener('load', () => {
        setTimeout(hideLoader, 200);
    });

    // Safety net in case the load event is delayed by a slow resource.
    setTimeout(hideLoader, 2500);
})();

// -------------------------------------------------------
// Scroll-triggered section reveal
// -------------------------------------------------------
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
    // No IntersectionObserver support — just show everything.
    revealEls.forEach((el) => el.classList.add('is-visible'));
}

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
        if (img) openLightbox(img.currentSrc || img.src, img.alt);
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
// Skeleton loading for images in .img-frame wrappers
// -------------------------------------------------------
document.querySelectorAll('.img-frame img').forEach((img) => {
    const frame = img.closest('.img-frame');
    if (!frame) return;

    function markLoaded() {
        frame.classList.add('is-loaded');
    }

    if (img.complete && img.naturalWidth > 0) {
        markLoaded();
    } else {
        img.addEventListener('load', markLoaded);
        img.addEventListener('error', markLoaded);
    }
});

// -------------------------------------------------------
// Scroll progress bar + back to top + floating contact button
// All three are gated on the same scroll threshold so the back-to-top
// and contact buttons never sit on top of the hero's own buttons
// before the user has scrolled.
// -------------------------------------------------------
const progressFill = document.getElementById('scrollProgressFill');
const progressHead = document.getElementById('scrollProgressHead');
const backToTop = document.getElementById('backToTop');
const fabContact = document.querySelector('.fab-contact');

function updateScrollUI() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;

    if (progressFill) progressFill.style.transform = `scaleX(${ratio})`;
    if (progressHead) progressHead.style.left = `${ratio * 100}%`;

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

if (progressFill || backToTop || fabContact) {
    window.addEventListener('scroll', updateScrollUI, { passive: true });
    window.addEventListener('resize', updateScrollUI);
    updateScrollUI();
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
    fabToggle.addEventListener('click', () => {
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
        }
    });
}

// -------------------------------------------------------
// Site search
// -------------------------------------------------------
(function initSearch() {
    const searchToggle = document.getElementById('searchToggle');
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (!searchToggle || !searchModal || !searchInput || !searchResults) return;

    const index = window.SITE_SEARCH_INDEX || [];
    let activeIndex = -1;

    function renderResults(items) {
        searchResults.innerHTML = '';
        activeIndex = -1;

        if (!items.length) {
            const empty = document.createElement('li');
            empty.className = 'search-empty';
            empty.textContent = 'No matches. Try a different word.';
            searchResults.appendChild(empty);
            return;
        }

        items.forEach((item) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = item.url;
            a.innerHTML = `<span class="search-result-label">${item.label}</span>` +
                `<span class="search-result-section">${item.section}</span>`;
            a.addEventListener('click', closeSearch);
            li.appendChild(a);
            searchResults.appendChild(li);
        });
    }

    function runSearch(query) {
        const q = query.trim().toLowerCase();
        if (!q) {
            renderResults(index.slice(0, 8));
            return;
        }
        const matches = index.filter((item) =>
            item.label.toLowerCase().includes(q) ||
            item.keywords.toLowerCase().includes(q) ||
            item.section.toLowerCase().includes(q)
        );
        renderResults(matches);
    }

    function openSearch() {
        searchModal.hidden = false;
        document.body.style.overflow = 'hidden';
        searchInput.value = '';
        runSearch('');
        setTimeout(() => searchInput.focus(), 20);
    }

    function closeSearch() {
        searchModal.hidden = true;
        document.body.style.overflow = '';
        searchToggle.focus();
    }

    searchToggle.addEventListener('click', openSearch);

    searchModal.querySelectorAll('[data-close]').forEach((el) => {
        el.addEventListener('click', closeSearch);
    });

    searchInput.addEventListener('input', () => runSearch(searchInput.value));

    document.addEventListener('keydown', (e) => {
        const isTypingTarget = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);

        if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            if (searchModal.hidden) openSearch();
            else closeSearch();
            return;
        }

        if (e.key === '/' && !isTypingTarget && searchModal.hidden) {
            e.preventDefault();
            openSearch();
            return;
        }

        if (!searchModal.hidden && e.key === 'Escape') {
            closeSearch();
            return;
        }

        if (!searchModal.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            const links = searchResults.querySelectorAll('a');
            if (!links.length) return;
            links[activeIndex]?.classList.remove('is-active');
            if (e.key === 'ArrowDown') {
                activeIndex = (activeIndex + 1) % links.length;
            } else {
                activeIndex = (activeIndex - 1 + links.length) % links.length;
            }
            links[activeIndex].classList.add('is-active');
            links[activeIndex].scrollIntoView({ block: 'nearest' });
        }

        if (!searchModal.hidden && e.key === 'Enter') {
            const links = searchResults.querySelectorAll('a');
            if (activeIndex >= 0 && links[activeIndex]) {
                links[activeIndex].click();
            } else if (links.length) {
                links[0].click();
            }
        }
    });
})();
