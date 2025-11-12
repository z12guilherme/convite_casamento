const availableBody = document.getElementById('available-gifts');
const confirmedBody = document.getElementById('confirmed-gifts');
const addGiftForm = document.getElementById('add-gift-form');

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

  if(isConfirmed){
    tr.innerHTML += `<td>${gift.taken_by}</td>
                     <td>${nameHTML}</td>
                     <td>${new Date(gift.confirmed_at).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}</td>
                     <td><button class="btn">Liberar</button></td>`;
    tr.querySelector('.btn').onclick = async () => {
      if(!confirm(`Deseja liberar "${gift.name}"?`)) return;
      const { error } = await supabase.from('gifts').update({taken_by:null,confirmed_at:null}).eq('id',gift.id);
      if(error) return alert('Erro: '+error.message);
      loadAvailableGifts();
      loadConfirmedGifts();
    };
  } else {
    tr.innerHTML += `<td>${nameHTML}</td>
                     <td><button class="btn">Excluir</button></td>`;
    tr.querySelector('.btn').onclick = async () => {
      if(!confirm(`Deseja excluir "${gift.name}"?`)) return;
      const { error } = await supabase.from('gifts').delete().eq('id', gift.id);
      if(error) return alert('Erro: ' + error.message);
      loadAvailableGifts();
    };
  }

  return tr;
}

async function loadAvailableGifts(){
  const { data, error } = await supabase.from('gifts').select('*').is('taken_by', null).order('name');
  if(error){ console.error(error); availableBody.innerHTML='<tr><td colspan="3">Erro ao carregar</td></tr>'; return; }
  availableBody.innerHTML='';
  if(!data.length){ availableBody.innerHTML='<tr><td colspan="3">Nenhum presente disponível</td></tr>'; return; }
  data.forEach(gift => availableBody.appendChild(createGiftRow(gift)));
}

async function loadConfirmedGifts(){
  const { data, error } = await supabase.from('gifts').select('*').not('taken_by','is',null).order('confirmed_at',{ascending:true});
  if(error){ console.error(error); confirmedBody.innerHTML='<tr><td colspan="5">Erro ao carregar</td></tr>'; return; }
  confirmedBody.innerHTML='';
  if(!data.length){ confirmedBody.innerHTML='<tr><td colspan="5">Nenhum presente confirmado</td></tr>'; return; }
  data.forEach(gift => confirmedBody.appendChild(createGiftRow(gift,true)));
}

addGiftForm.onsubmit = async e => {
  e.preventDefault();
  const name = document.getElementById('gift-name').value.trim();
  const productUrl = document.getElementById('gift-link').value.trim();
  const file = document.getElementById('gift-image').files[0];
  if(!name || !file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Image = reader.result;
    const { error } = await supabase.from('gifts').insert([{ name, image: base64Image, product_url: productUrl }]);
    if(error) return alert('Erro: ' + error.message);
    document.getElementById('gift-name').value='';
    document.getElementById('gift-link').value='';
    document.getElementById('gift-image').value='';
    loadAvailableGifts();
  };
  reader.readAsDataURL(file);
};

// Atualização em tempo real
supabase.channel('public:gifts')
  .on('postgres_changes', { event:'*', schema:'public', table:'gifts' }, () => {
    loadAvailableGifts();
    loadConfirmedGifts();
  }).subscribe();

window.addEventListener('DOMContentLoaded', () => {
  loadAvailableGifts();
  loadConfirmedGifts();
});