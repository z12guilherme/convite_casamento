(function() {
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
                
                if (gift.taken_by) {
                    btn.innerHTML = `<i class="bi bi-heart-fill me-2"></i> Presenteado`; 
                    btn.disabled = true;
                    btn.style.opacity = '0.8';
                    btn.style.cursor = 'not-allowed';
                    btn.style.background = 'linear-gradient(45deg, #6c757d, #495057)';
                } else {
                    btn.textContent = 'Presentear 🎁';
                    btn.onclick = async () => {
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
