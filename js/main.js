// Inclua Supabase SDK no HTML antes do main.js
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// Configuração Supabase
const supabaseUrl = 'https://ccaycdgjpmffkkrpppwv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjYXljZGdqcG1mZmtrcnBwcHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDUyNTMsImV4cCI6MjA3NDgyMTI1M30.G76CIatcTs3OxwB6VyWKcbDHhE4kDBGQ0OVavQ52WhM'  // Anon public key
const supabase = createClient(supabaseUrl, supabaseKey)

// Template do convite
const templateContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nosso Casamento 💍 - Marcos e Evellyn</title>
<link href="https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
body { font-family: 'Poppins', sans-serif; background: linear-gradient(135deg, #e0e7ff, #c7d2fe); text-align: center; color:#0b1e4a; padding: 2rem; }
h1,h2 { font-family: 'Great Vibes', cursive; }
button { padding:10px 20px; background:#3b82f6; color:white; border:none; border-radius:10px; cursor:pointer; }
</style>
</head>
<body>
<h2>Marcos & Evellyn</h2>
<p>Querido(a) {{NOME_CONVIDADO}}, nós, Marcos e Evellyn, ficaríamos muito felizes em contar com sua presença neste momento tão especial.</p>
<button onclick="window.location.href='gifts/lista_presentes.html?name={{NOME_CONVIDADO}}'">Confirmar Presença</button>
</body>
</html>`;

// ================== Convidados ==================

// Adiciona convidado no Supabase
async function adicionarConvidado() {
  const nome = document.getElementById('nome').value.trim();
  if (!nome) return alert('Preencha o nome!');

  const { data, error } = await supabase.from('guests').select('name').eq('name', nome);
  if (error) return alert('Erro: ' + error.message);
  if (data.length > 0) {
    alert('Convidado já existe!');
    return;
  }

  const { error: insertError } = await supabase.from('guests').insert({ name: nome });
  if (insertError) return alert('Erro ao adicionar: ' + insertError.message);

  document.getElementById('nome').value = '';
  atualizarListaConvidados();
}

// Lista convidados do Supabase
async function atualizarListaConvidados() {
  const lista = document.getElementById('listaConvidados');
  if (!lista) return;

  lista.innerHTML = '';
  const { data, error } = await supabase.from('guests').select('*');
  if (error) return alert('Erro: ' + error.message);

  data.forEach(c => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${c.name} 
      <a href="invite.html?name=${encodeURIComponent(c.name)}" target="_blank">Ver Convite</a>
      <button onclick="removerConvidado('${c.name}')">Excluir</button>
    `;
    lista.appendChild(li);
  });
}

// Remove convidado do Supabase
async function removerConvidado(nome) {
  const { error } = await supabase.from('guests').delete().eq('name', nome);
  if (error) return alert('Erro: ' + error.message);
  atualizarListaConvidados();
}

// ================== Presentes ==================

// Lista presentes disponíveis e cria cartões
async function listarPresentes(guestName) {
  const container = document.getElementById('gifts-container');
  if (!container) return;

  container.innerHTML = '';

  const { data, error } = await supabase.from('gifts').select('*').is('taken_by', null);
  if (error) return alert('Erro: ' + error.message);
  if (!data || data.length === 0) {
    container.textContent = 'Nenhum presente disponível.';
    return;
  }

  data.forEach(gift => {
    const card = document.createElement('div');
    card.className = 'gift-card';
    card.innerHTML = `
      <div class="gift-name">${gift.name}</div>
      <button class="confirm-btn">Confirmar Presente</button>
    `;
    card.querySelector('button').onclick = () => confirmarPresente(gift.id, guestName);
    container.appendChild(card);
  });
}

// Confirma presente no Supabase
async function confirmarPresente(giftId, guestName) {
  const { data, error } = await supabase.from('gifts').select('*').eq('id', giftId);
  if (error) return alert('Erro: ' + error.message);
  if (!data || data.length === 0) return alert('Presente não encontrado!');
  const gift = data[0];
  if (gift.taken_by) return alert('Esse presente já foi confirmado por outra pessoa.');

  const { error: updateError } = await supabase.from('gifts').update({
    taken_by: guestName,
    confirmed_at: new Date().toISOString()
  }).eq('id', giftId);
  if (updateError) return alert('Erro ao confirmar: ' + updateError.message);

  const msg = document.getElementById('confirmation-message');
  if (msg) {
    msg.textContent = `Obrigado, ${guestName}! Seu presente foi confirmado 💝`;
    msg.style.display = 'block';
  }
}

// ================== Inicialização ==================

window.onload = () => {
  atualizarListaConvidados();

  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('name')?.trim() || 'Convidado';
  const greeting = document.getElementById('guest-greeting');
  if (greeting) greeting.textContent = `Olá, ${guestName}!`;

  listarPresentes(guestName);
};
