const urlParams = new URLSearchParams(window.location.search);

function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

const nome = sanitizeHTML(urlParams.get('name')) || 'Convidado Especial';

const invitationText = `Deus escreveu cada linha dessa história com amor, e sua presença, <span class="highlighted-name">${nome}</span>, é uma bênção nesse novo começo — o início do nosso “felizes para sempre”.`;

const rsvpSection = document.getElementById('rsvp-section');

async function handleRsvp(status, nome, rsvpSection) {
    const { error } = await supabase
        .from('guests')
        .update({ status: status })
        .eq('name', nome);

    if (error) {
        alert('Ocorreu um erro ao registrar sua resposta. Por favor, tente novamente.');
        console.error(error);
    } else {
        rsvpSection.innerHTML = status === 'Confirmado'
            ? `<h3>Obrigado por confirmar! ❤️</h3>`
            : `<h3>Que pena! Sentiremos sua falta.</h3>`;
        if (status === 'Confirmado') {
            const giftLink = document.createElement('a');
            giftLink.id = 'gift-list-link';
            giftLink.href = `gifts/lista_presentes.html?name=${encodeURIComponent(nome)}`;
            giftLink.className = 'btn';
            giftLink.innerHTML = 'Ver Lista de Presentes 🎁';
            rsvpSection.appendChild(giftLink);
        }
    }
}

const weddingDate = new Date('2026-11-19T18:00:00');

function startCountdown() {
  const weddingTime = weddingDate.getTime();
  const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingTime - now;

      if (distance < 0) {
        clearInterval(interval);
        document.getElementById('countdown-container').innerHTML = "<h2>O grande dia chegou!</h2>";
        return;
      }
      document.getElementById('days').innerText = Math.floor(distance / (1000*60*60*24)).toString().padStart(2, '0');
      document.getElementById('hours').innerText = Math.floor((distance%(1000*60*60*24))/(1000*60*60)).toString().padStart(2, '0');
      document.getElementById('minutes').innerText = Math.floor((distance%(1000*60*60))/(1000*60)).toString().padStart(2, '0');
      document.getElementById('seconds').innerText = Math.floor((distance%(1000*60))/1000).toString().padStart(2, '0');
  }, 1000);
}


function initApp() {
    document.getElementById('invitation-text').innerHTML = invitationText; // Alterado para innerHTML
    document.getElementById('gift-list-link').href = `gifts/lista_presentes.html?name=${encodeURIComponent(nome)}`;

    const brideFather = sanitizeHTML(urlParams.get('bride_father')) || 'Pai da Noiva';
    const brideMother = sanitizeHTML(urlParams.get('bride_mother')) || 'Mãe da Noiva';
      const groomFather = sanitizeHTML(urlParams.get('groom_father')) || 'Pai do Noivo';
      const groomMother = sanitizeHTML(urlParams.get('groom_mother')) || 'Mãe do Noivo';

    document.getElementById('bride-father-name').innerText = brideFather;
    document.getElementById('bride-mother-name').innerText = brideMother;
    document.getElementById('groom-father-name').innerText = groomFather;
    document.getElementById('groom-mother-name').innerText = groomMother;

    const day = weddingDate.getDate();
    const month = weddingDate.toLocaleString('default', { month: 'long' });
    const year = weddingDate.getFullYear();
    const hours = weddingDate.getHours().toString().padStart(2, '0');
    const minutes = weddingDate.getMinutes().toString().padStart(2, '0');

    document.getElementById('wedding-day').innerText = day;
    document.getElementById('wedding-month-year').innerText = `${month} • ${year}`;
    document.getElementById('wedding-time').innerText = `${hours}:${minutes}`;

    startCountdown();
}

document.addEventListener('DOMContentLoaded', () => {

    const envelopeScreen = document.getElementById('envelope-screen');
    const mainContent = document.getElementById('main-content');
    const musicBtn = document.getElementById('music-btn');
    const weddingMusic = document.getElementById('wedding-music');
    const introVideo = document.getElementById('intro-video'); // Get video element

    let isPlaying = false;

    const playMusic = () => {
      const playPromise = weddingMusic.play();
      if (playPromise !== undefined) {
        playPromise.then(_ => {
          isPlaying = true;
          musicBtn.innerHTML = '⏸️';
        }).catch(error => {
          isPlaying = false;
          musicBtn.innerHTML = '▶️';
        });
      }
    }

    if (weddingMusic.readyState >= 4) { // HAVE_ENOUGH_DATA
        playMusic();
    } else {
        weddingMusic.addEventListener('canplaythrough', () => {
          playMusic();
        });
    }


  musicBtn.addEventListener('click', () => {
      if (isPlaying) {
          weddingMusic.pause();
          musicBtn.innerHTML = '▶️';
      } else {
          weddingMusic.play();
          musicBtn.innerHTML = '⏸️';
      }
      isPlaying = !isPlaying;
  });

  let videoEndedOrSkipped = false; // Flag para evitar execuções múltiplas

  const showMainContent = () => {
      if (videoEndedOrSkipped) return; // Impede chamadas múltiplas se já executado
      videoEndedOrSkipped = true;

      envelopeScreen.style.opacity = '0';
      mainContent.style.display = 'block';
      initApp();
      setTimeout(() => envelopeScreen.style.display = 'none', 1200);
  };

  // Escuta o evento de término do vídeo
  introVideo.addEventListener('ended', showMainContent);

  // Fallback: Se o vídeo não tocar ou demorar muito, mostra o conteúdo de qualquer forma
  setTimeout(() => {
      if (!videoEndedOrSkipped) showMainContent();
  }, 5000); // Tempo limite de 5 segundos

    document.getElementById('rsvp-confirm-btn').addEventListener('click', () => handleRsvp('Confirmado', nome, rsvpSection));
    document.getElementById('rsvp-decline-btn').addEventListener('click', () => handleRsvp('Recusado', nome, rsvpSection));
});
