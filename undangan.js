/* ================================================================
   undangan.js — Logika Interaktif Undangan Pernikahan
   ================================================================

   DAFTAR FUNGSI:
   1. CONFIG          → Pengaturan mudah (tanggal, nama, dll.)
   2. COVER / OPEN    → Animasi buka undangan
   3. AOS INIT        → Animasi scroll
   4. COUNTDOWN       → Hitung mundur ke hari H
   5. MUSIK           → Play/pause musik latar
   6. RSVP            → Kirim konfirmasi + ucapan
   7. GALERI LIGHTBOX → Zoom foto galeri
   8. SALIN NOREK     → Copy nomor rekening
   9. SCROLL TOP      → Tombol kembali ke atas
  10. PETALS          → Animasi bunga jatuh
  11. NAVBAR SCROLL   → Efek navbar saat scroll

   ================================================================ */

/* ================================================================
   1. CONFIG 
   ================================================================ */
const CONFIG = {
  /* Tanggal pernikahan (format: 'YYYY-MM-DDTHH:MM:SS') */
  weddingDate: '2026-12-12T16:00:00',

  /* Nama pasangan */
  brideName: 'Reze',
  groomName: 'Denji Hayakawa',

  /* Jumlah kelopak bunga yang jatuh (0 untuk nonaktifkan) */
  petalCount: 15,

  /* Autoplay musik saat undangan dibuka? true/false */
  autoplayMusic: true,

  /* Animasi AOS: 'fade-up', 'zoom-in', 'flip-left', dll. */
  defaultAnimation: 'fade-up',
};

/* ================================================================
   2. INISIALISASI SAAT HALAMAN DIMUAT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Init AOS (Animate on Scroll)
  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
  });

  // Tombol buka undangan
  const btnOpen = document.getElementById('btnOpen');
  if (btnOpen) btnOpen.addEventListener('click', openInvitation);

  // Scroll event untuk navbar & scroll-to-top button
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Mulai countdown
  startCountdown();

  // Buat petals
  if (CONFIG.petalCount > 0) createPetals(CONFIG.petalCount);
});

/* ================================================================
   3. BUKA UNDANGAN
   ================================================================ */
function openInvitation() {
  const cover = document.getElementById('cover-screen');
  const main  = document.getElementById('mainContent');

  // Animasi cover menghilang
  cover.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  cover.style.opacity    = '0';
  cover.style.transform  = 'scale(1.05)';

  setTimeout(() => {
    cover.classList.remove('d-flex');
    cover.classList.add('d-none');
    cover.style.setProperty('display', 'none', 'important');
    main.classList.remove('d-none');
    main.classList.add('fade-in');

    // Scroll ke atas konten
    window.scrollTo(0, 0);

    // Refresh AOS setelah konten muncul
    setTimeout(() => {
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
    }, 150);

    // Autoplay musik
    if (CONFIG.autoplayMusic) {
      const music = document.getElementById('bgMusic');
      if (music) {
        music.play().catch(() => {
          // Browser memblokir autoplay: tombol musik tetap tersedia
          console.log('Autoplay diblokir browser. Pengguna bisa klik tombol musik.');
        });
        updateMusicUI(true);
      }
    }
  }, 800);
}

/* ================================================================
   4. COUNTDOWN HITUNG MUNDUR
   ================================================================ */
