// ── COUNTDOWN ────────────────────────────────────────────
function updateCountdown() {
  const target = new Date('2026-11-07T15:00:00');
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) {
    ['days','hours','minutes','seconds'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '00';
    });
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const set = (id, v, pad) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(v).padStart(pad, '0');
  };
  set('days', d, 3); set('hours', h, 2);
  set('minutes', m, 2); set('seconds', s, 2);
}

// ── HORIZONTAL BOOK ───────────────────────────────────────
function initHorizontalBook() {
  const wrapper = document.querySelector('.app-wrapper');
  if (!wrapper) return;

  const pages = Array.from(wrapper.querySelectorAll('section'));
  pages.forEach((page, i) => {
    page.classList.add('horizontal-page');
    if (i === 0) page.classList.add('active-page');
    else page.classList.add('next-page');
  });

  let currentPage = 0;

  // Inject controls
  const controls = document.createElement('div');
  controls.className = 'book-controls';
  controls.innerHTML = `
    <button id="prev-page" class="book-btn" disabled title="Anterior">
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
    <button id="next-page" class="book-btn" title="Próxima">
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>`;
  document.body.appendChild(controls);

  const btnPrev = document.getElementById('prev-page');
  const btnNext = document.getElementById('next-page');

  function goTo(index) {
    if (index < 0 || index >= pages.length) return;
    pages.forEach((p, i) => {
      p.classList.remove('active-page', 'flipped', 'next-page');
      if (i === index) p.classList.add('active-page');
      else if (i < index) p.classList.add('flipped');
      else p.classList.add('next-page');
    });
    pages[index].scrollTop = 0;
    currentPage = index;
    btnPrev.disabled = currentPage === 0;
    btnNext.disabled = currentPage === pages.length - 1;

    // Trigger fade-ins on new page
    triggerFades(pages[index]);
  }

  btnNext.addEventListener('click', () => { if (currentPage < pages.length - 1) goTo(currentPage + 1); });
  btnPrev.addEventListener('click', () => { if (currentPage > 0) goTo(currentPage - 1); });

  // Touch swipe
  let tx = 0;
  document.addEventListener('touchstart', e => { tx = e.changedTouches[0].screenX; }, { passive: true });
  document.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].screenX - tx;
    if (diff < -50 && currentPage < pages.length - 1) goTo(currentPage + 1);
    else if (diff > 50 && currentPage > 0) goTo(currentPage - 1);
  }, { passive: true });

  // Mouse wheel
  let scrolling = false;
  window.addEventListener('wheel', e => {
    if (scrolling) return;
    const ap = pages[currentPage];
    if (!ap) return;
    if (e.deltaY > 0) {
      if (Math.ceil(ap.scrollTop + ap.clientHeight) >= ap.scrollHeight - 5 && currentPage < pages.length - 1) {
        scrolling = true; goTo(currentPage + 1); setTimeout(() => scrolling = false, 1200);
      }
    } else {
      if (ap.scrollTop <= 5 && currentPage > 0) {
        scrolling = true; goTo(currentPage - 1); setTimeout(() => scrolling = false, 1200);
      }
    }
  }, { passive: false });

  goTo(0);
}

// ── FADE-IN OBSERVER ──────────────────────────────────────
function triggerFades(container) {
  const els = (container || document).querySelectorAll('.fade-in:not(.visible)');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

// ── RSVP ──────────────────────────────────────────────────
function handleRsvp() {
  const form = document.getElementById('rsvp-form-inner');
  const msg = document.getElementById('rsvp-message');
  if (!form || !msg) return;
  form.style.display = 'none';
  msg.style.display = 'block';
  msg.innerHTML = '🕊️ <strong>Presença confirmada!</strong><br><br>Estamos muito felizes em ter você conosco neste dia especial.<br><br>'
    + '<a href="gifts/lista_presentes.html" style="display:inline-block;margin-top:8px;padding:11px 24px;background:#2D4A3E;color:#F5EDE0;font-family:Montserrat,sans-serif;font-size:9px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;text-decoration:none;border-radius:4px;">🎁 Ver Lista de Presentes</a>';
}

function handleDecline() {
  const form = document.getElementById('rsvp-form-inner');
  const msg = document.getElementById('rsvp-message');
  if (!form || !msg) return;
  form.style.display = 'none';
  msg.style.display = 'block';
  msg.innerHTML = 'Sentiremos muito a sua falta. Obrigado pelo carinho! 💛';
}

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Guest name
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('name');
  if (guestName) {
    const el = document.getElementById('guest-greeting');
    if (el) el.textContent = `para ${guestName}`;
  }

  // Video overlay
  const videoOverlay = document.getElementById('video-overlay');
  const introVideo   = document.getElementById('intro-video');
  const skipBtn      = document.getElementById('skip-video-btn');
  const musicBtn     = document.getElementById('music-btn');
  const bgm          = document.getElementById('bgm');

  function hideVideo() {
    if (videoOverlay) {
      videoOverlay.classList.add('hidden');
      setTimeout(() => videoOverlay.style.display = 'none', 1000);
    }
    if (musicBtn && bgm) {
      musicBtn.classList.add('visible');
      bgm.volume = 0.45;
      bgm.play().catch(() => {});
    }
    initHorizontalBook();
    triggerFades(document.querySelector('.active-page'));
  }

  if (introVideo) {
    introVideo.addEventListener('ended', () => {
      if (skipBtn) skipBtn.style.display = 'none';
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:10002;cursor:pointer;background:rgba(0,0,0,0.12);';
      const btn = document.createElement('span');
      btn.textContent = 'Toque para acessar o convite';
      btn.style.cssText = 'padding:14px 28px;border:1px solid rgba(255,255,255,0.55);border-radius:30px;font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);';
      overlay.appendChild(btn);
      overlay.addEventListener('click', hideVideo);
      videoOverlay.appendChild(overlay);
    });
    introVideo.addEventListener('error', hideVideo);

    const pp = introVideo.play();
    if (pp) {
      pp.catch(() => {
        introVideo.muted = true;
        introVideo.play();
        const ub = document.createElement('button');
        ub.innerHTML = '🔊 Ativar Som';
        ub.style.cssText = 'position:absolute;top:30px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.4);color:rgba(255,255,255,0.9);padding:11px 22px;border-radius:30px;font-family:Montserrat,sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;cursor:pointer;backdrop-filter:blur(4px);z-index:10001;';
        ub.addEventListener('click', () => { introVideo.muted = false; introVideo.currentTime = 0; ub.remove(); });
        videoOverlay.appendChild(ub);
      });
    }
  } else {
    // No video — init book directly
    initHorizontalBook();
    triggerFades(document.querySelector('.active-page'));
  }

  if (skipBtn) skipBtn.addEventListener('click', hideVideo);

  // Music toggle
  if (musicBtn && bgm) {
    let playing = false;
    bgm.addEventListener('play', () => { playing = true; musicBtn.textContent = '♬'; });
    musicBtn.addEventListener('click', () => {
      if (playing) { bgm.pause(); musicBtn.textContent = '♪'; }
      else { bgm.play().catch(() => {}); musicBtn.textContent = '♬'; }
      playing = !playing;
    });
  }

  // Children toggle
  document.querySelectorAll('[name="children"]').forEach(r => {
    r.addEventListener('change', () => {
      const d = document.getElementById('children-details');
      if (d) d.classList.toggle('visible', r.value === 'yes' && r.checked);
    });
  });
});
