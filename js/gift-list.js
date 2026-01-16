(() => {
    // ================== Estado Global do Carrossel ==================
    // Definimos essas variáveis aqui fora para não perder a posição
    // quando a lista for recarregada pelo Supabase
    let selectedIndex = 0;
    let cellCount = 0;
    let theta = 0;
    let radius = 0;

    // Função de rotação definida fora para ser acessível globalmente no escopo
    const rotateCarousel = () => {
        const container = document.getElementById('gifts-container');
        if (!container) return;

        const angle = theta * selectedIndex * -1;
        
        // Empurra o carrossel para trás (Z negativo) e gira
        // O ternário (cellCount > 1) evita bugs visuais se tiver só 1 item
        const z = (cellCount > 1) ? -radius : 0;
        
        container.style.transform = `translateZ(${z}px) rotateY(${angle}deg)`;
    };

    // ================== Site Público ==================
    async function listarPresentesPublic(guestName) {
        const container = document.getElementById('gifts-container');
        if (!container) return;
        
        // Mostra loading apenas se estiver vazio (primeira carga)
        if (!container.hasChildNodes()) {
            container.innerHTML = '<div style="color:var(--c-primary); text-align:center;">Carregando presentes...</div>';
        }

        try {
            const { data, error } = await supabaseClient
                .from('gifts')
                .select('*')
                .order('name'); // Ordenar garante que a posição dos itens não mude aleatoriamente

            if (error) throw error;

            container.innerHTML = '';
            
            if (!data || !data.length) { 
                container.innerHTML = '<div style="text-align:center; width:100%;">Nenhum presente disponível.</div>'; 
                return; 
            }

            // ================== Criação dos Cards ==================
            data.forEach((gift, index) => {
                const card = document.createElement('div');
                // IMPORTANTE: A classe 'carousel__cell' deve ter position: absolute no CSS
                card.className = 'carousel__cell'; 

                // Conteúdo interno do Card
                const innerContent = document.createElement('div');
                innerContent.className = 'gift-card';

                // Imagem
                if (gift.image) {
                    const img = document.createElement('img');
                    img.src = gift.image;
                    img.className = 'gift-image';
                    innerContent.appendChild(img);
                }

                // Nome / Link
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
                innerContent.appendChild(nameDiv);

                // Botão de Ação
                const btn = document.createElement('button');
                btn.className = 'confirm-btn'; // Removi a classe 'btn' do bootstrap para não conflitar com estilo customizado
                
                if (gift.taken_by) {
                    btn.textContent = `Já escolhido`; // Mostra só o primeiro nome
                    btn.disabled = true;
                    btn.style.opacity = '0.6';
                    btn.style.cursor = 'not-allowed';
                    btn.style.background = '#ccc';
                } else {
                    btn.textContent = 'Presentear 🎁';
                    btn.onclick = async () => {
                        // Trava o botão para evitar cliques duplos
                        btn.disabled = true;
                        btn.textContent = 'Confirmando...';
                        
                        const { error: updateError } = await supabaseClient
                            .from('gifts')
                            .update({
                                taken_by: guestName,
                                confirmed_at: new Date().toISOString()
                            })
                            .eq('id', gift.id);

                        if (updateError) {
                            alert('Erro: ' + updateError.message);
                            btn.disabled = false;
                            btn.textContent = 'Presentear 🎁';
                        } else {
                            // Feedback Visual
                            const msgDiv = document.getElementById('confirmation-message');
                            if (msgDiv) {
                                msgDiv.innerHTML = `Obrigado, <strong>${guestName}</strong>! Você escolheu: <em>${gift.name}</em> 💖`;
                                msgDiv.style.display = 'block';
                                msgDiv.className = 'alert alert-success fade-in';
                            }
                            
                            // A atualização em tempo real (subscribe) cuidará de atualizar a lista,
                            // mas podemos forçar aqui para feedback instantâneo na UI local
                            listarPresentesPublic(guestName);
                        }
                    };
                }
                innerContent.appendChild(btn);
                
                // Adiciona o conteúdo interno à célula de posicionamento
                card.appendChild(innerContent);
                container.appendChild(card);
            });

            // ================== Lógica Matemática do Carrossel 3D ==================
            const cells = container.children;
            cellCount = cells.length;
            const cellWidth = 280; // Deve bater com a largura do CSS
            theta = 360 / cellCount;
            
            // Calcula raio + margem de respiro (40px)
            radius = Math.round((cellWidth / 2) / Math.tan(Math.PI / cellCount)) + 40;

            // Ajustes para poucos itens
            if (cellCount === 1) radius = 0; 

            // Aplica a transformação de posição inicial em cada card
            Array.from(cells).forEach((cell, i) => {
                if (cellCount > 1) {
                    cell.style.transform = `rotateY(${i * theta}deg) translateZ(${radius}px)`;
                } else {
                    cell.style.transform = 'none'; // Se só tiver 1, fica parado no meio
                }
            });

            // Aplica a rotação atual (preservando onde o usuário estava)
            rotateCarousel();

        } catch (err) {
            container.innerHTML = `<div class="alert alert-danger">Erro ao carregar lista: ${err.message}</div>`;
            console.error(err);
        }
    }

    // ================== Inicialização ==================
    window.addEventListener('DOMContentLoaded', () => {
        // Pega o nome da URL (ex: invite.html?name=Guilherme)
        const guestName = new URLSearchParams(window.location.search).get('name')?.trim() || 'Convidado';

        // Atualiza saudação
        const greeting = document.getElementById('guest-greeting');
        if (greeting) {
            // Usa HTML para permitir negrito
            greeting.innerHTML = `Olá, <strong>${guestName}</strong>! Sua presença é nosso maior presente. <br><small>Se desejar, escolha um item abaixo:</small>`;
        }

        // Carrega Lista Inicial
        listarPresentesPublic(guestName);

        // ================== Configura Botões de Navegação ==================
        // Usamos cloneNode para remover event listeners antigos e evitar duplicação
        const setupBtn = (id, direction) => {
            const oldBtn = document.getElementById(id);
            if (!oldBtn) return;
            
            const newBtn = oldBtn.cloneNode(true);
            oldBtn.parentNode.replaceChild(newBtn, oldBtn);
            
            newBtn.addEventListener('click', () => {
                selectedIndex += direction;
                rotateCarousel();
            });
        };

        setupBtn('prev-btn', -1);
        setupBtn('next-btn', 1);

        // ================== Realtime do Supabase ==================
        // Ouve mudanças no banco e atualiza a tela automaticamente
        supabaseClient.channel('public:gifts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'gifts' }, () => {
                console.log('Atualização recebida do banco...');
                listarPresentesPublic(guestName);
            })
            .subscribe();
    });
})();