function startCountdown() {
  function tick() {
    const now     = new Date();
    const target  = new Date(CONFIG.weddingDate);
    const diff    = target - now;

    const elDays  = document.getElementById('cntDays');
    const elHours = document.getElementById('cntHours');
    const elMins  = document.getElementById('cntMins');
    const elSecs  = document.getElementById('cntSecs');

    if (!elDays) return; // Element belum ada

    if (diff <= 0) {
      // Hari H sudah tiba!
      elDays.textContent  = '00';
      elHours.textContent = '00';
      elMins.textContent  = '00';
      elSecs.textContent  = '00';

      const label = document.querySelector('.countdown-label');
      if (label) label.textContent = '🎉 Hari Bahagia Telah Tiba!';
      return; // Hentikan interval, tidak perlu update lagi
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    elDays.textContent  = String(days).padStart(2, '0');
    elHours.textContent = String(hours).padStart(2, '0');
    elMins.textContent  = String(minutes).padStart(2, '0');
    elSecs.textContent  = String(seconds).padStart(2, '0');

    // Animasi flip kecil pada detik
    elSecs.style.animation = 'none';
    elSecs.offsetHeight;     // reflow
    elSecs.style.animation  = 'flipNum 0.25s ease';
  }

  tick();
  setInterval(tick, 1000);
}

// Tambahkan keyframe flipNum secara dinamis
const flipStyle = document.createElement('style');
flipStyle.textContent = `
  @keyframes flipNum {
    from { transform: translateY(-4px); opacity: 0.5; }
    to   { transform: translateY(0);    opacity: 1;   }
  }
`;
document.head.appendChild(flipStyle);

/* ================================================================
   5. MUSIK LATAR
   ================================================================ */
let isPlaying = false;

function toggleMusic() {
  const music   = document.getElementById('bgMusic');
  const musicBtn = document.getElementById('musicBtn');
  if (!music) return;

  if (isPlaying) {
    music.pause();
    updateMusicUI(false);
  } else {
    music.play().catch(err => console.warn('Musik gagal diputar:', err));
    updateMusicUI(true);
  }
}

function updateMusicUI(playing) {
  isPlaying = playing;
  const icon    = document.getElementById('musicIcon');
  const musicBtn = document.getElementById('musicBtn');
  if (!icon) return;

  if (playing) {
    icon.className   = 'bi bi-pause-fill';
    musicBtn.classList.add('playing');
    musicBtn.title   = 'Pause musik';
  } else {
    icon.className   = 'bi bi-music-note-beamed';
    musicBtn.classList.remove('playing');
    musicBtn.title   = 'Putar musik';
  }
}

/* ================================================================
   6. RSVP — KIRIM KONFIRMASI & TAMPILKAN UCAPAN
   ================================================================ */
function submitRSVP(event) {
  event.preventDefault();

  const name       = document.getElementById('rsvpName').value.trim();
  const phone      = document.getElementById('rsvpPhone').value.trim();
  const attendance = document.querySelector('input[name="attendance"]:checked')?.value;
  const guests     = document.getElementById('rsvpGuests').value;
  const message    = document.getElementById('rsvpMsg').value.trim();

  if (!name || !phone || !attendance) {
    showToast('Mohon lengkapi semua field yang wajib diisi.', 'error');
    return;
  }

  // Tambahkan ucapan ke daftar
  if (message) {
    addWish(name, attendance, guests, message);
  }

  // Tampilkan pesan sukses
  showToast(`Terima kasih, ${name}! Konfirmasi Anda telah kami terima. 🎉`, 'success');

  // Reset form
  document.getElementById('rsvpForm').reset();

  // Scroll ke daftar ucapan
  setTimeout(() => {
    document.getElementById('wishesContainer').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 500);
}

function addWish(name, attendance, guests, message) {
  const container = document.getElementById('wishesContainer');
  if (!container) return;

  const avatar = name.charAt(0).toUpperCase();
  const attendanceLabel = attendance === 'hadir'
    ? `✅ Hadir • ${guests} orang`
    : '❌ Tidak Hadir';

  const wishEl = document.createElement('div');
  wishEl.className = 'wish-item';
  wishEl.setAttribute('data-aos', 'fade-up');
  wishEl.innerHTML = `
    <div class="wish-header">
      <span class="wish-avatar">${avatar}</span>
      <div>
        <strong>${escapeHtml(name)}</strong>
        <small>${attendanceLabel}</small>
      </div>
    </div>
    <p class="wish-message">${escapeHtml(message)}</p>
  `;

  // Animasi masuk
  wishEl.style.opacity   = '0';
  wishEl.style.transform = 'translateY(10px)';
  container.insertBefore(wishEl, container.firstChild);

  requestAnimationFrame(() => {
    wishEl.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    wishEl.style.opacity    = '1';
    wishEl.style.transform  = 'translateY(0)';
  });
}

/* ================================================================
   7. GALERI LIGHTBOX
   ================================================================ */
function openLightbox(el) {
  const img       = el.querySelector('img');
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lightboxImg');

  if (!img || !lightbox || !lbImg) return;

  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

// Tutup lightbox dengan tombol Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

/* ================================================================
   8. SALIN NOMOR REKENING
   ================================================================ */
function copyNorek(elId, btn) {
  const el = document.getElementById(elId);
  if (!el) return;

  const text = el.textContent.trim();

  navigator.clipboard.writeText(text)
    .then(() => {
      btn.classList.add('copied');
      btn.innerHTML = '<i class="bi bi-check2 me-1"></i> Tersalin!';
      showToast(`Nomor rekening ${text} berhasil disalin!`, 'success');
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = '<i class="bi bi-clipboard me-1"></i> Salin Nomor';
      }, 2500);
    })
    .catch(() => {
      // Fallback untuk browser lama
      const temp = document.createElement('input');
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      btn.classList.add('copied');
      btn.innerHTML = '<i class="bi bi-check2 me-1"></i> Tersalin!';
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = '<i class="bi bi-clipboard me-1"></i> Salin Nomor';
      }, 2500);
    });
}

