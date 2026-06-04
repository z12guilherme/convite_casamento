(() => {
  // ================== Convidados e Padrinhos ==================
  async function adicionarConvidado(tipo = 'convidado') {
    const inputId = tipo === 'padrinho' ? 'nome-padrinho' : 'nome-convidado';
    const nome = document.getElementById(inputId)?.value.trim();
    if (!nome) return showToast('Preencha o nome!', 'error');
    
    // O tipo padrão no supabase será 'convidado' se `role` for nulo. 
    // Para novos registros, definiremos o role explicitamente.
    const { data, error } = await supabaseClient.from('guests').select('name, role').eq('name', nome);
    if (error) return showToast('Erro: ' + error.message, 'error');
    if (data.length > 0) {
        // Se já existe e é do mesmo tipo
        if (data[0].role === tipo || (!data[0].role && tipo === 'convidado')) {
            return showToast('Este nome já está cadastrado!', 'info');
        } else {
             // Caso tente adicionar como padrinho mas já existe como convidado (ou vice-versa)
             // Atualiza o tipo
             const { error: updateError } = await supabaseClient.from('guests').update({ role: tipo }).eq('name', nome);
             if (updateError) return showToast('Erro ao alterar tipo: ' + updateError.message, 'error');
             showToast(`${nome} movido para a lista de ${tipo}s!`, 'success');
        }
    } else {
        const { error: insertError } = await supabaseClient.from('guests').insert({ name: nome, role: tipo });
        if (insertError) return showToast('Erro ao adicionar: ' + insertError.message, 'error');
    }

    document.getElementById(inputId).value = '';
    atualizarListaConvidados();
  }

  async function atualizarListaConvidados() {
    const listaConvidados = document.getElementById('listaConvidados');
    const listaPadrinhos = document.getElementById('listaPadrinhos');
    if (!listaConvidados || !listaPadrinhos) return;

    listaConvidados.innerHTML = 'Carregando...';
    listaPadrinhos.innerHTML = 'Carregando...';
    try {
      const { data, error } = await supabaseClient.from('guests').select('*').order('name', { ascending: true });
      if (error) throw error;

      listaConvidados.innerHTML = '';
      listaPadrinhos.innerHTML = '';
      
      data.forEach(c => {
        const li = document.createElement('li');
        
        let guestDetailsHTML = '';
        if (c.status === 'Confirmado' && c.bringing_children) {
            const count = c.children_count || 0;
            const ages = c.children_ages || 'N/A';
            guestDetailsHTML = `<div class="guest-details">Levará ${count} criança(s) (Idades: ${ages})</div>`;
        }

        // Verifica o tipo de registro (por default, se não tiver role, é convidado)
        const isPadrinho = c.role === 'padrinho';
        const pageName = isPadrinho ? 'invite_padrinhos.html' : 'invite.html';

        // Constrói a URL completa do convite
        const currentUrl = new URL(window.location.href);
        currentUrl.pathname = currentUrl.pathname.replace(/[^/]*$/, pageName); 
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
        
        if (isPadrinho) {
            listaPadrinhos.appendChild(li);
        } else {
            listaConvidados.appendChild(li);
        }
      });
      
      if (listaConvidados.children.length === 0) listaConvidados.innerHTML = '<li>Nenhum convidado adicionado ainda.</li>';
      if (listaPadrinhos.children.length === 0) listaPadrinhos.innerHTML = '<li>Nenhum padrinho adicionado ainda.</li>';

    } catch (err) {
      listaConvidados.textContent = 'Erro ao carregar convidados.';
      listaPadrinhos.textContent = 'Erro ao carregar padrinhos.';
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
    const confirmed = await showConfirm(`Tem certeza que deseja remover o convidado "<strong>${nome}</strong>"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;
    const { error } = await supabaseClient.from('guests').delete().eq('name', nome);
    if (error) return showToast('Erro: ' + error.message, 'error');
    atualizarListaConvidados();
    showToast(`Convidado "${nome}" removido.`, 'success');
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
    showToast(info.replace(/\n/g, '<br>'), 'info');
  }

  window.addEventListener('DOMContentLoaded', ()=>{
    atualizarListaConvidados();
    // Opcionalmente podemos registrar botões caso precisem de hooks globais, 
    // mas com os onclick inline do index.html isso já funciona diretamente.
  });

  window.adicionarConvidado = adicionarConvidado;
  window.removerConvidado = removerConvidado;
  window.mostrarInfoFilhos = mostrarInfoFilhos;
})();
