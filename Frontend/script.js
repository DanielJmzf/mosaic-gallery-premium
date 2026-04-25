/* ==============================================
   Daniel & Laura – Frontend Script
   Static gallery + Events backend integration
   ============================================== */

const API_BASE = 'http://localhost:3001';

document.addEventListener('DOMContentLoaded', () => {
    initRevealAnimations();
    initSmoothScroll();
    initScrolledHeader();
    initEventForm();
    initFilters();
    initPhotoDropZone();
    loadEvents();
    initSocketIO();
});

// ─── Reveal Animations ───────────────────────────────────────────────────────

function initRevealAnimations() {
    const revealElements = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    revealElements.forEach(el => observer.observe(el));
}

// ─── Smooth Scroll ────────────────────────────────────────────────────────────

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ─── Scrolled Header ─────────────────────────────────────────────────────────

function initScrolledHeader() {
    const header = document.querySelector('.glass-nav');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
}

// ─── Events State ─────────────────────────────────────────────────────────────

let currentPage = 1;
const PAGE_SIZE = 10;
let currentFilters = {};

// ─── Load Events ──────────────────────────────────────────────────────────────

async function loadEvents(page = 1, filters = {}) {
    setLoadingState(true);
    currentPage = page;
    currentFilters = filters;

    const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        ...filters
    });

    try {
        const res = await fetch(`${API_BASE}/api/events?${params}`);
        if (!res.ok) throw new Error('Server error');
        const data = await res.json();
        renderEvents(data.events, data.total, page);
    } catch {
        showEventsError();
    } finally {
        setLoadingState(false);
    }
}

function setLoadingState(loading) {
    document.getElementById('events-loading').hidden = !loading;
    document.getElementById('events-list').hidden = loading;
    document.getElementById('events-empty').hidden = true;
    document.getElementById('events-error').hidden = true;
    document.getElementById('pagination').hidden = true;
}

function showEventsError() {
    document.getElementById('events-loading').hidden = true;
    document.getElementById('events-list').hidden = true;
    document.getElementById('events-error').hidden = false;
}

function renderEvents(events, total, page) {
    const list = document.getElementById('events-list');
    list.innerHTML = '';
    list.hidden = false;

    if (!events || events.length === 0) {
        document.getElementById('events-empty').hidden = false;
        return;
    }

    events.forEach(event => {
        list.appendChild(buildEventCard(event));
    });

    renderPagination(total, page);
}

function buildEventCard(event, isNew = false) {
    const card = document.createElement('article');
    card.className = 'event-card' + (isNew ? ' new-event' : '');
    card.dataset.id = event.id;

    // Photos
    if (event.photos && event.photos.length > 0) {
        const photosDiv = document.createElement('div');
        photosDiv.className = 'event-card-photos' + (event.photos.length === 1 ? ' single' : '');
        event.photos.forEach(photo => {
            const img = document.createElement('img');
            img.src = `${API_BASE}${photo.url}`;
            img.alt = photo.originalName || 'Foto del evento';
            img.loading = 'lazy';
            img.addEventListener('click', () => openLightbox(img.src));
            photosDiv.appendChild(img);
        });
        card.appendChild(photosDiv);
    }

    // Body
    const body = document.createElement('div');
    body.className = 'event-card-body';

    const meta = document.createElement('div');
    meta.className = 'event-card-meta';

    const dateEl = document.createElement('span');
    dateEl.className = 'event-card-date';
    dateEl.textContent = formatDate(event.event_date);
    meta.appendChild(dateEl);

    if (event.tags && event.tags.length > 0) {
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'event-card-tags';
        event.tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'event-tag';
            span.textContent = tag.name;
            tagsDiv.appendChild(span);
        });
        meta.appendChild(tagsDiv);
    }

    body.appendChild(meta);

    if (event.title) {
        const titleEl = document.createElement('h3');
        titleEl.className = 'event-card-title';
        titleEl.textContent = event.title;
        body.appendChild(titleEl);
    }

    const desc = document.createElement('p');
    desc.className = 'event-card-description';
    desc.textContent = event.description;
    body.appendChild(desc);

    card.appendChild(body);

    if (isNew) {
        setTimeout(() => card.classList.remove('new-event'), 3000);
    }

    return card;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function renderPagination(total, page) {
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const paginationEl = document.getElementById('pagination');
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const pageInfo = document.getElementById('page-info');

    if (totalPages <= 1) {
        paginationEl.hidden = true;
        return;
    }

    paginationEl.hidden = false;
    pageInfo.textContent = `Página ${page} de ${totalPages}`;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;

    prevBtn.onclick = () => loadEvents(page - 1, currentFilters);
    nextBtn.onclick = () => loadEvents(page + 1, currentFilters);
}

