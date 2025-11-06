
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

    const { data, error } = await supabase
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
      document.getElementById('days').innerText = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
      document.getElementById('hours').innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
      document.getElementById('minutes').innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      document.getElementById('seconds').innerText = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
    }, 1000);
  }

  function initApp() {
    const invitationText = `Deus escreveu cada linha dessa história com amor, e sua presença, <span class="highlighted-name">${nome}</span>, é uma bênção nesse novo começo — o início do nosso “felizes para sempre”.`;
    if (invitationTextEl) invitationTextEl.innerHTML = invitationText;
    if (giftListLink) {
      giftListLink.href = `gifts/lista_presentes.html?name=${encodeURIComponent(nome)}`;
    }

    const brideFather = sanitizeHTML(urlParams.get('bride_father')) || 'Pai da Noiva';
    const brideMother = sanitizeHTML(urlParams.get('bride_mother')) || 'Mãe da Noiva';
    const groomFather = sanitizeHTML(urlParams.get('groom_father')) || 'Pai do Noivo';
    const groomMother = sanitizeHTML(urlParams.get('groom_mother')) || 'Mãe da Noiva';

    if (document.getElementById('bride-father-name')) document.getElementById('bride-father-name').innerText = brideFather;
    if (document.getElementById('bride-mother-name')) document.getElementById('bride-mother-name').innerText = brideMother;
    if (document.getElementById('groom-father-name')) document.getElementById('groom-father-name').innerText = groomFather;
    if (document.getElementById('groom-mother-name')) document.getElementById('groom-mother-name').innerText = groomMother;

    const day = weddingDate.getDate();
    const month = weddingDate.toLocaleString('default', { month: 'long' });
    const year = weddingDate.getFullYear();
    const hours = weddingDate.getHours().toString().padStart(2, '0');
    const minutes = weddingDate.getMinutes().toString().padStart(2, '0');

    if (document.getElementById('wedding-day')) document.getElementById('wedding-day').innerText = day;
    if (document.getElementById('wedding-month-year')) document.getElementById('wedding-month-year').innerText = `${month} • ${year}`;
    if (document.getElementById('wedding-time')) document.getElementById('wedding-time').innerText = `${hours}:${minutes}`;

    startCountdown();
  }

  const envelopeScreen = document.getElementById('envelope-screen');
  const mainContent = document.getElementById('main-content');
  const musicBtn = document.getElementById('music-btn');
  const weddingMusic = document.getElementById('wedding-music');
  const introVideo = document.getElementById('intro-video'); // Get video element
  const openInviteBtn = document.getElementById('open-invite-btn');

  const showMainContent = () => {
    if (mainContent.style.display === 'block') return; // Evita execuções múltiplas

    if (introVideo) {
      introVideo.pause();
    }

    envelopeScreen.style.opacity = '0';
    mainContent.style.display = 'block';
    try {
      initApp();
    } catch (error) {
      console.error('Erro ao inicializar o aplicativo:', error);
    }
    // A música agora começa automaticamente, então não precisamos chamar playMusic() aqui.
    // Apenas garantimos que o som seja ativado se o usuário já interagiu.
    if (weddingMusic.muted) weddingMusic.muted = false;
    setTimeout(() => envelopeScreen.style.display = 'none', 1200);
  };

  // Verifica se o convidado é válido antes de qualquer outra coisa
  await checkGuest();

  // Quando o vídeo terminar, mostra o conteúdo principal
  introVideo.addEventListener('ended', () => {
    showMainContent();
  });

  // Se o vídeo não puder ser reproduzido, mostra o botão como alternativa
  introVideo.addEventListener('error', () => {
    console.error("Erro ao carregar o vídeo. Exibindo botão de fallback.");
    if (openInviteBtn) openInviteBtn.style.display = 'block';
  });

  // O gatilho principal agora é o clique no botão de fallback
  openInviteBtn.addEventListener('click', showMainContent);

  // Função para tocar a música automaticamente (geralmente precisa ser mudo)
  const startMusicAutomatically = () => {
    weddingMusic.muted = true; // Começa mudo para autoplay funcionar
    const playPromise = weddingMusic.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Autoplay bloqueado, aguardando interação do usuário.");
        // Se o autoplay falhar, o usuário precisará clicar no botão de música
        musicBtn.innerHTML = '▶️';
      });
    }
  };

  // Inicia a música assim que o script é carregado
  startMusicAutomatically();

  musicBtn.addEventListener('click', () => {
    if (weddingMusic.muted) {
      weddingMusic.muted = false;
      musicBtn.innerHTML = '⏸️'; // Ícone de áudio ligado
    } else {
      weddingMusic.muted = true;
      musicBtn.innerHTML = '▶️';
    }
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
    const { error } = await supabase
      .from('guests')
      .update({ status: status })
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
    }
  }
});
