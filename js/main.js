// Template HTML embedded
const templateContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nosso Casamento 💍 - Marcos e Evellyn</title>
    <link href="https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <style>
        body { box-sizing: border-box; font-family: 'Poppins', sans-serif; background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f9fafb 100%); min-height: 100vh; color: #374151; text-align: center; padding: 0 1rem; }
        * { margin:0; padding:0; box-sizing: inherit; }
        .invitation-content { background: linear-gradient(135deg, #fdf2f8, #fce7f3); padding: 3rem; border-radius: 25px; max-width: 600px; width: 100%; text-align: center; border: 2px solid rgba(236,72,153,0.2); margin: 100px auto; }
        .invitation-title { font-family: 'Great Vibes', cursive; font-size: 3rem; color: #ec4899; margin-bottom: 2rem; }
        .invitation-message { font-size: 1.1rem; line-height: 1.8; color: #374151; margin-bottom: 2rem; }
        .invitation-names { font-family: 'Great Vibes', cursive; font-size: 2rem; color: #ec4899; margin: 1rem 0; }
        .invitation-decorations { font-size: 2rem; margin: 1rem 0; opacity: 0.7; }
    </style>
</head>
<body>

    <div class="invitation-content">
        <h2 class="invitation-title">Convite Especial</h2>
        <div class="invitation-decorations">🌸 💕 🌸</div>
        <p class="invitation-message">Querido(a) {{NOME_CONVIDADO}}, nós, Marcos e Evellyn, ficaríamos muito felizes em contar com sua presença neste momento tão especial. Sua presença tornará nosso dia ainda mais memorável e cheio de alegria.</p>
        <div class="invitation-names">Marcos e Evellyn</div>
        <div class="invitation-decorations">💍 ✨ 💍</div>
        <button onclick="confirmarConvite()" style="padding: 10px 20px; background: #ec4899; color: white; border: none; border-radius: 10px; cursor: pointer; margin-top: 2rem;">Confirmar Convite</button>
    </div>
    <script>
        function confirmarConvite() {
            window.location.href = 'gifts/lista_presentes.html';
        }
    </script>
</body>
</html>`;

// Atualiza a lista de convidados na tela
function atualizarLista() {
    const convidados = JSON.parse(localStorage.getItem('convidados') || '[]');
    const lista = document.getElementById('listaConvidados');
    lista.innerHTML = '';
    convidados.forEach(c => {
        const li = document.createElement('li');
        li.innerHTML = `${c.nome}
            <a href="invite.html?name=${encodeURIComponent(c.nome)}" target="_blank">Ver Convite</a>
            <button onclick="removerConvidado('${c.nome}')">Excluir</button>`;
        lista.appendChild(li);
    });
}

// Adiciona um novo convidado
function adicionarConvidado() {
    const nome = document.getElementById('nome').value.trim();
    if (!nome) return alert('Preencha o nome!');

    const convidados = JSON.parse(localStorage.getItem('convidados') || '[]');
    const safeName = nome.toLowerCase().replace(/\s/g, '');
    if (convidados.some(c => c.nome.toLowerCase().replace(/\s/g, '') === safeName)) {
        return alert('Convidado já existe!');
    }

    // Generate HTML content
    const pageContent = templateContent.replace(/{{NOME_CONVIDADO}}/g, nome);

    // Store in localStorage
    const convites = JSON.parse(localStorage.getItem('convites') || '{}');
    convites[safeName] = pageContent;
    localStorage.setItem('convites', JSON.stringify(convites));

    convidados.push({ nome, arquivo: `${safeName}.html` });
    localStorage.setItem('convidados', JSON.stringify(convidados));

    console.log(`Convite de ${nome} gerado com sucesso.`);
    document.getElementById('nome').value = '';
    atualizarLista();
}

// Remove um convidado
function removerConvidado(nome) {
    const convidados = JSON.parse(localStorage.getItem('convidados') || '[]');
    const safeName = nome.toLowerCase().replace(/\s/g, '');
    const convites = JSON.parse(localStorage.getItem('convites') || '{}');
    delete convites[safeName];
    localStorage.setItem('convites', JSON.stringify(convites));

    const updated = convidados.filter(c => c.nome !== nome);
    localStorage.setItem('convidados', JSON.stringify(updated));

    console.log(`Convidado ${nome} removido.`);
    atualizarLista();
}

// Inicializa lista ao carregar a página
window.onload = atualizarLista;
