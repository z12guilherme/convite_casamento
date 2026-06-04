document.addEventListener('DOMContentLoaded', () => {
  // ── NOME DO PADRINHO (URL) ────────────────────────────
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('name');
  if (guestName) {
    const greetingIntro = document.getElementById('guest-greeting-intro');
    const padrinhoName = document.getElementById('padrinho-name');

    if (greetingIntro) {
      greetingIntro.textContent = `para ${guestName}`;
    }
    if (padrinhoName) {
      padrinhoName.textContent = guestName;
    }
  }

  // ── INTRO ──────────────────────────────────────────────
  const intro = document.getElementById('intro');
  const openBtn = document.getElementById('open-btn');
  const musicBtn = document.getElementById('music-btn');
  const bgm = document.getElementById('bgm');

  // Gerar partículas de poeira dourada no intro
  const introDust = document.getElementById('intro-dust');
  if (introDust) {
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.className = 'intro-dust-particle';
      const size = Math.random() * 4 + 1;
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${100 + Math.random() * 20}%;
        width: ${size}px;
        height: ${size}px;
        animation-duration: ${4 + Math.random() * 6}s;
        animation-delay: ${Math.random() * 5}s;
        background: ${Math.random() > 0.5 ? '#D4AF37' : '#E8D69A'};
      `;
      introDust.appendChild(p);
    }
  }

  // Gerar partículas na seção de Honra
  const honorParticles = document.getElementById('honor-particles');
  if (honorParticles) {
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'spark';
      const size = Math.random() * 3 + 1;
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${100 + Math.random() * 20}%;
        width: ${size}px;
        height: ${size}px;
        animation-duration: ${6 + Math.random() * 8}s;
        animation-delay: ${Math.random() * 6}s;
      `;
      honorParticles.appendChild(p);
    }
  }

  openBtn.addEventListener('click', () => {
    intro.classList.add('hidden');
    musicBtn.classList.add('visible');
    // Tenta tocar música
    bgm.play().catch(() => { console.log('Autoplay blocked'); });
    setTimeout(() => { intro.style.display = 'none'; }, 1300);
  });

  // Music toggle
  let playing = false;
  musicBtn.addEventListener('click', () => {
    if (playing) { bgm.pause(); musicBtn.textContent = '♪'; }
    else { bgm.play().catch(() => { }); musicBtn.textContent = '♬'; }
    playing = !playing;
  });
  bgm.addEventListener('play', () => { playing = true; musicBtn.textContent = '♬'; });

  // ── COUNTDOWN ─────────────────────────────────────────
  function updateCountdown() {
    const target = new Date('2026-11-07T16:00:00'); // Atualizado para 07 de novembro de 2026
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
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ── FADE SECTIONS ─────────────────────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-section').forEach(el => observer.observe(el));

});

// ── RSVP ──────────────────────────────────────────────
async function handleRsvp() {
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get('name');
  if (!name) {
    alert('Nome do padrinho não identificado na URL.');
    return;
  }

  const attendRadio = document.querySelector('[name="attend"]:checked');
  if (attendRadio && attendRadio.value === 'no') {
    return handleDecline();
  }

  const status = 'Confirmado';
  const updateData = { status };

  try {
    // Supõe que supabaseClient está disponível globalmente através do main.js
    if (typeof supabaseClient !== 'undefined') {
      const { error } = await supabaseClient.from('guests').update(updateData).eq('name', name);
      if (error) throw error;
    }

    showSuccessMessage();
  } catch (error) {
    console.error('Erro ao confirmar:', error);
    // Fallback visual mesmo se o supabase falhar, para UX
    showSuccessMessage();
  }
}

async function handleDecline() {
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get('name');

  if (name && typeof supabaseClient !== 'undefined') {
    try {
      await supabaseClient.from('guests').update({ status: 'Recusado' }).eq('name', name);
    } catch (e) {
      console.error('Erro ao declinar:', e);
    }
  }

  const form = document.getElementById('rsvp-form-inner');
  const msg = document.getElementById('rsvp-message');
  if (form) form.style.display = 'none';
  if (msg) {
    msg.style.display = 'block';
    msg.innerHTML = `<p style="font-size:18px;line-height:1.7;font-style:italic;color:#5C524B;">Sentiremos muito a sua falta. Obrigado pelo carinho e por nos avisar! 💛</p>`;
  }
}

function showSuccessMessage() {
  const form = document.getElementById('rsvp-form-inner');
  const msg = document.getElementById('rsvp-message');

  if (form) form.style.display = 'none';
  if (msg) {
    msg.style.display = 'block';
    let text = '✨ <strong>O "SIM" de vocês nos transborda de alegria!</strong><br><br>';
    text += 'Ter vocês como nossos padrinhos é a confirmação de que Deus cuida de cada detalhe da nossa caminhada. Mal podemos esperar para vivermos esse sonho juntos! ✨';
    text += '<br><br><a href="gifts/lista_presentes.html" style="display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:12px 28px;background:#8FD5CC;color:#5C524B;font-family:Montserrat,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;text-decoration:none;transition:transform 0.2s,box-shadow 0.2s;border-radius:50px;">🎁 Ver Lista de Presentes</a>';
    msg.innerHTML = `<p style="font-size:18px;line-height:1.7;font-style:italic;color:#5C524B;">${text}</p>`;
  }

  // Trigger Confetti se disponível
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 200,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#8FD5CC', '#E7D6CC', '#D8B67A', '#FFFFFF'] // Paleta Luxo Pinterest
    });
  }
}
