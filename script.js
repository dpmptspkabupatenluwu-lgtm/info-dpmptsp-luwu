/* ============================================
   DPMPTSP KABUPATEN LUWU - PORTAL INFORMASI
   JavaScript Engine - Vanilla JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    showPreloader();
    startClock();
    await loadAllData();
    initNavigation();
    initBackToTop();
    hidePreloader();
}

// ========== PRELOADER ==========
function showPreloader() {
    document.getElementById('preloader').classList.remove('hidden');
}
function hidePreloader() {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
    }, 400);
}

// ========== CLOCK ==========
function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    const jam = now.getHours().toString().padStart(2, '0');
    const menit = now.getMinutes().toString().padStart(2, '0');
    const detik = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('jamDigital').textContent = `${jam}:${menit}:${detik}`;

    const hari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const tanggalStr = `${hari[now.getDay()]}, ${now.getDate()} ${bulan[now.getMonth()]} ${now.getFullYear()}`;
    document.getElementById('tanggalHari').textContent = tanggalStr;
    document.getElementById('footerYear').textContent = now.getFullYear();
}

// ========== LOAD ALL JSON DATA ==========
async function loadAllData() {
    try {
        const [kegiatanRes, pengumumanRes, layananRes] = await Promise.all([
            fetch('data/kegiatan.json'),
            fetch('data/pengumuman.json'),
            fetch('data/layanan.json')
        ]);

        if (!kegiatanRes.ok || !pengumumanRes.ok || !layananRes.ok) {
            throw new Error('Gagal memuat data JSON');
        }

        const kegiatan = await kegiatanRes.json();
        const pengumuman = await pengumumanRes.json();
        const layanan = await layananRes.json();

        renderAll(kegiatan, pengumuman, layanan);
    } catch (err) {
        console.error('Error loading data:', err);
        showErrorState();
    }
}

function showErrorState() {
    const sections = ['kegiatanPreview','kegiatanAll','galeriGrid','pengumumanList','layananTableBody'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<p style="color:#dc2626;text-align:center;padding:20px;">⚠️ Gagal memuat data. Periksa koneksi atau file JSON.</p>';
    });
}

// ========== RENDER ALL ==========
function renderAll(kegiatan, pengumuman, layanan) {
    renderStats(kegiatan, pengumuman, layanan);
    renderRunningText(pengumuman);
    renderHeroSlider(kegiatan);
    renderKegiatanPreview(kegiatan);
    renderKegiatanAll(kegiatan);
    renderGaleri(kegiatan);
    renderPengumuman(pengumuman);
    renderLayanan(layanan);
}

// ========== STATS ==========
function renderStats(kegiatan, pengumuman, layanan) {
    document.getElementById('countKegiatan').textContent = kegiatan.length;
    document.getElementById('countPengumuman').textContent = pengumuman.length;
    document.getElementById('countLayanan').textContent = layanan.length;
    
    // Count unique photos
    const fotoUnik = new Set(kegiatan.filter(k => k.foto).map(k => k.foto));
    document.getElementById('countGaleri').textContent = fotoUnik.size;

    document.getElementById('kegiatanCountLabel').textContent = `${kegiatan.length} kegiatan`;
    document.getElementById('pengumumanCountLabel').textContent = `${pengumuman.length} pengumuman`;
    document.getElementById('galeriCountLabel').textContent = `${fotoUnik.size} foto`;
}

// ========== RUNNING TEXT ==========
function renderRunningText(pengumuman) {
    if (pengumuman.length === 0) {
        document.getElementById('runningText').innerHTML = '<span class="running-label">📢 INFO</span><span class="running-separator">•</span><span class="running-content">Belum ada pengumuman terbaru</span>';
        return;
    }
    const gabung = pengumuman.map(p => `${p.judul}: ${p.isi}`).join('  •  ');
    document.getElementById('runningText').innerHTML = `<span class="running-label">📢 INFO</span><span class="running-separator">•</span><span class="running-content">${gabung}</span>`;
}

// ========== HERO SLIDER ==========
let slideIndex = 0;
let slideInterval;
let slideItems = [];

function renderHeroSlider(kegiatan) {
    const track = document.getElementById('sliderTrack');
    const dots = document.getElementById('sliderDots');
    
    const slides = kegiatan.length > 0 ? kegiatan.slice(0, 5) : [{
        judul: 'Selamat Datang di DPMPTSP Luwu',
        deskripsi: 'Melayani dengan Profesional, Transparan, dan Akuntabel',
        foto: ''
    }];

    slideItems = slides;
    track.innerHTML = slides.map((k, i) => `
        <div class="slider-slide">
            ${k.foto ? `<img src="${k.foto}" alt="${k.judul}" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(135deg, #0a3d62, #1e8449)'">` : ''}
            <div class="slider-slide-overlay" style="${!k.foto ? 'position:static;background:linear-gradient(135deg, #0a3d62, #1e8449);padding:32px;height:100%;display:flex;flex-direction:column;justify-content:center' : ''}">
                <h3>${k.judul}</h3>
                <p>${k.deskripsi || 'DPMPTSP Kabupaten Luwu'}</p>
            </div>
        </div>
    `).join('');

    dots.innerHTML = slides.map((_, i) => `<button class="slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Slide ${i+1}"></button>`).join('');
    
    dots.querySelectorAll('.slider-dot').forEach(dot => {
        dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index)));
    });

    document.getElementById('sliderPrev').addEventListener('click', prevSlide);
    document.getElementById('sliderNext').addEventListener('click', nextSlide);

    updateSlidePosition();
    startSlideAuto();
}

function updateSlidePosition() {
    document.getElementById('sliderTrack').style.transform = `translateX(-${slideIndex * 100}%)`;
    document.querySelectorAll('.slider-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === slideIndex);
    });
}

function nextSlide() {
    slideIndex = (slideIndex + 1) % slideItems.length;
    updateSlidePosition();
    resetSlideAuto();
}

function prevSlide() {
    slideIndex = (slideIndex - 1 + slideItems.length) % slideItems.length;
    updateSlidePosition();
    resetSlideAuto();
}

function goToSlide(index) {
    slideIndex = index;
    updateSlidePosition();
    resetSlideAuto();
}

function startSlideAuto() {
    slideInterval = setInterval(nextSlide, 5000);
}

function resetSlideAuto() {
    clearInterval(slideInterval);
    startSlideAuto();
}

// ========== KEGIATAN PREVIEW (4 terbaru) ==========
function renderKegiatanPreview(kegiatan) {
    const container = document.getElementById('kegiatanPreview');
    const preview = [...kegiatan].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 4);
    container.innerHTML = preview.map(k => createKegiatanCard(k)).join('');
}

// ========== KEGIATAN ALL ==========
function renderKegiatanAll(kegiatan) {
    const container = document.getElementById('kegiatanAll');
    const sorted = [...kegiatan].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    container.innerHTML = sorted.map(k => createKegiatanCard(k)).join('');
}

function createKegiatanCard(k) {
    const tgl = formatTanggal(k.tanggal);
    const imgSrc = k.foto || '';
    const imgTag = imgSrc 
        ? `<img src="${imgSrc}" alt="${k.judul}" class="kegiatan-card-img" loading="lazy" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<div class=\\'kegiatan-card-img placeholder-img\\' style=\\'background:linear-gradient(135deg,#e0f2fe,#d1fae5);display:flex;align-items:center;justify-content:center;font-size:40px;\\'>📋</div>');this.remove()">`
        : `<div class="kegiatan-card-img placeholder-img" style="background:linear-gradient(135deg,#e0f2fe,#d1fae5);display:flex;align-items:center;justify-content:center;font-size:40px;">📋</div>`;

    return `
        <article class="kegiatan-card">
            ${imgTag}
            <div class="kegiatan-card-body">
                <span class="kegiatan-card-date">📅 ${tgl}</span>
                <h3 class="kegiatan-card-title">${k.judul}</h3>
                <p class="kegiatan-card-desc">${k.deskripsi || ''}</p>
            </div>
        </article>
    `;
}

// ========== GALERI ==========
function renderGaleri(kegiatan) {
    const container = document.getElementById('galeriGrid');
    const fotoUnik = [...new Set(kegiatan.filter(k => k.foto).map(k => k.foto))];
    
    if (fotoUnik.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--gray-400);grid-column:1/-1;padding:40px;">📷 Belum ada foto kegiatan</p>';
        return;
    }

    container.innerHTML = fotoUnik.map((foto, i) => {
        const kegiatanTerkait = kegiatan.find(k => k.foto === foto);
        const caption = kegiatanTerkait ? kegiatanTerkait.judul : 'Foto Kegiatan';
        return `
            <div class="galeri-item" data-src="${foto}" data-caption="${caption}">
                <img src="${foto}" alt="${caption}" loading="lazy" onerror="this.parentElement.style.display='none'">
                <div class="galeri-item-overlay"><span>${caption}</span></div>
            </div>
        `;
    }).join('');

    initLightbox();
}

// ========== LIGHTBOX ==========
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.getElementById('lightboxClose');

    document.querySelectorAll('.galeri-item').forEach(item => {
        item.addEventListener('click', () => {
            lightboxImg.src = item.dataset.src;
            lightboxCaption.textContent = item.dataset.caption;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('lightboxImg').src = '';
}

// ========== PENGUMUMAN ==========
function renderPengumuman(pengumuman) {
    const container = document.getElementById('pengumumanList');
    if (pengumuman.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--gray-400);padding:40px;">📢 Belum ada pengumuman</p>';
        return;
    }
    container.innerHTML = pengumuman.map(p => `
        <div class="pengumuman-item">
            <span class="pengumuman-icon">📢</span>
            <div class="pengumuman-content">
                <h4>${p.judul}</h4>
                <p>${p.isi}</p>
            </div>
        </div>
    `).join('');
}

// ========== LAYANAN ==========
function renderLayanan(layanan) {
    const tbody = document.getElementById('layananTableBody');
    if (layanan.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--gray-400);">Belum ada data layanan</td></tr>';
        return;
    }
    tbody.innerHTML = layanan.map((l, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><strong>${l.nama}</strong></td>
            <td>${l.syarat}</td>
            <td><span class="badge-waktu">⏱ ${l.waktu}</span></td>
        </tr>
    `).join('');
}

// ========== NAVIGATION ==========
function initNavigation() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    const links = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
        toggle.classList.toggle('active');
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = 'beranda';
        sections.forEach(section => {
            const top = section.offsetTop - 180;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });
        links.forEach(link => {
            link.classList.toggle('active', link.dataset.section === current);
        });
    });

    // Smooth scroll & close mobile menu
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
                menu.classList.remove('open');
            }
        });
    });
}

// ========== BACK TO TOP ==========
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ========== UTILS ==========
function formatTanggal(tglStr) {
    if (!tglStr) return '-';
    try {
        const tgl = new Date(tglStr);
        if (isNaN(tgl.getTime())) return tglStr;
        const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
        return `${tgl.getDate()} ${bulan[tgl.getMonth()]} ${tgl.getFullYear()}`;
    } catch {
        return tglStr;
    }
}