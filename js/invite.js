  const urlParams = new URLSearchParams(window.location.search);

  function sanitizeHTML(str) {
      const temp = document.createElement('div');
      temp.textContent = str;
      return temp.innerHTML;
  }

  const nome = sanitizeHTML(urlParams.get('name')) || 'Convidado Especial';
  
  const invitationText = `Sua presença é o presente mais precioso. Por isso, convidamos você, ${nome}, para testemunhar o início do nosso "felizes para sempre".`;

  const rsvpSection = document.getElementById('rsvp-section');

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

  async function handleRsvp(status) {
      if (!supabase) return alert('Erro de conexão. Tente novamente.');
      const { error } = await supabase
          .from('guests')
          .update({ status: status })
          .eq('name', nome);

      if (error) {
          alert('Ocorreu um erro ao confirmar. Tente novamente.');
          console.error(error);
      } else {
          rsvpSection.innerHTML = status === 'Confirmado'
              ? `<h3>Obrigado por confirmar! ❤️</h3><a id="gift-list-link" href="#" class="btn">Ver Lista de Presentes 🎁</a>`
              : `<h3>Que pena! Sentiremos sua falta.</h3>`;
          document.getElementById('gift-list-link').href = `gifts/lista_presentes.html?name=${encodeURIComponent(nome)}`;
      }
  }

  function initApp() {
      document.getElementById('guest-name-display').innerText = nome;
      document.getElementById('invitation-text').innerText = invitationText;
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

      document.getElementById('wedding-day').innerText = day;
      document.getElementById('wedding-month-year').innerText = `${month} • ${year}`;

      startCountdown();
  }

  function createConfetti() {
      const confettiContainer = document.querySelector('.confetti-container');
      if (!confettiContainer) return;
      for (let i = 0; i < 100; i++) {
          const confetti = document.createElement('div');
          confetti.className = 'confetti';
          confetti.style.left = `${Math.random() * 100}%`;
          confetti.style.animationDelay = `${Math.random() * -3}s`;
          const size = Math.random() * 8 + 4;
          confetti.style.width = `${size}px`;
          confetti.style.height = `${size}px`;
          const xEnd = Math.random() * 200 - 100;
          confetti.style.setProperty('--x-end', `${xEnd}px`);
          confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
          confettiContainer.appendChild(confetti);
      }
  }

  document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('envelope-guest-name').innerText = `Para: ${nome}`;
      const envelopeScreen = document.getElementById('envelope-screen');
      const mainContent = document.getElementById('main-content');
      const musicBtn = document.getElementById('music-btn');
      const weddingMusic = document.getElementById('wedding-music');

      let isPlaying = false;

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

      envelopeScreen.addEventListener('click', () => {
          envelopeScreen.classList.add('opened');
          document.getElementById('envelope-guest-name').style.opacity = '0'; // Esconde o nome do convidado
          createConfetti();
          weddingMusic.play();
          isPlaying = true;
          musicBtn.innerHTML = '⏸️';
          setTimeout(() => {
              envelopeScreen.style.opacity = '0';
              mainContent.style.display = 'block';
              initApp();
              setTimeout(() => envelopeScreen.style.display = 'none', 1200); // Aumenta o tempo para a transição de opacidade
          }, 2000); // Aumenta o tempo total para acomodar a nova animação
      }, { once: true });

      document.getElementById('rsvp-confirm-btn').addEventListener('click', () => handleRsvp('Confirmado'));
      document.getElementById('rsvp-decline-btn').addEventListener('click', () => handleRsvp('Recusado'));
  });
