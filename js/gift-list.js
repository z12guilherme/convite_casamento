(() => {
  // ================== Site Público ==================
  async function listarPresentesPublic(guestName){
    const container = document.getElementById('gifts-container');
    if (!container) return;
    container.innerHTML = 'Carregando presentes...';

    try {
      const { data, error } = await supabase.from('gifts').select('*').order('name');
      if (error) throw error;
      container.innerHTML = '';
      if (!data.length) { container.textContent = 'Nenhum presente disponível.'; return; }

      data.forEach(gift => {
        const card = document.createElement('div');
        card.className = 'gift-card';

        if (gift.image) {
          const img = document.createElement('img');
          img.src = gift.image;
          img.className = 'gift-image';
          card.appendChild(img);
        }

        const nameDiv = document.createElement('div');
        nameDiv.className = 'gift-name';
        if (gift.product_url){
          const a = document.createElement('a');
          a.href = gift.product_url;
          a.target = '_blank';
          a.textContent = gift.name;
          nameDiv.appendChild(a);
        } else { nameDiv.textContent = gift.name; }
        card.appendChild(nameDiv);

        const btn = document.createElement('button');
        btn.className = 'confirm-btn';
        if (gift.taken_by){
          btn.textContent = 'Já escolhido';
          btn.disabled = true;
        } else {
          btn.textContent = 'Confirmar Presente';
          btn.onclick = async () => {
            btn.disabled = true;
            btn.textContent = 'Confirmando...';
            const { error } = await supabase.from('gifts').update({
              taken_by: guestName,
              confirmed_at: new Date().toISOString()
            }).eq('id', gift.id);
            if (error){
              alert('Erro: ' + error.message);
              btn.disabled = false;
              btn.textContent = 'Confirmar Presente';
            } else {
              alert(`Obrigado, ${guestName}! Presente confirmado 💝`);
            }
          };
        }
        card.appendChild(btn);

        container.appendChild(card);
      });
    } catch(err){
      container.textContent = 'Erro ao carregar presentes.';
      console.error(err);
    }
  }

  window.addEventListener('DOMContentLoaded', ()=>{
    const guestName = new URLSearchParams(window.location.search).get('name')?.trim() || 'Convidado';

    const greeting = document.getElementById('guest-greeting');
    if (greeting) greeting.textContent = `Olá, ${guestName}!`;

    listarPresentesPublic(guestName);

    supabase.channel('public:gifts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gifts' }, () => listarPresentesPublic(guestName))
      .subscribe();
  });
})();
