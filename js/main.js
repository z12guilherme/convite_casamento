(() => {
  // ================== Convidados ==================
  async function adicionarConvidado() {
    const nome = document.getElementById('nome')?.value.trim();
    if (!nome) return alert('Preencha o nome!');
    
    const { data, error } = await supabaseClient.from('guests').select('name').eq('name', nome);
    if (error) return alert('Erro: ' + error.message);
    if (data.length > 0) return alert('Convidado já existe!');

    const { error: insertError } = await supabaseClient.from('guests').insert({ name: nome });
    if (insertError) return alert('Erro ao adicionar: ' + insertError.message);

    document.getElementById('nome').value = '';
    atualizarListaConvidados();
  }

  async function atualizarListaConvidados() {
    const lista = document.getElementById('listaConvidados');
    if (!lista) return;

    lista.innerHTML = 'Carregando...';
    try {
      const { data, error } = await supabaseClient.from('guests').select('*');
      if (error) throw error;

      lista.innerHTML = '';
      data.forEach(c => {
        const li = document.createElement('li');
        
        let guestDetailsHTML = '';
        if (c.status === 'Confirmado' && c.bringing_children) {
            const count = c.children_count || 0;
            const ages = c.children_ages || 'N/A';
            guestDetailsHTML = `<div class="guest-details">Levará ${count} criança(s) (Idades: ${ages})</div>`;
        }

        // Constrói a URL completa do convite
        // Gera a URL absoluta, que funciona tanto localmente (file://) quanto online (https://)
        const currentUrl = new URL(window.location.href);
        currentUrl.pathname = currentUrl.pathname.replace(/[^/]*$/, 'invite.html'); // Substitui o nome do arquivo atual por 'invite.html'
        currentUrl.search = `?name=${encodeURIComponent(c.name)}`;
        const inviteUrl = currentUrl.href;

        li.innerHTML = `
          <div class="guest-info">
            <span>${c.name} - <strong>${c.status || 'Pendente'}</strong></span>
            ${guestDetailsHTML}
          </div>
          <div class="guest-actions">
            <a href="${inviteUrl}" target="_blank">Ver Convite</a>
            <a href="#" class="info-btn" onclick="mostrarInfoFilhos(event, ${JSON.stringify({name: c.name, status: c.status, bringing_children: c.bringing_children, children_count: c.children_count, children_ages: c.children_ages})})">Informações</a>
            <a href="#" class="delete-btn" onclick="removerConvidado('${c.name}')">Excluir</a>
          </div>
        `;
        lista.appendChild(li);
      });
    } catch (err) {
      lista.textContent = 'Erro ao carregar convidados.';
      console.error(err);
    }
  }

  async function carregarConvidados() {
    const { data, error } = await supabaseClient.from('guests').select('*').order('name', { ascending: true });
    if (error) {
        console.error("Erro ao carregar convidados:", error);
        return;
    }

    const listaConvidados = document.getElementById('listaConvidados');
    if (!listaConvidados) return;
    listaConvidados.innerHTML = '';

    // A lógica de exibição foi movida para atualizarListaConvidados e será chamada a partir dela
    // Esta função pode ser simplificada ou integrada em `atualizarListaConvidados` no futuro.
  }

  async function removerConvidado(nome) {
    const { error } = await supabaseClient.from('guests').delete().eq('name', nome);
    if (error) return alert('Erro: ' + error.message);
    atualizarListaConvidados();
  }

  function mostrarInfoFilhos(event, convidado) {
    event.preventDefault();
    let info = `Convidado: ${convidado.name}\nStatus: ${convidado.status || 'Pendente'}\n\n`;

    if (convidado.status === 'Confirmado') {
      if (convidado.bringing_children) {
        info += `Levará filhos: Sim\n`;
        info += `Quantidade: ${convidado.children_count || 'Não informado'}\n`;
        info += `Idades: ${convidado.children_ages || 'Não informado'}`;
      } else {
        info += `Levará filhos: Não`;
      }
    } else {
      info += `A informação sobre os filhos aparecerá após a confirmação.`;
    }
    alert(info);
  }

  window.addEventListener('DOMContentLoaded', ()=>{
    atualizarListaConvidados();
    const addGuestButton = document.getElementById('add-guest-btn');
    if (addGuestButton) {
      addGuestButton.addEventListener('click', adicionarConvidado);
    }
  });

  window.adicionarConvidado = adicionarConvidado;
  window.removerConvidado = removerConvidado;
  window.mostrarInfoFilhos = mostrarInfoFilhos;
})();
