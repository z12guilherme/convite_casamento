(function() {
    // CONFIGURAÇÃO DO PIX
    const PIX_KEY = "81989035561"; 

    // ================== Site Público ==================
    async function listarPresentesPublic(guestName) {
        const container = document.getElementById('gifts-container');
        if (!container) return;
        
        // Mostra loading apenas se estiver vazio (primeira carga)
        if (!container.hasChildNodes()) {
            container.innerHTML = '<div style="color:var(--c-primary); text-align:center; width: 100%;">Carregando presentes...</div>';
        }

        try {
            const { data, error } = await supabaseClient
                .from('gifts')
                .select('*')
                .order('name');

            if (error) throw error;

            container.innerHTML = ''; // Limpa o loading
            
            if (!data || !data.length) { 
                container.innerHTML = '<div style="text-align:center; width:100%;">Nenhum presente disponível.</div>'; 
                return; 
            }

            // ================== Criação dos Cards ==================
            data.forEach((gift) => {
                const card = document.createElement('div');
                card.className = 'gift-item'; 

                const innerContent = document.createElement('div');
                innerContent.className = 'gift-card';

                if (gift.image) {
                    const img = document.createElement('img');
                    img.src = gift.image;
                    img.className = 'gift-image';
                    innerContent.appendChild(img);
                }

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

                const btn = document.createElement('button');
                btn.className = 'confirm-btn';
                
                // Lógica de Cotas vs Presente Único
                let isFullyTaken = false;
                let totalContributed = 0;

                // Calcula total arrecadado se houver contribuições
                if (gift.contributions && Array.isArray(gift.contributions)) {
                    totalContributed = gift.contributions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
                }

                // Verifica se está completo (seja por taken_by antigo ou preço atingido)
                if (gift.taken_by || (gift.price && totalContributed >= gift.price)) {
                    isFullyTaken = true;
                }

                // Renderiza Barra de Progresso se tiver preço
                if (gift.price && !isFullyTaken) {
                    const progressContainer = document.createElement('div');
                    progressContainer.style.cssText = "padding: 0 20px 10px; width: 100%;";
                    
                    const percent = Math.min(100, (totalContributed / gift.price) * 100);
                    const remaining = gift.price - totalContributed;

                    progressContainer.innerHTML = `
                        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:5px; color:var(--c-text-light);">
                            <span>Arrecadado: R$ ${totalContributed.toFixed(2)}</span>
                            <span>Meta: R$ ${gift.price.toFixed(2)}</span>
                        </div>
                        <div style="background:#e0e0e0; border-radius:10px; height:8px; width:100%; overflow:hidden;">
                            <div style="background:var(--c-gold); width:${percent}%; height:100%; transition: width 0.5s ease;"></div>
                        </div>
                        <div style="text-align:center; font-size:0.85rem; margin-top:5px; color:var(--c-primary);">
                            Falta: <strong>R$ ${remaining.toFixed(2)}</strong>
                        </div>
                    `;
                    innerContent.insertBefore(progressContainer, innerContent.lastChild); // Insere antes do botão (que ainda não foi adicionado no DOM, então append no innerContent funciona melhor depois)
                    innerContent.appendChild(progressContainer);
                }

                if (isFullyTaken) {
                    btn.innerHTML = `<i class="bi bi-heart-fill me-2"></i> Presenteado`; 
                    btn.disabled = true;
                    btn.style.opacity = '0.8';
                    btn.style.cursor = 'not-allowed';
                    btn.style.background = 'linear-gradient(45deg, #6c757d, #495057)';
                } else {
                    btn.textContent = gift.price ? 'Contribuir (Pix) 💸' : 'Presentear 🎁';
                    btn.onclick = async () => {
                        // Se tiver preço, pergunta o valor
                        let contributionAmount = 0;
                        if (gift.price) {
                            const remaining = gift.price - totalContributed;
                            const inputVal = prompt(`O valor total é R$ ${gift.price}. Quanto deseja contribuir?\n(Máximo restante: R$ ${remaining})`, remaining);
                            if (!inputVal) return; // Cancelou
                            
                            contributionAmount = parseFloat(inputVal.replace(',', '.'));
                            if (isNaN(contributionAmount) || contributionAmount <= 0) return alert("Valor inválido.");
                            if (contributionAmount > remaining + 1) return alert("O valor excede o restante do presente."); // +1 margem de erro float
                        }

                        // Confirmação do Pix
                        const confirmMsg = gift.price 
                            ? `Para confirmar sua contribuição de R$ ${contributionAmount.toFixed(2)}, faça um PIX para:\n\nChave: ${PIX_KEY}\n\nApós fazer o PIX, clique em OK para registrar no site.`
                            : `Você confirma que irá presentear este item?`;

                        if (!confirm(confirmMsg)) return;

                        btn.disabled = true;
                        btn.textContent = 'Registrando...';
                        
                        // Prepara atualização
                        const updatePayload = {};
                        if (gift.price) {
                            const newContributions = [...(gift.contributions || []), {
                                name: guestName,
                                amount: contributionAmount,
                                date: new Date().toISOString()
                            }];
                            updatePayload.contributions = newContributions;
                        } else {
                            updatePayload.taken_by = guestName;
                            updatePayload.confirmed_at = new Date().toISOString();
                        }

                        const { error: updateError } = await supabaseClient
                            .from('gifts')
                            .update(updatePayload)
                            .eq('id', gift.id);

                        if (updateError) {
                            alert('Erro: ' + updateError.message);
                            btn.disabled = false;
                            btn.textContent = gift.price ? 'Contribuir (Pix) 💸' : 'Presentear 🎁';
                        } else {
                            const msgDiv = document.getElementById('confirmation-message');
                            if (msgDiv) {
                                msgDiv.innerHTML = `Obrigado, <strong>${guestName}</strong>! Você escolheu: <em>${gift.name}</em> 💖`;
                                msgDiv.style.display = 'block';
                                msgDiv.className = 'alert alert-success fade-in';
                            }
                            listarPresentesPublic(guestName);
                        }
                    };
                }
                innerContent.appendChild(btn);
                card.appendChild(innerContent);
                container.appendChild(card);
            });

        } catch (err) {
            container.innerHTML = `<div class="alert alert-danger">Erro ao carregar lista: ${err.message}</div>`;
            console.error(err);
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        const guestName = new URLSearchParams(window.location.search).get('name')?.trim() || 'Convidado';
        const greeting = document.getElementById('guest-greeting');
        if (greeting) {
            greeting.innerHTML = `Olá, <strong>${guestName}</strong>! Sua presença é nosso maior presente. <br><small>Se desejar, escolha um item abaixo:</small>`;
        }
        listarPresentesPublic(guestName);
        supabaseClient.channel('public:gifts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'gifts' }, () => {
                listarPresentesPublic(guestName);
            })
            .subscribe();

        // ================== Lógica de Busca ==================
        const searchInput = document.getElementById('gift-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const items = document.querySelectorAll('.gift-item');
                
                items.forEach(item => {
                    const name = item.querySelector('.gift-name').textContent.toLowerCase();
                    // Se o termo estiver no nome, mostra; senão, esconde
                    item.style.display = name.includes(term) ? 'block' : 'none';
                });
            });
        }
    });
})();
