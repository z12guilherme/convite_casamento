// Atualiza a lista de convidados na tela
function atualizarLista() {
    fetch('data/convidados.json')
        .then(res => res.json())
        .then(convidados => {
            const lista = document.getElementById('listaConvidados');
            lista.innerHTML = '';
            convidados.forEach(c => {
                const li = document.createElement('li');
                li.innerHTML = `${c.nome} 
                    <a href="invites/${c.arquivo}" target="_blank">Ver Convite</a>
                    <button onclick="removerConvidado('${c.nome}')">Excluir</button>`;
                lista.appendChild(li);
            });
        })
        .catch(err => console.error('Erro ao carregar lista:', err));
}

// Adiciona um novo convidado
function adicionarConvidado() {
    const nome = document.getElementById('nome').value.trim();
    if (!nome) return alert('Preencha o nome!');
    
    const formData = new FormData();
    formData.append('name', nome);

    fetch('php/add_guest.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            console.log(data.mensagem);
            document.getElementById('nome').value = '';
            atualizarLista();
        } else {
            alert('Erro ao gerar convite.');
        }
    })
    .catch(err => console.error('Erro ao adicionar convidado:', err));
}

// Remove um convidado
function removerConvidado(nome) {
    const formData = new FormData();
    formData.append('nome', nome);

    fetch('php/delete_guest.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            console.log(data.mensagem);
            atualizarLista();
        } else {
            alert('Erro ao remover convidado.');
        }
    })
    .catch(err => console.error('Erro ao remover:', err));
}

// Inicializa lista ao carregar a página
window.onload = atualizarLista;
