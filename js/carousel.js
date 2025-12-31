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
        // append page number
        const numberEl = document.createElement('span');
        numberEl.className = 'page-number';
        numberEl.setAttribute('aria-hidden', 'true');
        numberEl.innerText = `${index + 1}/${totalPages}`;
        page.querySelector('.content').appendChild(numberEl);
    });

    const turnPage = (direction) => {
        if (direction === 'next') {
            if (currentPage >= totalPages) return;
            // small book ripple effect
            book.classList.add('turning');
            pages[currentPage].classList.add('flipped');
            pages[currentPage].style.zIndex = totalPages + currentPage;
            currentPage++;
            setTimeout(() => book.classList.remove('turning'), 800);
        } else if (direction === 'prev') {
            if (currentPage <= 0) return;
            currentPage--;
            book.classList.add('turning');
            pages[currentPage].classList.remove('flipped');
            // Timeout to allow flip back animation to complete before resetting z-index
            setTimeout(() => {
                pages[currentPage].style.zIndex = totalPages - currentPage;
                book.classList.remove('turning');
            }, 800);
        }
        updateControls();
    };

    // keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') turnPage('next');
        if (e.key === 'ArrowLeft') turnPage('prev');
    });

    // touch support
    let touchStartX = 0;
    document.querySelector('.book-container').addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
    }, {passive:true});
    document.querySelector('.book-container').addEventListener('touchend', (e) => {
        const diff = e.changedTouches[0].clientX - touchStartX;
        if (diff < -40) turnPage('next');
        if (diff > 40) turnPage('prev');
    });

    nextBtn.addEventListener('click', () => turnPage('next'));
    prevBtn.addEventListener('click', () => turnPage('prev'));

    updateControls();
});
