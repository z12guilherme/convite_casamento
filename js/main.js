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
        body {
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #f0f5ff 100%);
            min-height: 100vh;
            color: #0b1e4a;
            text-align: center;
            padding: 0 1rem;
            overflow-x: hidden;
        }
        * {
            margin:0;
            padding:0;
            box-sizing: inherit;
        }
        .envelope {
            position: relative;
            width: 600px;
            max-width: 90vw;
            margin: 100px auto;
            perspective: 1500px;
        }
        .envelope-front {
            background-color: #0b1e4a;
            border-radius: 15px;
            padding: 2rem;
            color: white;
            font-family: 'Great Vibes', cursive;
            font-size: 2.5rem;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(11,30,74,0.5);
            user-select: none;
            position: relative;
            z-index: 10;
            transition: transform 1s ease;
        }
        .envelope-front::before {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            border-radius: 15px;
            z-index: -1;
        }
        .invitation-content {
            background: white;
            border-radius: 15px;
            padding: 3rem;
            box-shadow: 0 10px 30px rgba(11,30,74,0.2);
            color: #0b1e4a;
            font-family: 'Poppins', sans-serif;
            text-align: center;
            transform-style: preserve-3d;
            backface-visibility: hidden;
            max-width: 600px;
            margin: 0 auto;
        }
        .invitation-title {
            font-family: 'Great Vibes', cursive;
            font-size: 3rem;
            color: #0b1e4a;
            margin-bottom: 1rem;
        }
        .invitation-message {
            font-size: 1.1rem;
            line-height: 1.8;
            color: #374151;
            margin-bottom: 2rem;
        }
        .invitation-names {
            font-family: 'Great Vibes', cursive;
            font-size: 2rem;
            color: #0b1e4a;
            margin: 1rem 0;
        }
        .invitation-decorations {
            font-size: 2rem;
            margin: 1rem 0;
            opacity: 0.7;
        }
        .tear-animation {
            animation: tearOpen 1.5s forwards;
            transform-origin: top center;
        }
        @keyframes tearOpen {
            0% {
                transform: rotateX(0deg);
                opacity: 1;
            }
            100% {
                transform: rotateX(-90deg);
                opacity: 0;
            }
        }
        button.confirm-btn {
            padding: 10px 20px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            margin-top: 2rem;
            font-weight: 600;
            font-size: 1rem;
            transition: background-color 0.3s ease;
        }
        button.confirm-btn:hover {
            background-color: #2563eb;
        }
    </style>
</head>
<body>

    <div class="envelope" id="envelope">
        <div class="envelope-front" id="envelopeFront">Convite Especial</div>
        <div class="invitation-content" id="invitationContent" style="display:none;">
            <h2 class="invitation-title">Marcos & Evellyn</h2>
            <div class="invitation-decorations">💐</div>
            <p class="invitation-message">Querido(a) {{NOME_CONVIDADO}}, nós, Marcos e Evellyn, ficaríamos muito felizes em contar com sua presença neste momento tão especial. Sua presença tornará nosso dia ainda mais memorável e cheio de alegria.</p>
            <div class="invitation-names">Marcos e Evellyn</div>
            <div class="invitation-decorations">💍</div>
            <button class="confirm-btn" onclick="confirmarConvite()">Confirmar Presença</button>
        </div>
    </div>

    <script>
        const envelopeFront = document.getElementById('envelopeFront');
        const invitationContent = document.getElementById('invitationContent');
        const envelope = document.getElementById('envelope');

        envelopeFront.addEventListener('click', () => {
            envelopeFront.classList.add('tear-animation');
            setTimeout(() => {
                envelopeFront.style.display = 'none';
                invitationContent.style.display = 'block';
            }, 1500);
        });

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