// ─── Filters ──────────────────────────────────────────────────────────────────

function initFilters() {
    document.getElementById('btn-filter').addEventListener('click', applyFilters);
    document.getElementById('btn-clear-filters').addEventListener('click', () => {
        document.getElementById('filter-search').value = '';
        document.getElementById('filter-date-from').value = '';
        document.getElementById('filter-date-to').value = '';
        document.getElementById('filter-tags').value = '';
        loadEvents(1, {});
    });

    // Live search (debounced)
    let searchTimer;
    document.getElementById('filter-search').addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(applyFilters, 400);
    });
}

function applyFilters() {
    const search = document.getElementById('filter-search').value.trim();
    const dateFrom = document.getElementById('filter-date-from').value;
    const dateTo = document.getElementById('filter-date-to').value;
    const tags = document.getElementById('filter-tags').value.trim();

    const filters = {};
    if (search) filters.search = search;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (tags) filters.tags = tags;

    loadEvents(1, filters);
}

// ─── Event Form ───────────────────────────────────────────────────────────────

function initEventForm() {
    const form = document.getElementById('event-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitEventForm();
    });
}

async function submitEventForm() {
    const form = document.getElementById('event-form');
    const submitBtn = document.getElementById('submit-btn');
    const errorEl = document.getElementById('form-error');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    errorEl.hidden = true;

    const description = document.getElementById('event-description').value.trim();
    const eventDate = document.getElementById('event-date').value;

    if (!description || !eventDate) {
        errorEl.textContent = 'Descripción y fecha son obligatorias.';
        errorEl.hidden = false;
        return;
    }

    submitBtn.disabled = true;
    btnText.hidden = true;
    btnLoading.hidden = false;

    const formData = new FormData();
    const title = document.getElementById('event-title').value.trim();
    const tags = document.getElementById('event-tags').value.trim();

    if (title) formData.append('title', title);
    formData.append('description', description);
    formData.append('event_date', eventDate);
    if (tags) formData.append('tags', tags);

    const photoInput = document.getElementById('event-photos');
    if (photoInput.files) {
        Array.from(photoInput.files).forEach(file => formData.append('photos', file));
    }

    try {
        const res = await fetch(`${API_BASE}/api/events`, {
            method: 'POST',
            body: formData
        });
        const json = await res.json();
        if (!res.ok) {
            throw new Error(json.error || json.message || 'Error al publicar');
        }
        form.reset();
        document.getElementById('photo-previews').innerHTML = '';
    } catch (err) {
        errorEl.textContent = err.message || 'Error al publicar el evento.';
        errorEl.hidden = false;
    } finally {
        submitBtn.disabled = false;
        btnText.hidden = false;
        btnLoading.hidden = true;
    }
}

// ─── Photo Drop Zone ──────────────────────────────────────────────────────────

function initPhotoDropZone() {
    const dropZone = document.getElementById('file-drop-zone');
    const input = document.getElementById('event-photos');
    const previews = document.getElementById('photo-previews');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) {
            updatePreviews(e.dataTransfer.files);
        }
    });

    input.addEventListener('change', () => {
        if (input.files.length) updatePreviews(input.files);
    });

    function updatePreviews(files) {
        previews.innerHTML = '';
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const item = document.createElement('div');
                item.className = 'photo-preview-item';
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;
                item.appendChild(img);
                previews.appendChild(item);
            };
            reader.readAsDataURL(file);
        });
    }
}

// ─── Socket.IO Real-time ──────────────────────────────────────────────────────

function initSocketIO() {
    if (typeof io === 'undefined') return;

    const socket = io(API_BASE, { transports: ['websocket', 'polling'] });
    const liveBadge = document.getElementById('live-badge');

    socket.on('connect', () => {
        liveBadge.hidden = false;
    });

    socket.on('disconnect', () => {
        liveBadge.hidden = true;
    });

    socket.on('event:created', (event) => {
        const list = document.getElementById('events-list');
        const empty = document.getElementById('events-empty');
        empty.hidden = true;
        list.hidden = false;

        // Prepend new event card at the top
        const card = buildEventCard(event, true);
        list.insertBefore(card, list.firstChild);
    });
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function openLightbox(src) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';

    const img = document.createElement('img');
    img.src = src;
    img.className = 'lightbox-img';
    img.alt = 'Vista ampliada';

    const close = document.createElement('button');
    close.className = 'lightbox-close';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Cerrar');

    overlay.appendChild(img);
    overlay.appendChild(close);
    document.body.appendChild(overlay);

    const destroy = () => overlay.remove();
    close.addEventListener('click', destroy);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) destroy(); });
    document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') { destroy(); document.removeEventListener('keydown', esc); }
    });
}