/* ================================================================
   9. SCROLL TO TOP
   ================================================================ */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleScroll() {
  const scrollY    = window.scrollY;
  const scrollBtn  = document.getElementById('scrollTop');
  const navbar     = document.querySelector('.wedding-nav');

  // Tombol scroll to top
  if (scrollBtn) {
    if (scrollY > 300) scrollBtn.classList.add('visible');
    else               scrollBtn.classList.remove('visible');
  }

  // Efek navbar shadow
  if (navbar) {
    navbar.style.boxShadow = scrollY > 20
      ? '0 4px 20px rgba(0,0,0,0.3)'
      : 'none';
  }
}

/* ================================================================
  10. ANIMASI BUNGA JATUH (PETALS)
  ================================================================ */
function createPetals(count) {
  // Hanya aktifkan setelah konten dibuka
  for (let i = 0; i < count; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';

    const size     = Math.random() * 8 + 6;       // 6–14 px
    const left     = Math.random() * 100;          // % dari kiri
    const duration = Math.random() * 8 + 8;       // 8–16 detik
    const delay    = Math.random() * 15;           // 0–15 detik delay

    petal.style.cssText = `
      left: ${left}%;
      width: ${size}px;
      height: ${size * 1.4}px;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      border-radius: ${Math.random() > 0.5 ? '50% 0 50% 0' : '0 50% 0 50%'};
      opacity: ${Math.random() * 0.4 + 0.3};
    `;

    document.body.appendChild(petal);
  }
}

/* ================================================================
  11. TOAST NOTIFICATION
  ================================================================ */
function showToast(message, type = 'success') {
  // Hapus toast yang ada
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.style.cssText = `
    position: fixed;
    bottom: 90px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: ${type === 'success' ? '#2c4f3a' : '#6b1a1a'};
    color: #fff;
    padding: 12px 24px;
    border-radius: 30px;
    font-family: var(--font-body);
    font-size: 0.85rem;
    z-index: 99999;
    opacity: 0;
    transition: opacity 0.35s ease, transform 0.35s ease;
    max-width: 90vw;
    text-align: center;
    box-shadow: 0 8px 30px rgba(0,0,0,0.25);
    border-left: 3px solid ${type === 'success' ? '#7ab26e' : '#c9474b'};
  `;
  toast.textContent = message;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity   = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ================================================================
  12. UTILITY: Escape HTML untuk mencegah XSS
  ================================================================ */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/* ================================================================
  13. NAVIGASI SMOOTH SCROLL KE SECTION
  ================================================================ */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  e.preventDefault();
  const targetId = link.getAttribute('href').slice(1);
  const target   = document.getElementById(targetId);
  if (!target) return;

  const navHeight = document.querySelector('.wedding-nav')?.offsetHeight || 60;
  const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
  window.scrollTo({ top, behavior: 'smooth' });
});
