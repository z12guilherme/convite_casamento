
// Função para sanitizar HTML e prevenir ataques XSS
function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}
document.addEventListener('DOMContentLoaded', async () => {
  // Define a data do casamento. Substitua pela data e hora reais do seu evento.
  const weddingDate = new Date('2026-11-19T18:00:00');
  const urlParams = new URLSearchParams(window.location.search);
  const nome = urlParams.get('name') ? sanitizeHTML(urlParams.get('name')) : '';

  async function checkGuest() {
    if (!nome) {
      window.location.href = 'blocked.html';
      return;
    }

    const { data, error } = await supabaseClient
      .from('guests')
      .select('name')
      .eq('name', nome);

    if (error || !data || data.length === 0) {
      console.error('Erro ao verificar convidado ou convidado não encontrado:', error);
      window.location.href = 'blocked.html';
    }
  }

  // Elementos do DOM
  const rsvpConfirmBtn = document.getElementById('rsvp-confirm-btn');
  const rsvpDeclineBtn = document.getElementById('rsvp-decline-btn');
  const giftListLink = document.getElementById('gift-list-link');
  const rsvpMessageDiv = document.getElementById('rsvp-message');
  const invitationTextEl = document.getElementById('invitation-text');

  function startCountdown() {
    const weddingTime = weddingDate.getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingTime - now;

      if (distance < 0) {
        clearInterval(interval);
        const countdownContainer = document.getElementById('countdown-container');
        if (countdownContainer) {
          countdownContainer.innerHTML = "<h2>O grande dia chegou!</h2>";
        }
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      document.getElementById('days').innerText = days.toString().padStart(2, '0');
      document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
      document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
      document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');

      // Adicionar efeito de confete quando o countdown chega a zero em alguma unidade
      if (seconds === 0) {
        createConfetti();
      }
    }, 1000);
  }

  function createConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 5 + 's';
      confettiContainer.appendChild(confetti);
    }

    setTimeout(() => {
      document.body.removeChild(confettiContainer);
    }, 5000);
  }

  function initApp() {
    const invitationText = `Deus escreveu cada linha dessa história com amor, e sua presença, <span class="highlighted-name">${nome}</span>, é uma bênção nesse novo começo — o início do nosso “felizes para sempre”.`;
    if (invitationTextEl) invitationTextEl.innerHTML = invitationText;
    if (giftListLink) {
      giftListLink.href = `gifts/lista_presentes.html?name=${encodeURIComponent(nome)}`;
    }

    if (document.getElementById('card-guest-name')) document.getElementById('card-guest-name').innerText = nome;
    
    const day = weddingDate.getDate();
    const month = weddingDate.toLocaleString('default', { month: 'long' });
    const year = weddingDate.getFullYear();
    const dayOfWeek = weddingDate.toLocaleString('pt-BR', { weekday: 'long' });
    const hours = weddingDate.getHours().toString().padStart(2, '0');
    const minutes = weddingDate.getMinutes().toString().padStart(2, '0');

    // Preenche os dados no novo cartão de RSVP
    if (document.getElementById('wedding-day')) document.getElementById('wedding-day').innerText = day.toString().padStart(2, '0');
    if (document.getElementById('wedding-month')) document.getElementById('wedding-month').innerText = month;
    if (document.getElementById('wedding-year')) document.getElementById('wedding-year').innerText = year;
    if (document.getElementById('wedding-day-of-week')) document.getElementById('wedding-day-of-week').innerText = dayOfWeek;
    if (document.getElementById('wedding-time')) document.getElementById('wedding-time').innerText = `às ${hours}h${minutes}`;

    startCountdown();
  }

  function typewriterEffect(element, text, callback) {
    let i = 0;
    element.innerHTML = ""; // Limpa o elemento
    element.setAttribute('aria-live', 'polite');
    const speed = 70; // Velocidade da digitação em milissegundos

    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        // Remove o cursor piscando ao final
        element.style.borderRight = "none";
        if (callback) {
          callback();
        }
      }
    }
    type();
  }

  // Scroll reveal: adiciona classe 'in-view' quando seção entra no viewport
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.section').forEach(sec => observer.observe(sec));

    // posiciona corações flutuantes dinamicamente
    const hearts = document.querySelectorAll('.floating-hearts .heart');
    hearts.forEach((heart, i) => {
      heart.style.left = (10 + i * 12) % 90 + '%';
      heart.style.top = (10 + (i * 17) % 80) + '%';
      heart.style.fontSize = (1.6 + (i % 3) * 0.6) + 'rem';
    });
  }
  const envelopeScreen = document.getElementById('envelope-screen');
  const mainContent = document.getElementById('main-content');
  const musicBtn = document.getElementById('music-btn');
  const weddingMusic = document.getElementById('wedding-music');
  const introVideo = document.getElementById('intro-video'); // Get video element
  const startBtn = document.getElementById('start-btn');

  const showMainContent = () => {
    if (mainContent.style.display === 'block') return; // Evita execuções múltiplas

    if (introVideo) {
      introVideo.pause();
    }

    envelopeScreen.style.opacity = '0';
    mainContent.style.display = 'block';
    try {
      initApp();
      // Inicia o efeito de digitação após a exibição do conteúdo
      const verseElement = document.getElementById('typing-verse');
      const referenceElement = document.getElementById('verse-reference');
      const verseText = '"O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha."';
      
      typewriterEffect(verseElement, verseText, () => {
        // Quando a digitação terminar, revela a referência
        verseElement.classList.remove('typing'); // Remove a classe que pode ter o cursor
        if(referenceElement) referenceElement.style.opacity = '1';
      });

      // Adicionar animações de scroll
      initScrollAnimations();
    } catch (error) {
      console.error('Erro ao inicializar o aplicativo:', error);
    }
    // Ativa o som da música, pois agora temos uma interação do usuário
    if (weddingMusic.muted) weddingMusic.muted = false;
    
    setTimeout(() => envelopeScreen.style.display = 'none', 1200);
  };

  // Verifica se o convidado é válido antes de qualquer outra coisa
  await checkGuest();

  // Evento de clique no botão inicial
  startBtn.addEventListener('click', () => {
    // Esconde o botão
    startBtn.style.display = 'none';

    // Toca o vídeo com som
    if (introVideo) {
      introVideo.muted = false;
      introVideo.play().catch(error => {
        console.error("Erro ao tentar tocar o vídeo:", error);
        // Se houver um erro ao tocar o vídeo, mostra o conteúdo principal diretamente
        showMainContent();
      });
    }

    // Toca a música de fundo com som
    if (weddingMusic) {
      weddingMusic.muted = false;
      weddingMusic.play().catch(error => console.error("Erro ao tocar a música:", error));
      if (musicBtn) musicBtn.innerHTML = '⏸️';
    }
  });

  const skipIntroBtn = document.getElementById('skip-intro');
  if (skipIntroBtn) {
    skipIntroBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showMainContent();
    });
  }

  // Quando o vídeo terminar, mostra o conteúdo principal
  introVideo.addEventListener('ended', () => {
    showMainContent();
  });

  musicBtn.addEventListener('click', () => {
    weddingMusic.muted = !weddingMusic.muted;
  });

  // Atualiza o ícone se o estado da música mudar por outros motivos
  weddingMusic.addEventListener('volumechange', () => {
    musicBtn.innerHTML = weddingMusic.muted ? '▶️' : '⏸️';
  });

  if (rsvpConfirmBtn) {
    rsvpConfirmBtn.addEventListener('click', () => handleRsvp('Confirmado', nome));
  }
  if (rsvpDeclineBtn) {
    rsvpDeclineBtn.addEventListener('click', () => handleRsvp('Recusado', nome));
  }

  async function handleRsvp(status, nome) {
    const updateData = { status: status };

    // Se o convidado confirmou, coleta os dados sobre os filhos
    if (status === 'Confirmado') {
      const bringingChildren = document.querySelector('input[name="bringing_children"]:checked').value;
      updateData.bringing_children = bringingChildren === 'yes';

      if (bringingChildren === 'yes') {
        updateData.children_count = parseInt(document.getElementById('children_count').value, 10) || 0;
        updateData.children_ages = document.getElementById('children_ages').value || '';
      } else {
        updateData.children_count = 0;
        updateData.children_ages = '';
      }
    }

    const { error } = await supabaseClient
      .from('guests')
      .update(updateData)
      .eq('name', nome);

    if (error) {
      alert('Ocorreu um erro ao registrar sua resposta. Por favor, tente novamente.');
      console.error(error);
    } else {
      if (rsvpConfirmBtn) rsvpConfirmBtn.style.display = 'none';
      if (rsvpDeclineBtn) rsvpDeclineBtn.style.display = 'none';

      if (rsvpMessageDiv) {
        rsvpMessageDiv.innerHTML = status === 'Confirmado'
          ? `<h3>Obrigado por confirmar! ❤️</h3>`
          : `<h3>Que pena! Sentiremos sua falta.</h3>`;
      }

      if (giftListLink) {
        if (status === 'Confirmado') {
          giftListLink.style.display = 'block'; // Mostra o link da lista de presentes
        } else {
          giftListLink.style.display = 'none'; // Esconde o link se recusado
        }
      }

      // triggers confetti and subtle celebration animation when confirmed
      if (status === 'Confirmado') {
        createConfetti();
        if (rsvpMessageDiv) rsvpMessageDiv.classList.add('celebrate');
        setTimeout(() => rsvpMessageDiv.classList.remove('celebrate'), 4000);
      }
    }
  }
});
