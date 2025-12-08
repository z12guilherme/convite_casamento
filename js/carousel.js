document.addEventListener('DOMContentLoaded', () => {
    const book = document.getElementById('book');
    const pages = Array.from(document.querySelectorAll('.right-side .page'));
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');

    if (!book || !pages.length || !prevBtn || !nextBtn) {
        console.warn('Elementos do livro (livro, páginas ou botões) não encontrados. A funcionalidade está desativada.');
        // Oculta os botões se o livro não funcionar
        if(prevBtn) prevBtn.style.display = 'none';
        if(nextBtn) nextBtn.style.display = 'none';
        return;
    }

    let currentPage = 0; // Nenhuma página virada inicialmente
    const totalPages = pages.length;

    // Função para atualizar o estado dos botões e a visibilidade
    const updateControls = () => {
        // Mostra os botões apenas se o livro estiver aberto
        const isBookOpen = book.classList.contains('open');
        prevBtn.style.visibility = isBookOpen ? 'visible' : 'hidden';
        nextBtn.style.visibility = isBookOpen ? 'visible' : 'hidden';
        
        if (isBookOpen) {
            prevBtn.disabled = currentPage === 0;
            nextBtn.disabled = currentPage === totalPages;
        }
    };

    // Define o z-index inicial para empilhar as páginas corretamente
    pages.forEach((page, index) => {
        page.style.zIndex = totalPages - index;
        
        // Adiciona listener de clique para virar a página
        page.addEventListener('click', (e) => {
            // Permite virar a página clicando nela, se for a página atual
            if (e.target.closest('.page') === pages[currentPage]) {
                turnPage('next');
            }
        });
    });

    // A capa (página 0) abre o livro
    const cover = pages[0];
    cover.addEventListener('click', () => {
        if (!book.classList.contains('open')) {
            book.classList.add('open');
            turnPage('next'); // Vira a capa para começar
        }
    });

    const turnPage = (direction) => {
        if (direction === 'next') {
            if (currentPage >= totalPages) return;

            const pageToTurn = pages[currentPage];
            pageToTurn.classList.add('turn');
            pageToTurn.style.zIndex = totalPages + currentPage; // Eleva a página que está virando
            currentPage++;

        } else if (direction === 'prev') {
            if (currentPage === 0) return;
            
            currentPage--;
            const pageToTurnBack = pages[currentPage];
            pageToTurnBack.classList.remove('turn');
            
            // Após a animação, restaura o z-index para a ordem correta
            setTimeout(() => {
                pageToTurnBack.style.zIndex = totalPages - currentPage;
            }, 750); // Metade do tempo da transição
        }
        updateControls();
    };

    nextBtn.addEventListener('click', () => turnPage('next'));
    prevBtn.addEventListener('click', () => turnPage('prev'));

    // Estado inicial dos botões
    updateControls();
});
