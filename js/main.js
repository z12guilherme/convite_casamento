// ================== Supabase ==================
// A configuração do Supabase foi movida para js/config.js

// ================== Convidados ==================
async function adicionarConvidado() {
  const nome = document.getElementById('nome')?.value.trim();
  if (!nome) return alert('Preencha o nome!');
  
  const { data, error } = await supabase.from('guests').select('name').eq('name', nome);
  if (error) return alert('Erro: ' + error.message);
  if (data.length > 0) return alert('Convidado já existe!');

  const { error: insertError } = await supabase.from('guests').insert({ name: nome });
  if (insertError) return alert('Erro ao adicionar: ' + insertError.message);

  document.getElementById('nome').value = '';
  atualizarListaConvidados();
}

async function atualizarListaConvidados() {
  const lista = document.getElementById('listaConvidados');
  if (!lista) return;

  lista.innerHTML = 'Carregando...';
  try {
    const { data, error } = await supabase.from('guests').select('*');
    if (error) throw error;

    lista.innerHTML = '';
    data.forEach(c => {
      const li = document.createElement('li');
      let statusBadge = '';
      if (c.status === 'Confirmado') {
        statusBadge = '<span style="color: green; font-weight: bold; font-size: 0.8em;">✓ Confirmado</span>';
      } else if (c.status === 'Recusado') {
        statusBadge = '<span style="color: #555; font-weight: bold; font-size: 0.8em;">✗ Recusado</span>';
      } else {
        statusBadge = '<span style="color: grey; font-size: 0.8em;">? Pendente</span>';
      }

      // Constrói a URL completa do convite
      // Gera a URL absoluta, que funciona tanto localmente (file://) quanto online (https://)
      const currentUrl = new URL(window.location.href);
      currentUrl.pathname = currentUrl.pathname.replace(/[^/]*$/, 'invite.html'); // Substitui o nome do arquivo atual por 'invite.html'
      currentUrl.search = `?name=${encodeURIComponent(c.name)}`;
      const inviteUrl = currentUrl.href;

      li.innerHTML = `
        <span>${c.name} ${statusBadge}</span>
        <div style="display: flex; flex-direction: column; align-items: flex-start;">
            <a href="${inviteUrl}" target="_blank">Ver Convite</a>
            <span style="font-size: 0.7em; color: #888; word-break: break-all;">${inviteUrl}</span>
        </div>
        <a href="#" class="delete-btn" onclick="removerConvidado('${c.name}')">Excluir</a>
      `;
      lista.appendChild(li);
    });
  } catch (err) {
    lista.textContent = 'Erro ao carregar convidados.';
    console.error(err);
  }
}

async function removerConvidado(nome) {
  const { error } = await supabase.from('guests').delete().eq('name', nome);
  if (error) return alert('Erro: ' + error.message);
  atualizarListaConvidados();
}

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

// ================== Dashboard de Presentes ==================
const availableBody = document.getElementById('available-gifts');
const confirmedBody = document.getElementById('confirmed-gifts');

function createGiftRow(gift, isConfirmed=false){
  const tr = document.createElement('tr');

  // Imagem
  const tdImg = document.createElement('td');
  const img = document.createElement('img');
  img.className = 'gift-img';
  img.src = gift.image;
  tdImg.appendChild(img);
  tr.appendChild(tdImg);

  const nameHTML = gift.product_url ? `<a href="${gift.product_url}" target="_blank">${gift.name}</a>` : gift.name;

  if (isConfirmed) {
    tr.innerHTML += `<td>${gift.taken_by}</td>
                     <td>${nameHTML}</td>
                     <td>${new Date(gift.confirmed_at).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}</td>
                     <td><button class="release-btn">Liberar</button></td>`;
    tr.querySelector('.release-btn').onclick = async () => {
      if (!confirm(`Deseja liberar "${gift.name}"?`)) return;
      const { error } = await supabase.from('gifts').update({ taken_by: null, confirmed_at: null }).eq('id', gift.id);
      if (error) return alert('Erro: ' + error.message);
      loadAvailableGifts();
      loadConfirmedGifts();
    };
  } else {
    tr.innerHTML += `<td>${nameHTML}</td>
                     <td><button class="delete-btn">Excluir</button></td>`;
    tr.querySelector('.delete-btn').onclick = async () => {
      if (!confirm(`Deseja excluir "${gift.name}"?`)) return;
      const { error } = await supabase.from('gifts').delete().eq('id', gift.id);
      if (error) return alert('Erro: ' + error.message);
      loadAvailableGifts();
    };
  }

  return tr;
}

async function loadAvailableGifts(){
  if (!availableBody) return;
  const { data, error } = await supabase.from('gifts').select('*').is('taken_by', null);
  if (error){ console.error(error); availableBody.innerHTML='<tr><td colspan="3">Erro ao carregar</td></tr>'; return; }
  availableBody.innerHTML='';
  if(!data.length){ availableBody.innerHTML='<tr><td colspan="3">Nenhum presente disponível</td></tr>'; return; }
  data.forEach(gift => availableBody.appendChild(createGiftRow(gift)));
}

async function loadConfirmedGifts(){
  if (!confirmedBody) return;
  const { data, error } = await supabase.from('gifts').select('*').not('taken_by','is',null).order('confirmed_at',{ascending:true});
  if (error){ console.error(error); confirmedBody.innerHTML='<tr><td colspan="5">Erro ao carregar</td></tr>'; return; }
  confirmedBody.innerHTML='';
  if(!data.length){ confirmedBody.innerHTML='<tr><td colspan="5">Nenhum presente confirmado</td></tr>'; return; }
  data.forEach(gift => confirmedBody.appendChild(createGiftRow(gift,true)));
}

// Adicionar presente (dashboard)
const addGiftForm = document.getElementById('add-gift-form');
if(addGiftForm){
  addGiftForm.onsubmit = async e => {
    e.preventDefault();
    const name = document.getElementById('gift-name').value.trim();
    const productUrl = document.getElementById('gift-link').value.trim();
    const file = document.getElementById('gift-image').files[0];
    if (!name || !file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result;
      const { error } = await supabase.from('gifts').insert([{ name, image: base64Image, product_url: productUrl }]);
      if (error) return alert('Erro: ' + error.message);
      document.getElementById('gift-name').value = '';
      document.getElementById('gift-link').value = '';
      document.getElementById('gift-image').value = '';
      loadAvailableGifts();
    };
    reader.readAsDataURL(file);
  };
}

// Realtime Supabase
if(supabase.channel){
  supabase.channel('public:gifts')
    .on('postgres_changes',{event:'*',schema:'public',table:'gifts'},()=> {
      loadAvailableGifts();
      loadConfirmedGifts();
    }).subscribe();
}

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
            window.location.reload();
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

// ================== Inicialização ==================
window.addEventListener('DOMContentLoaded', ()=>{
  const guestName = new URLSearchParams(window.location.search).get('name')?.trim() || 'Convidado';

  const greeting = document.getElementById('guest-greeting');
  if (greeting) greeting.textContent = `Olá, ${guestName}!`;

  atualizarListaConvidados();
  listarPresentesPublic(guestName);
  loadAvailableGifts();
  loadConfirmedGifts();
});
