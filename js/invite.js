// Default configuration
const defaultConfig = {
  bride_name: 'Evellyn',
  groom_name: 'Guilherme',
  wedding_phrase: '"Unidos pela fé, amor e graça divina"',
  bible_verse: '"O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha. Não maltrata, não procura seus interesses, não se ira facilmente, não guarda rancor. O amor não se alegra com a injustiça, mas se alegra com a verdade. Tudo sofre, tudo crê, tudo espera, tudo suporta."',
  primary_bg: '#EDF5F0',
  secondary_surface: '#FEFDFB',
  text_color: '#2C4A3E',
  primary_action: '#5BA89D',
  secondary_action: '#C9A84C'
};

let config = { ...defaultConfig };

// Countdown
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

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (daysEl) daysEl.textContent = String(d).padStart(3, '0');
  if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
  if (minutesEl) minutesEl.textContent = String(m).padStart(2, '0');
  if (secondsEl) secondsEl.textContent = String(s).padStart(2, '0');
}

// Update UI based on config
async function onConfigChange(newConfig) {
  config = { ...config, ...newConfig };

  // Update names
  const brideEl = document.getElementById('bride-name');
  const groomEl = document.getElementById('groom-name');
  const footerNames = document.getElementById('footer-names');

  if (brideEl) brideEl.textContent = config.bride_name || defaultConfig.bride_name;
  if (groomEl) groomEl.textContent = config.groom_name || defaultConfig.groom_name;
  if (footerNames) footerNames.textContent = `${config.bride_name || defaultConfig.bride_name} & ${config.groom_name || defaultConfig.groom_name}`;

  // Update phrases
  const phraseEl = document.getElementById('wedding-phrase');
  const verseEl = document.getElementById('bible-verse');

  if (phraseEl) phraseEl.textContent = config.wedding_phrase || defaultConfig.wedding_phrase;
  if (verseEl) verseEl.textContent = config.bible_verse || defaultConfig.bible_verse;

  // Update colors
  document.documentElement.style.setProperty('--primary-bg', config.primary_bg || defaultConfig.primary_bg);
  document.documentElement.style.setProperty('--secondary-surface', config.secondary_surface || defaultConfig.secondary_surface);
  document.documentElement.style.setProperty('--text-color', config.text_color || defaultConfig.text_color);
  document.documentElement.style.setProperty('--primary-action', config.primary_action || defaultConfig.primary_action);
  document.documentElement.style.setProperty('--secondary-action', config.secondary_action || defaultConfig.secondary_action);
}

function handleScrollAnimation() {
  const sections = document.querySelectorAll('.fade-in-section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(section => observer.observe(section));
}

// Parallax Mouse Effect
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 100;
  const y = (e.clientY / window.innerHeight - 0.5) * 100;

  const orb1 = document.querySelector('.orb-1');
  const orb2 = document.querySelector('.orb-2');
  const orb3 = document.querySelector('.orb-3');

  if (orb1) orb1.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  if (orb2) orb2.style.transform = `translate(${x * -0.4}px, ${y * -0.4}px)`;
  if (orb3) orb3.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
});

// Scroll Parallax
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const sections = document.querySelectorAll('.section-bg-dynamic');

  sections.forEach((section, index) => {
    const blobs = section.querySelectorAll('.blob');
    blobs.forEach((blob, blobIndex) => {
      const speed = 0.4 + (index * 0.08);
      blob.style.transform = `translateY(${scrollY * speed}px) scale(${1 + scrollY * 0.00005})`;
    });
  });
});

