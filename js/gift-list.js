(function() {
    // CONFIGURAÇÃO DO PIX
    const PIX_KEY = "81989035561";

    // ================== Elementos do Modal ==================
    const modal = document.getElementById('contributionModal');
    const modalGiftName = document.getElementById('modalGiftName');
    const modalGiftPrice = document.getElementById('modalGiftPrice');
    const modalProgressBar = document.getElementById('modalProgressBar');
    const modalContributedAmount = document.getElementById('modalContributedAmount');
    const modalRemainingAmount = document.getElementById('modalRemainingAmount');
    const modalProgressFill = document.getElementById('modalProgressFill');
    const contributionAmountInput = document.getElementById('contributionAmount');
    const modalPixKey = document.getElementById('modalPixKey');
    const confirmContributionBtn = document.getElementById('confirmContributionBtn');
    const cancelContributionBtn = document.getElementById('cancelContributionBtn');

    let currentGift = null; // Armazena o presente selecionado no modal
    let currentGuestName = ''; // Armazena o nome do convidado

    // Helper para formatar moeda
    const formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // ================== Site Público ==================
    async function listarPresentesPublic(guestName) {
        currentGuestName = guestName; // Atualiza o nome do convidado atual
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
                            <span>Meta: ${formatCurrency(gift.price)}</span>
                        </div>
                        <div style="background:#e0e0e0; border-radius:10px; height:8px; width:100%; overflow:hidden;">
                            <div style="background: linear-gradient(90deg, var(--c-gold), var(--c-gold-dark)); width:${percent}%; height:100%; transition: width 0.5s ease;"></div>
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
                        if (gift.price) {
                            openContributionModal(gift);
                        } else {
                            // Lógica antiga para presentes únicos
                            handleUniqueGift(gift);
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

    async function handleUniqueGift(gift) {
        const confirmed = await showConfirm(`Você confirma que irá nos presentear com "<strong>${gift.name}</strong>"? <br><br>Ao confirmar, o item será marcado como escolhido em seu nome.`);
        if (!confirmed) return;

        const { error } = await supabaseClient
            .from('gifts')
            .update({ taken_by: currentGuestName, confirmed_at: new Date().toISOString() })
            .eq('id', gift.id);

        if (error) {
            showToast('Erro ao registrar presente: ' + error.message, 'error');
        } else {
            showToast(`Obrigado, <strong>${currentGuestName}</strong>! Você escolheu: <em>${gift.name}</em> 💖`, 'success');
            // A lista será atualizada pelo listener em tempo real
        }
    }

    function openContributionModal(gift) {
        currentGift = gift;
        const totalContributed = (gift.contributions || []).reduce((acc, c) => acc + (c.amount || 0), 0);
        const remaining = gift.price - totalContributed;
        const percent = Math.min(100, (totalContributed / gift.price) * 100);
        modalGiftName.textContent = gift.name;
        modalGiftPrice.textContent = formatCurrency(gift.price);
        modalContributedAmount.textContent = formatCurrency(totalContributed);
        modalRemainingAmount.textContent = formatCurrency(remaining);
        modalProgressFill.style.width = `${percent}%`;
        modalPixKey.textContent = PIX_KEY;

        contributionAmountInput.value = '';
        contributionAmountInput.placeholder = remaining.toFixed(2).replace('.', ',');
        contributionAmountInput.max = remaining.toFixed(2);
        
        // Esconde a barra de progresso se o presente já foi totalmente pago
        modalProgressBar.style.display = remaining > 0.01 ? 'block' : 'none';

        modal.classList.add('show');
    }

    function closeContributionModal() {
        modal.classList.remove('show');
        currentGift = null;
        confirmContributionBtn.disabled = false;
        confirmContributionBtn.textContent = 'Confirmar Contribuição';
    }

    async function handleConfirmContribution() {
        const amount = parseFloat(contributionAmountInput.value.replace(',', '.'));
        const remaining = currentGift.price - (currentGift.contributions || []).reduce((acc, c) => acc + (c.amount || 0), 0);

        if (isNaN(amount) || amount <= 0) {
            return showToast('Por favor, insira um valor de contribuição válido.', 'error');
        }
        if (amount > remaining + 0.01) { // 0.01 de margem para erros de float
            return showToast(`O valor de ${formatCurrency(amount)} excede o restante de ${formatCurrency(remaining)}.`, 'error');
        }

        confirmContributionBtn.disabled = true;
        confirmContributionBtn.textContent = 'Registrando...';

        const newContribution = {
            name: currentGuestName,
            amount: amount,
            date: new Date().toISOString()
        };

        const { error } = await supabaseClient
            .from('gifts')
            .update({ contributions: [...(currentGift.contributions || []), newContribution] })
            .eq('id', currentGift.id);

        if (error) {
            showToast('Erro ao registrar contribuição: ' + error.message, 'error');
            confirmContributionBtn.disabled = false;
            confirmContributionBtn.textContent = 'Confirmar Contribuição';
        } else {
            showToast(`Obrigado, <strong>${currentGuestName}</strong>! Sua contribuição de ${formatCurrency(amount)} para <em>${currentGift.name}</em> foi registrada! 💖`, 'success');
            closeContributionModal();
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        const guestName = new URLSearchParams(window.location.search).get('name')?.trim() || 'Convidado';

        listarPresentesPublic(guestName);

        supabaseClient.channel('public:gifts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'gifts' }, () => {
                listarPresentesPublic(guestName);
            })
            .subscribe();

        // ================== Event Listeners do Modal ==================
        cancelContributionBtn.addEventListener('click', closeContributionModal);
        confirmContributionBtn.addEventListener('click', handleConfirmContribution);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) { // Fecha se clicar no overlay
                closeContributionModal();
            }
        });

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
