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
        let takenByText = gift.taken_by || '';
        let confirmedDateText = gift.confirmed_at ? new Date(gift.confirmed_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '';

        if (!gift.taken_by && gift.contributions && gift.contributions.length > 0) {
            const names = [...new Set(gift.contributions.map(c => c.name))];
            takenByText = 'Cotas: ' + names.join(', ');
            const lastContrib = gift.contributions[gift.contributions.length - 1];
            if (lastContrib && lastContrib.date) {
                confirmedDateText = new Date(lastContrib.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
            }
        }

        const tdGuest = document.createElement('td');
        tdGuest.textContent = takenByText;

        const tdGift = document.createElement('td');
        tdGift.innerHTML = nameHTML;

        const tdTime = document.createElement('td');
        tdTime.textContent = confirmedDateText;

        const tdAction = document.createElement('td');
        const btnAction = document.createElement('button');
        btnAction.className = 'btn';
        btnAction.textContent = 'Liberar';
        btnAction.onclick = async () => {
            const confirmed = await showConfirm(`Deseja liberar o presente "<strong>${gift.name}</strong>"? Ele voltará para a lista de disponíveis e as cotas arrecadadas (se houver) serão zeradas.`);
            if (!confirmed) return;
            const { error } = await supabaseClient.from('gifts').update({ taken_by: null, confirmed_at: null, contributions: [] }).eq('id', gift.id);
            if (error) return showToast('Erro ao liberar presente: ' + error.message, 'error');
            loadGifts();
        };
        tdAction.appendChild(btnAction);

        tr.append(tdGuest, tdGift, tdTime, tdAction);
  } else {
    let priceInfo = '';
    if (gift.price) {
        const total = (gift.contributions || []).reduce((acc, c) => acc + (c.amount || 0), 0);
        const style = total >= gift.price ? 'color:#00BCA1; font-weight:bold;' : 'color:#ccc;';
        priceInfo = `<div style="font-size:0.85rem; margin-top:4px; ${style}">Meta: R$ ${gift.price} | Arrecadado: R$ ${total}</div>`;
    }

        const tdGift = document.createElement('td');
        tdGift.innerHTML = `${nameHTML}${priceInfo}`;

        const tdAction = document.createElement('td');
        const btnAction = document.createElement('button');
        btnAction.className = 'btn';
        btnAction.textContent = 'Excluir';
        btnAction.onclick = async () => {
            const confirmed = await showConfirm(`Tem certeza que deseja excluir o presente "<strong>${gift.name}</strong>"?`);
            if (!confirmed) return;
            const { error } = await supabaseClient.from('gifts').delete().eq('id', gift.id);
            if (error) return showToast('Erro ao excluir presente: ' + error.message, 'error');
            loadGifts();
        };
        tdAction.appendChild(btnAction);

        tr.append(tdGift, tdAction);
  }

  return tr;
}

async function loadGifts() {
  const { data, error } = await supabaseClient.from('gifts').select('*').order('name');
  if(error){ 
      console.error(error); 
      availableBody.innerHTML='<tr><td colspan="3">Erro ao carregar</td></tr>'; 
      confirmedBody.innerHTML='<tr><td colspan="5">Erro ao carregar</td></tr>'; 
      return; 
  }
  
  availableBody.innerHTML='';
  confirmedBody.innerHTML='';
  
  let hasAvailable = false;
  let hasConfirmed = false;
  
  data.forEach(gift => {
      let total = 0;
      if (gift.price) {
          total = (gift.contributions || []).reduce((acc, c) => acc + (c.amount || 0), 0);
      }
      
      const isFullyTaken = gift.taken_by !== null || (gift.price && total >= gift.price);
      
      if (isFullyTaken) {
          confirmedBody.appendChild(createGiftRow(gift, true));
          hasConfirmed = true;
      } else {
          availableBody.appendChild(createGiftRow(gift, false));
          hasAvailable = true;
      }
  });
  
  if(!hasAvailable) availableBody.innerHTML='<tr><td colspan="3">Nenhum presente disponível</td></tr>';
  if(!hasConfirmed) confirmedBody.innerHTML='<tr><td colspan="5">Nenhum presente confirmado</td></tr>';
}

addGiftForm.onsubmit = async e => {
  e.preventDefault();
  const name = document.getElementById('gift-name').value.trim();
  const productUrl = document.getElementById('gift-link').value.trim();
  const price = document.getElementById('gift-price')?.value || null; // Captura o preço se existir o input
  const file = document.getElementById('gift-image').files[0];
  if(!name || !file) return showToast('O nome e a imagem do presente são obrigatórios.', 'error');

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Image = reader.result;
    const { error } = await supabaseClient.from('gifts').insert([{ name, image: base64Image, product_url: productUrl, price: price ? parseFloat(price) : null }]);
    if(error) return showToast('Erro ao adicionar presente: ' + error.message, 'error');
    showToast(`Presente "${name}" adicionado!`, 'success');
    document.getElementById('gift-name').value='';
    document.getElementById('gift-link').value='';
    if(document.getElementById('gift-price')) document.getElementById('gift-price').value='';
    document.getElementById('gift-image').value='';
    loadGifts();
  };
  reader.readAsDataURL(file);
};

// Atualização em tempo real
supabaseClient.channel('public:gifts')
  .on('postgres_changes', { event:'*', schema:'public', table:'gifts' }, () => {
    loadGifts();
  }).subscribe();

window.addEventListener('DOMContentLoaded', () => {
  loadGifts();
});