// === Lógica do Livro Horizontal (Injetada dinamicamente) ===
function initHorizontalBook() {
  const wrapper = document.querySelector('.app-wrapper');
  if (!wrapper) return;

  // Força a classe do livro no wrapper
  wrapper.classList.add('horizontal-book');

  // Garante que o fundo dinâmico fique atrás de todas as páginas
  const dynamicBg = document.querySelector('.dynamic-bg');
  if (dynamicBg && dynamicBg.parentElement !== wrapper) {
    wrapper.insertBefore(dynamicBg, wrapper.firstChild);
  }

  // Transforma apenas as sections em "Páginas do Livro"
  const pages = Array.from(wrapper.querySelectorAll('section'));
  pages.forEach((page, index) => {
    page.classList.remove('vertical-page'); // Limpa caso tenha ficado no HTML
    page.classList.add('horizontal-page');

    // Remove a classe de animação antiga para não conflitar com a virada do livro
    page.classList.remove('fade-in-section', 'visible');

    if (index === 0) page.classList.add('active-page');
    else page.classList.add('next-page');

    // Mantém o parallax das bolhas de fundo funcionando dentro da rolagem de cada página
    page.addEventListener('scroll', () => {
      const scrollY = page.scrollTop;
      const sections = page.querySelectorAll('.section-bg-dynamic');
      sections.forEach((section, idx) => {
        const blobs = section.querySelectorAll('.blob');
        blobs.forEach((blob) => {
          const speed = 0.4 + (idx * 0.08);
          blob.style.transform = `translateY(${scrollY * speed}px) scale(${1 + scrollY * 0.00005})`;
        });
      });
    });
  });

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

  // Cria dinamicamente os controles de navegação na tela
  const controls = document.createElement('div');
  controls.className = 'book-controls';
  controls.innerHTML = `
    <button id="prev-page" class="book-btn" disabled title="Página Anterior">
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
    <button id="next-page" class="book-btn" title="Próxima Página">
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>
  `;
  document.body.appendChild(controls);

  const btnPrev = document.getElementById('prev-page');
  const btnNext = document.getElementById('next-page');

  function updateBook() {
    pages.forEach((page, index) => {
      page.classList.remove('active-page', 'flipped', 'next-page');
      if (index === currentPage) page.classList.add('active-page');
      else if (index < currentPage) page.classList.add('flipped');
      else page.classList.add('next-page');
    });
    btnPrev.disabled = currentPage === 0;
    btnNext.disabled = currentPage === pages.length - 1;
    triggerFades(pages[currentPage]);
  }

  btnNext.addEventListener('click', () => {
    if (currentPage < pages.length - 1) { currentPage++; pages[currentPage].scrollTop = 0; updateBook(); }
  });
  btnPrev.addEventListener('click', () => {
    if (currentPage > 0) { currentPage--; pages[currentPage].scrollTop = 0; updateBook(); }
  });

  // Lógica de "Arrastar com o dedo" (Mobile)
  let touchStartX = 0;
  document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  document.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].screenX;
    const activePage = pages[currentPage];
    if (!activePage) return;

    const threshold = 50; // Quão longo tem que ser o deslize
    if (touchEndX < touchStartX - threshold) {
      if (currentPage < pages.length - 1) {
        currentPage++; pages[currentPage].scrollTop = 0; updateBook();
      }
    } else if (touchEndX > touchStartX + threshold) {
      if (currentPage > 0) {
        currentPage--; pages[currentPage].scrollTop = 0; updateBook();
      }
    }
  }, { passive: true });

  // Lógica de "Rodinha do Mouse" (PC)
  let isScrolling = false;
  window.addEventListener('wheel', (e) => {
    if (isScrolling) return;
    const activePage = pages[currentPage];
    if (!activePage) return;

    if (e.deltaY > 0) {
      if (Math.ceil(activePage.scrollTop + activePage.clientHeight) >= activePage.scrollHeight - 5 && currentPage < pages.length - 1) {
        isScrolling = true; currentPage++; pages[currentPage].scrollTop = 0; updateBook(); setTimeout(() => isScrolling = false, 1200);
      }
    } else if (e.deltaY < 0) {
      if (activePage.scrollTop <= 5 && currentPage > 0) {
        isScrolling = true; currentPage--; pages[currentPage].scrollTop = 0; updateBook(); setTimeout(() => isScrolling = false, 1200);
      }
    }
  }, { passive: false });

  // Força atualização inicial para garantir que tudo fique no lugar correto
  updateBook();
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
  const nameParam = new URLSearchParams(window.location.search).get('name') || '';
  msg.innerHTML = '🕊️ <strong>Presença confirmada!</strong><br><br>'
    + 'Estamos muito felizes em ter você conosco neste dia especial.<br><br>'
    + `<a href="gifts/lista_presentes.html?name=${encodeURIComponent(nameParam)}" style="display:inline-block;margin-top:8px;padding:11px 24px;`
    + 'background:#2D4A3E;color:#F5EDE0;font-family:Montserrat,sans-serif;font-size:9px;font-weight:700;'
    + 'letter-spacing:0.3em;text-transform:uppercase;text-decoration:none;border-radius:4px;">🎁 Ver Lista de Presentes</a>';
}

// ── INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCountdown();
  setInterval(updateCountdown, 1000);
  handleScrollAnimation();
  onConfigChange(config);
  initHorizontalBook();

  // Guest Name Logic
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('name');
  if (guestName) {
    const el = document.getElementById('guest-greeting');
    if (el) el.textContent = `para ${guestName}`;

    const cursiveEl = document.getElementById('invite-guest-name-cursive');
    if (cursiveEl) cursiveEl.textContent = guestName;

    const giftLink = document.getElementById('gift-list-link');
    if (giftLink) giftLink.href = `gifts/lista_presentes.html?name=${encodeURIComponent(guestName)}`;
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
    if (videoOverlay) {
      videoOverlay.classList.add('hidden');
      setTimeout(() => videoOverlay.style.display = 'none', 1000);
    }
    if (videoTransition) {
      videoTransition.classList.add('visible');
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
        const ch = fullText[index - 1];
        const delay = ch === ' ' ? 60 :
          ch === ',' ? 200 :
            40 + Math.random() * 35;
        setTimeout(typeNext, delay);
      } else {
        if (sfx) { sfx.pause(); sfx.currentTime = 0; }
        phraseEl.classList.add('typing-done');
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
    if (videoTransition) {
      videoTransition.classList.remove('visible');
      videoTransition.classList.add('hidden');
      setTimeout(() => videoTransition.style.display = 'none', 1200);
    }
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
