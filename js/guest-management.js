(() => {
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

  window.removerConvidado = removerConvidado;
  window.adicionarConvidado = adicionarConvidado;

  window.addEventListener('DOMContentLoaded', ()=>{
    atualizarListaConvidados();
    const addGuestButton = document.getElementById('add-guest-btn');
    if (addGuestButton) {
      addGuestButton.addEventListener('click', adicionarConvidado);
    }
  });
})();
