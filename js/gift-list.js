(function () {
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
    const pixPaymentArea = document.getElementById('pixPaymentArea');
    const pixQrCode = document.getElementById('pixQrCode');
    const pixCopiaECola = document.getElementById('pixCopiaECola');
    const copyPixBtn = document.getElementById('copyPixBtn');
    const guestConfirmPaymentBtn = document.getElementById('guestConfirmPaymentBtn');
    const pixQrArea = document.getElementById('pixQrArea');
    const pixConfirmedArea = document.getElementById('pixConfirmedArea');

    let currentGift = null;       // Presente selecionado no modal
    let currentGuestName = '';    // Nome do convidado
    let currentTxId = null;       // ID da transação PIX gerada

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

            // ================== Cálculo do Contador Real-time ==================
            let totalGeralArrecadado = 0;
            let metaTotal = 0;

            data.forEach(gift => {
                if (gift.price) {
                    metaTotal += gift.price;
                    const confirmadoNoItem = (gift.contributions || [])
                        .filter(c => c.status === 'confirmed')
                        .reduce((sum, c) => sum + (c.amount || 0), 0);
                    totalGeralArrecadado += confirmadoNoItem;
                }
            });

            const totalCollectedEl = document.getElementById('total-collected-amount');
            if (totalCollectedEl) {
                totalCollectedEl.textContent = formatCurrency(totalGeralArrecadado);
            }

            const totalProgressFill = document.getElementById('total-progress-fill');
            if (totalProgressFill && metaTotal > 0) {
                const totalPercent = Math.min(100, (totalGeralArrecadado / metaTotal) * 100);
                totalProgressFill.style.width = `${totalPercent}%`;
            }

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

                // Adiciona um selo se houver URL do produto
                if (gift.product_url) {
                    const badge = document.createElement('span');
                    badge.className = 'store-badge';
                    badge.innerHTML = '<i class="bi bi-cart3 me-1"></i> Sugestão';
                    innerContent.appendChild(badge);
                }

                const nameDiv = document.createElement('div');
                nameDiv.className = 'gift-name';
                if (gift.product_url) {
                    const a = document.createElement('a');
                    a.href = gift.product_url;
                    a.target = '_blank';
                    a.className = 'gift-name-link';
                    a.innerHTML = `${gift.name} <i class="bi bi-box-arrow-up-right" style="font-size: 0.8rem;"></i>`;
                    a.title = "Ver referência na loja";
                    nameDiv.appendChild(a);
                } else {
                    nameDiv.textContent = gift.name;
                }
                innerContent.appendChild(nameDiv);

                const btn = document.createElement('button');
                btn.className = 'confirm-btn';

                // Lógica de Presente Único (sem cotas)
                let isFullyTaken = false;
                let totalContributed = 0;

                if (gift.contributions && Array.isArray(gift.contributions)) {
                    totalContributed = gift.contributions
                        .filter(c => c.status === 'confirmed')
                        .reduce((acc, curr) => acc + (curr.amount || 0), 0);
                }

                if (gift.taken_by || (gift.price && totalContributed >= gift.price)) {
                    isFullyTaken = true;
                }

                // Exibição do valor do presente no card
                if (gift.price) {
                    const priceContainer = document.createElement('div');
                    priceContainer.style.cssText = "padding: 5px 20px 10px; width: 100%; text-align: center;";
                    priceContainer.innerHTML = `
                        <div style="font-size:0.95rem; font-weight: 600; color:var(--c-primary);">
                            Valor: ${formatCurrency(gift.price)}
                        </div>
                    `;
                    innerContent.appendChild(priceContainer);
                }

                if (isFullyTaken) {
                    btn.innerHTML = `<i class="bi bi-heart-fill me-2"></i> Presenteado`;
                    btn.disabled = true;
                    btn.style.opacity = '0.8';
                    btn.style.cursor = 'not-allowed';
                    btn.style.background = 'linear-gradient(45deg, #6c757d, #495057)';
                } else {
                    btn.innerHTML = `<i class="bi bi-gift-fill me-2"></i> Presentear 🎁`;
                    btn.onclick = () => openContributionModal(gift);
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

    function openContributionModal(gift) {
        currentGift = gift;

        modalGiftName.textContent = gift.name;
        modalGiftPrice.textContent = gift.price ? formatCurrency(gift.price) : 'Valor Livre';
        modalPixKey.textContent = PIX_KEY;

        if (gift.price) {
            contributionAmountInput.value = gift.price.toFixed(2);
            contributionAmountInput.readOnly = true;
        } else {
            contributionAmountInput.value = "100.00";
            contributionAmountInput.readOnly = false;
        }

        contributionAmountInput.placeholder = "0,00";

        pixPaymentArea.style.display = 'none';
        modalProgressBar.style.display = 'none';

        modal.classList.add('show');
    }

    function closeContributionModal() {
        modal.classList.remove('show');
        currentGift = null;
        currentTxId = null;
        pixPaymentArea.style.display = 'none';
        if (pixQrArea) pixQrArea.style.display = 'block';
        if (pixConfirmedArea) pixConfirmedArea.style.display = 'none';
        confirmContributionBtn.disabled = false;
        confirmContributionBtn.style.display = 'inline-block';
        confirmContributionBtn.textContent = 'Gerar QR Code PIX 🎁';
    }

    async function handleConfirmContribution() {
        const amount = parseFloat(contributionAmountInput.value.replace(',', '.'));
        const totalConfirmed = (currentGift.contributions || [])
            .filter(c => c.status === 'confirmed')
            .reduce((acc, c) => acc + (c.amount || 0), 0);
        const remaining = currentGift.price ? currentGift.price - totalConfirmed : Infinity;

        if (isNaN(amount) || amount <= 0) {
            return showToast('Por favor, insira um valor de contribuição válido.', 'error');
        }
        if (currentGift.price && amount > remaining + 0.01) {
            return showToast(`O valor de ${formatCurrency(amount)} excede o restante de ${formatCurrency(remaining)}.`, 'error');
        }

        confirmContributionBtn.disabled = true;
        confirmContributionBtn.textContent = 'Gerando Pix...';

        try {
            // Chama a Edge Function do Supabase para gerar o PIX
            const { data, error } = await supabaseClient.functions.invoke('create-pix', {
                body: {
                    title: `Presente: ${currentGift.name}`,
                    amount: amount,
                    guestName: currentGuestName,
                    giftId: currentGift.id
                }
            });

            if (error) throw error;

            // Mostra o QR Code na tela (formato PNG gerado pela Edge Function)
            pixQrCode.src = `data:image/png;base64,${data.qr_code_base64}`;
            pixCopiaECola.value = data.qr_code;
            currentTxId = data.payment_id; // Salva o tx_id para a confirmação do convidado
            pixPaymentArea.style.display = 'block';
            if (pixQrArea) pixQrArea.style.display = 'block';
            if (pixConfirmedArea) pixConfirmedArea.style.display = 'none';
            confirmContributionBtn.style.display = 'none';

            showToast('PIX gerado! Escaneie o QR Code ou copie o código.', 'success');
        } catch (error) {
            const msg = error?.message || 'Erro desconhecido';
            showToast(`Erro ao gerar PIX: ${msg}`, 'error');
            confirmContributionBtn.disabled = false;
            confirmContributionBtn.textContent = 'Confirmar Contribuição';
        }
    }

    // Função global para copiar texto (usada no botão da chave geral)
    window.copyToClipboard = (text, successMsg) => {
        navigator.clipboard.writeText(text).then(() => {
            if (typeof showToast === 'function') {
                showToast(successMsg || 'Copiado com sucesso!', 'success');
            } else {
                alert(successMsg || 'Copiado!');
            }
        }).catch(err => {
            console.error('Erro ao copiar: ', err);
        });
    };

    // Função para os botões de valor fixo
    window.setContributionAmount = (val) => {
        const input = document.getElementById('contributionAmount');
        if (input) {
            input.value = val.toFixed(2);
        }
    };

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

        // ── Botão: convidado confirma que realizou o pagamento ──
        if (guestConfirmPaymentBtn) {
            guestConfirmPaymentBtn.addEventListener('click', async () => {
                if (!currentGift || !currentTxId) return;

                guestConfirmPaymentBtn.disabled = true;
                guestConfirmPaymentBtn.textContent = 'Registrando...';

                // Busca o estado atual do presente e atualiza status da contribuição
                const { data: giftData, error: fetchErr } = await supabaseClient
                    .from('gifts').select('contributions').eq('id', currentGift.id).single();

                if (fetchErr) {
                    showToast('Erro ao registrar confirmação. Tente novamente.', 'error');
                    guestConfirmPaymentBtn.disabled = false;
                    guestConfirmPaymentBtn.textContent = '✅ Já realizei o pagamento!';
                    return;
                }

                const txId = currentTxId;
                const updatedContributions = (giftData.contributions || []).map(c =>
                    c.tx_id === txId ? { ...c, status: 'guest_confirmed' } : c
                );

                const { error: updateErr } = await supabaseClient
                    .from('gifts')
                    .update({ contributions: updatedContributions })
                    .eq('id', currentGift.id);

                if (updateErr) {
                    showToast('Erro ao registrar. Tente novamente.', 'error');
                    guestConfirmPaymentBtn.disabled = false;
                    guestConfirmPaymentBtn.textContent = '✅ Já realizei o pagamento!';
                    return;
                }

                // Mostra estado de sucesso
                if (pixQrArea) pixQrArea.style.display = 'none';
                if (pixConfirmedArea) pixConfirmedArea.style.display = 'block';
            });
        }

        if (copyPixBtn) {
            copyPixBtn.addEventListener('click', () => {
                pixCopiaECola.select();
                document.execCommand('copy');
                showToast('Código Copia e Cola copiado!', 'success');
                copyPixBtn.innerHTML = '<i class="bi bi-check-lg"></i> Copiado';
                setTimeout(() => { copyPixBtn.innerHTML = '<i class="bi bi-clipboard"></i> Copiar'; }, 2000);
            });
        }
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
