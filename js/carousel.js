document.addEventListener('DOMContentLoaded', () => {
    const book = document.getElementById('book');
    const pages = Array.from(document.querySelectorAll('.right-side .page'));
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');

    if (!book || !pages.length || !prevBtn || !nextBtn) {
        if(prevBtn) prevBtn.style.display = 'none';
        if(nextBtn) nextBtn.style.display = 'none';
        return;
    }

    let currentPage = 0;
    const totalPages = pages.length;

    const updateControls = () => {
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage >= totalPages;
    };

    pages.forEach((page, index) => {
        page.style.zIndex = totalPages - index;
    });

    const turnPage = (direction) => {
        if (direction === 'next') {
            if (currentPage >= totalPages) return;
            pages[currentPage].classList.add('flipped');
            pages[currentPage].style.zIndex = totalPages + currentPage;
            currentPage++;
        } else if (direction === 'prev') {
            if (currentPage <= 0) return;
            currentPage--;
            pages[currentPage].classList.remove('flipped');
            // Timeout to allow flip back animation to complete before resetting z-index
            setTimeout(() => {
                pages[currentPage].style.zIndex = totalPages - currentPage;
            }, 500);
        }
        updateControls();
    };

    nextBtn.addEventListener('click', () => turnPage('next'));
    prevBtn.addEventListener('click', () => turnPage('prev'));

    updateControls();
});
