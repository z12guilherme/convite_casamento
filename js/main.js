// ================== Supabase ==================
const supabaseUrl = 'https://ccaycdgjpmffkkrpppwv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjYXljZGdqcG1mZmtrcnBwcHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDUyNTMsImV4cCI6MjA3NDgyMTI1M30.G76CIatcTs3OxwB6VyWKcbDHhE4kDBGQ0OVavQ52WhM';
const supabase = createClient(supabaseUrl, supabaseKey);

// ================== Convidados ==================

// Adiciona convidado
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

// Lista convidados
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
      li.innerHTML = `
        ${c.name} 
        <a href="invite.html?name=${encodeURIComponent(c.name)}" target="_blank">Ver Convite</a>
        <button onclick="removerConvidado('${c.name}')">Excluir</button>
      `;
      lista.appendChild(li);
    });
  } catch (err) {
    lista.textContent = 'Erro ao carregar convidados.';
    console.error(err);
  }
}

// Remove convidado
async function removerConvidado(nome) {
  const { error } = await supabase.from('guests').delete().eq('name', nome);
  if (error) return alert('Erro: ' + error.message);
  atualizarListaConvidados();
}

// ================== Presentes ==================

// Lista presentes
async function listarPresentes(guestName) {
  const container = document.getElementById('gifts-container');
  if (!container) return;

  container.innerHTML = 'Carregando presentes...';

  try {
    const { data: gifts, error } = await supabase.from('gifts').select('*').order('name');
    if (error) throw error;

    container.innerHTML = '';
    if (!gifts.length) {
      container.textContent = 'Nenhum presente disponível.';
      return;
    }

    gifts.forEach(gift => {
      const card = document.createElement('div');
      card.className = 'gift-card';

      // Imagem
      if (gift.image) {
        const img = document.createElement('img');
        img.src = gift.image;
        img.className = 'gift-image';
        card.appendChild(img);
      }

      // Nome + link
      const nameDiv = document.createElement('div');
      nameDiv.className = 'gift-name';
      if (gift.product_url) {
        const a = document.createElement('a');
        a.href = gift.product_url;
        a.target = '_blank';
        a.textContent = gift.name;
        nameDiv.appendChild(a);
      } else {
        nameDiv.textContent = gift.name;
      }
      card.appendChild(nameDiv);

      // Botão
      const btn = document.createElement('button');
      btn.className = 'confirm-btn';
      if (gift.taken_by) {
        btn.textContent = `Escolhido por ${gift.taken_by}`;
        btn.disabled = true;
      } else {
        btn.textContent = 'Confirmar Presente';
        btn.onclick = async () => {
          btn.disabled = true;
          btn.textContent = 'Confirmando...';
          const { error: updError } = await supabase.from('gifts').update({
            taken_by: guestName,
            confirmed_at: new Date().toISOString()
          }).eq('id', gift.id);
          if (updError) {
            alert('Erro ao confirmar: ' + updError.message);
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
  } catch (err) {
    container.textContent = 'Erro ao carregar presentes.';
    console.error(err);
  }
}

// ================== Inicialização ==================
window.onload = () => {
  const guestName = new URLSearchParams(window.location.search).get('name')?.trim() || 'Convidado';

  // Saudação
  const greeting = document.getElementById('guest-greeting');
  if (greeting) greeting.textContent = `Olá, ${guestName}!`;

  // Inicializa convidados e gifts
  atualizarListaConvidados();
  listarPresentes(guestName);
};
