// ── COUNTDOWN ──────────────────────────────────────────────
function updateCountdown() {
  const target = new Date('2026-11-07T15:00:00');
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) {
    ['days', 'hours', 'minutes', 'seconds'].forEach(id => {
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
  set('days', d, 3);
  set('hours', h, 2);
  set('minutes', m, 2);
  set('seconds', s, 2);
}

// ── HORIZONTAL BOOK ────────────────────────────────────────
function initHorizontalBook() {
  const wrapper = document.querySelector('.app-wrapper');
  if (!wrapper) return;

  const pages = Array.from(wrapper.querySelectorAll('section.horizontal-page'));
  let currentPage = 0;

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
    triggerFades(pages[index]);
  }

  // Hero chevron button → go to page 2
  const heroNext = document.getElementById('hero-next-btn');
  if (heroNext) heroNext.addEventListener('click', () => goTo(1));

  // Touch swipe
  let tx = 0;
  document.addEventListener('touchstart', e => { tx = e.changedTouches[0].screenX; }, { passive: true });
  document.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].screenX - tx;
    if (diff < -50 && currentPage < pages.length - 1) goTo(currentPage + 1);
    else if (diff > 50 && currentPage > 0) goTo(currentPage - 1);
  }, { passive: true });

  // Mouse wheel navigation (only at scroll edges)
  let scrolling = false;
  window.addEventListener('wheel', e => {
    if (scrolling) return;
    const ap = pages[currentPage];
    if (!ap) return;
    if (e.deltaY > 0) {
      if (Math.ceil(ap.scrollTop + ap.clientHeight) >= ap.scrollHeight - 5 && currentPage < pages.length - 1) {
        scrolling = true; goTo(currentPage + 1); setTimeout(() => scrolling = false, 1300);
      }
    } else {
      if (ap.scrollTop <= 5 && currentPage > 0) {
        scrolling = true; goTo(currentPage - 1); setTimeout(() => scrolling = false, 1300);
      }
    }
  }, { passive: false });

  goTo(0);
}

// ── FADE-IN OBSERVER ───────────────────────────────────────
function triggerFades(container) {
  const els = (container || document).querySelectorAll('.fade-in:not(.visible)');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1, root: container });
  els.forEach(el => obs.observe(el));
}

// ── RSVP ───────────────────────────────────────────────────
function handleRsvp() {
  const form = document.getElementById('rsvp-form-inner');
  const msg = document.getElementById('rsvp-message');
  if (!form || !msg) return;
  form.style.display = 'none';
  msg.style.display = 'block';
  msg.innerHTML = '🕊️ <strong>Presença confirmada!</strong><br><br>'
    + 'Estamos muito felizes em ter você conosco neste dia especial.<br><br>'
    + '<a href="gifts/lista_presentes.html" style="display:inline-block;margin-top:8px;padding:11px 24px;'
    + 'background:#2D4A3E;color:#F5EDE0;font-family:Montserrat,sans-serif;font-size:9px;font-weight:700;'
    + 'letter-spacing:0.3em;text-transform:uppercase;text-decoration:none;border-radius:4px;">🎁 Ver Lista de Presentes</a>';
}

// ── INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Guest name from URL
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('name');
  if (guestName) {
    const el = document.getElementById('guest-greeting');
    if (el) el.textContent = `para ${guestName}`;

    const cursiveEl = document.getElementById('invite-guest-name-cursive');
    if (cursiveEl) cursiveEl.textContent = guestName;
  }

  // Video overlay
  const videoOverlay = document.getElementById('video-overlay');
  const introVideo = document.getElementById('intro-video');
  const skipBtn = document.getElementById('skip-video-btn');
  const musicBtn = document.getElementById('music-btn');
  const bgm = document.getElementById('bgm');
  const videoTransition = document.getElementById('video-transition');
  const vtEnterBtn = document.getElementById('vt-enter-btn');

  function showTransition() {
    // Esconde o vídeo
    if (videoOverlay) {
      videoOverlay.classList.add('hidden');
      setTimeout(() => videoOverlay.style.display = 'none', 1000);
    }
    // Exibe a tela de transição
    if (videoTransition) {
      videoTransition.classList.add('visible');
      // Inicia o efeito typewriter após a tela aparecer
      setTimeout(startTypewriter, 900);
    }
  }

  function startTypewriter() {
    const phraseEl = document.getElementById('vt-phrase');
    const dividerEl = document.querySelector('.vt-divider');
    const enterBtn = document.getElementById('vt-enter-btn');
    const sfx = document.getElementById('typewriter-sfx');
    const fullText = 'Avance para descobrir os detalhes do início do nosso para sempre';
    let index = 0;

    if (!phraseEl) return;
    phraseEl.textContent = '';

    // Configura o áudio para loop suave
    if (sfx) {
      sfx.volume = 0.55;
      sfx.loop = true;
      sfx.currentTime = 0;
      sfx.play().catch(() => { });
    }

    function typeNext() {
      if (index < fullText.length) {
        phraseEl.textContent += fullText[index];
        index++;
        // Velocidade variável: pausa maior em espaços e vírgulas
        const ch = fullText[index - 1];
        const delay = ch === ' ' ? 60 :
          ch === ',' ? 200 :
            40 + Math.random() * 35;
        setTimeout(typeNext, delay);
      } else {
        // Digitação concluída
        if (sfx) { sfx.pause(); sfx.currentTime = 0; }
        phraseEl.classList.add('typing-done');
        // Revela divisor e botão
        setTimeout(() => {
          if (dividerEl) dividerEl.classList.add('show');
          setTimeout(() => {
            if (enterBtn) enterBtn.classList.add('show');
          }, 400);
        }, 300);
      }
    }
    typeNext();
  }

  function hideVideo() {
    // Esconde a tela de transição
    if (videoTransition) {
      videoTransition.classList.remove('visible');
      videoTransition.classList.add('hidden');
      setTimeout(() => videoTransition.style.display = 'none', 1200);
    }
    // Inicia a música e o convite
    if (musicBtn && bgm) {
      musicBtn.classList.add('visible');
      bgm.volume = 0.45;
      bgm.play().catch(() => { });
    }
    initHorizontalBook();
  }

  if (introVideo) {
    introVideo.addEventListener('ended', () => {
      if (skipBtn) skipBtn.style.display = 'none';
      showTransition();
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
    initHorizontalBook();
  }

  if (skipBtn) skipBtn.addEventListener('click', showTransition);
  if (vtEnterBtn) vtEnterBtn.addEventListener('click', hideVideo);


  // Music toggle
  if (musicBtn && bgm) {
    let playing = false;
    bgm.addEventListener('play', () => { playing = true; musicBtn.textContent = '♬'; });
    bgm.addEventListener('pause', () => { playing = false; musicBtn.textContent = '♪'; });
    musicBtn.addEventListener('click', () => {
      if (playing) bgm.pause();
      else bgm.play().catch(() => { });
    });
  }
});
