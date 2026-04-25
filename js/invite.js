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
  const weddingDate = new Date('November 19, 2026 00:00:00').getTime();
  const now = new Date().getTime();
  const distance = weddingDate - now;
  
  if (distance > 0) {
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (daysEl) daysEl.textContent = days.toString().padStart(3, '0');
    if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
    if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
    if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
  }
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

// RSVP Logic
async function handleRsvp(status) {
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get('name');
  if (!name) return showToast('Nome do convidado não identificado na URL.', 'error');

  const updateData = { status };
  
  if (status === 'Confirmado') {
    const bringingChildren = document.querySelector('input[name="bringing_children"]:checked')?.value === 'yes';
    updateData.bringing_children = bringingChildren;
    if (bringingChildren) {
      updateData.children_count = parseInt(document.getElementById('children_count').value) || 0;
      updateData.children_ages = document.getElementById('children_ages').value;
    }
  }

  const { error } = await supabaseClient.from('guests').update(updateData).eq('name', name);
  
  if (error) {
    showToast('Erro ao confirmar: ' + error.message, 'error');
  } else {
    const formContainer = document.getElementById('rsvp-form-container');
    const messageContainer = document.getElementById('rsvp-message');
    
    if (formContainer) formContainer.style.display = 'none';
    if (messageContainer) {
      messageContainer.innerHTML = status === 'Confirmado' 
        ? '<span style="color: var(--primary-action)">Presença confirmada! Obrigado! 🎉</span>'
        : 'Obrigado por responder. Sentiremos sua falta.';
      messageContainer.style.display = 'block';

      // Trigger Confetti if confirmed
      if (status === 'Confirmado' && window.confetti) {
        window.confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      // Show gift list link if confirmed
      const giftContainer = document.getElementById('gift-list-container');
      const giftLink = document.getElementById('gift-list-link');
      if (status === 'Confirmado') {
        if (giftContainer) giftContainer.style.display = 'block';
        if (giftLink) giftLink.href = `gifts/lista_presentes.html?name=${encodeURIComponent(name)}`;
      }
    }
  }
}

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

    // Remove a classe de animação antiga para não conflitar com a virada do livro e fazer os elementos "sumirem"
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
      // Arrastou para a esquerda (Avança a página)
      if (currentPage < pages.length - 1) {
        currentPage++; pages[currentPage].scrollTop = 0; updateBook();
      }
    } else if (touchEndX > touchStartX + threshold) {
      // Arrastou para a direita (Volta a página)
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
      // Para baixo
      if (Math.ceil(activePage.scrollTop + activePage.clientHeight) >= activePage.scrollHeight - 5 && currentPage < pages.length - 1) {
        isScrolling = true; currentPage++; pages[currentPage].scrollTop = 0; updateBook(); setTimeout(() => isScrolling = false, 1200);
      }
    } else if (e.deltaY < 0) {
      // Para cima
      if (activePage.scrollTop <= 5 && currentPage > 0) {
        isScrolling = true; currentPage--; pages[currentPage].scrollTop = 0; updateBook(); setTimeout(() => isScrolling = false, 1200);
      }
    }
  }, { passive: false });

  // Força atualização inicial para garantir que tudo fique no lugar correto
  updateBook();
}

// Initialize
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
    const greetingEl = document.getElementById('guest-greeting');
    if (greetingEl) greetingEl.textContent = `Olá, ${guestName}!`;
  }

  // Intro & Music Logic
  const introOverlay = document.getElementById('intro-overlay');
  const enterBtn = document.getElementById('enter-invite-btn');
  const music = document.getElementById('wedding-music');
  const musicBtn = document.getElementById('music-control');

  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      // Hide overlay
      if (introOverlay) {
        introOverlay.classList.add('hidden');
        setTimeout(() => introOverlay.remove(), 1000); // Remove do DOM após transição
      }
      
      // Play music
      if (music) {
        music.volume = 0.5;
        music.play().catch(e => console.log("Autoplay prevented:", e));
        if (musicBtn) musicBtn.classList.remove('hidden');
      }
    });
  }

  if (musicBtn && music) {
    musicBtn.addEventListener('click', () => {
      if (music.paused) {
        music.play();
        musicBtn.textContent = '🔊';
      } else {
        music.pause();
        musicBtn.textContent = '🔇';
      }
    });
  }
});
