// Default configuration
const defaultConfig = {
  bride_name: 'Evellyn',
  groom_name: 'Guilherme',
  wedding_phrase: '"Unidos pela fé, amor e graça divina"',
  bible_verse: '"O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha. Não maltrata, não procura seus interesses, não se ira facilmente, não guarda rancor. O amor não se alegra com a injustiça, mas se alegra com a verdade. Tudo sofre, tudo crê, tudo espera, tudo suporta."',
  primary_bg: '#E8F5F3',
  secondary_surface: '#ffffff',
  text_color: '#2D5A4A',
  primary_action: '#40B5A0',
  secondary_action: '#D4AF37'
};

let config = { ...defaultConfig };
let currentCarouselIndex = 0;
const totalSlides = 6;

// Create carousel dots
function createCarouselDots() {
  const dotsContainer = document.getElementById('carouselDots');
  if (!dotsContainer) return;
  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.className = `carousel-dot-3d ${i === 0 ? 'active' : ''}`;
    dot.onclick = () => goToSlide(i);
    dotsContainer.appendChild(dot);
  }
}

// Rotate carousel
function rotateCarousel(direction) {
  currentCarouselIndex = (currentCarouselIndex + direction + totalSlides) % totalSlides;
  updateCarouselPosition();
}

// Go to specific slide
function goToSlide(index) {
  currentCarouselIndex = index;
  updateCarouselPosition();
}

// Update carousel position
function updateCarouselPosition() {
  const carousel = document.getElementById('carousel3d');
  if (!carousel) return;
  const items = carousel.querySelectorAll('.carousel-item-3d');
  
  items.forEach((item, index) => {
    item.classList.remove('active', 'prev', 'next', 'far-prev', 'far-next');
    
    let position = (index - currentCarouselIndex + totalSlides) % totalSlides;
    
    if (position === 0) {
      item.classList.add('active');
    } else if (position === 1) {
      item.classList.add('next');
    } else if (position === totalSlides - 1) {
      item.classList.add('prev');
    } else if (position > 1) {
      item.classList.add('far-next');
    } else {
      item.classList.add('far-prev');
    }
  });
  
  // Update dots
  const dots = document.querySelectorAll('.carousel-dot-3d');
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentCarouselIndex);
  });
  
  // Update counter
  const counter = document.getElementById('currentSlide');
  if (counter) counter.textContent = currentCarouselIndex + 1;
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') rotateCarousel(-1);
  if (e.key === 'ArrowRight') rotateCarousel(1);
});

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
  if (!name) return alert('Nome do convidado não identificado na URL.');

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
    alert('Erro ao confirmar: ' + error.message);
  } else {
    const formContainer = document.getElementById('rsvp-form-container');
    const messageContainer = document.getElementById('rsvp-message');
    
    if (formContainer) formContainer.style.display = 'none';
    if (messageContainer) {
      messageContainer.innerHTML = status === 'Confirmado' 
        ? '<span style="color: var(--primary-action)">Presença confirmada! Obrigado! 🎉</span>'
        : 'Obrigado por responder. Sentiremos sua falta.';
      messageContainer.style.display = 'block';
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateCountdown();
  setInterval(updateCountdown, 1000);
  handleScrollAnimation();
  onConfigChange(config);
  createCarouselDots();

  // Guest Name Logic
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('name');
  if (guestName) {
    const greetingEl = document.getElementById('guest-greeting');
    if (greetingEl) greetingEl.textContent = `Olá, ${guestName}!`;
  }
});
