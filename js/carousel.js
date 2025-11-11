document.addEventListener('DOMContentLoaded', () => {
    const pentagon = document.querySelector('.pentagon');
    const prevBtn = document.getElementById('prev-face');
    const nextBtn = document.getElementById('next-face');

    // Sai da função se os elementos essenciais não forem encontrados
    if (!pentagon || !prevBtn || !nextBtn) {
        return;
    }

    let currentFace = 0;
    const angle = 72; // 360 / 5 faces

    const rotatePentagon = () => {
        pentagon.style.transform = `rotateY(${currentFace * -angle}deg)`;
    };

    prevBtn.addEventListener('click', () => {
        currentFace--;
        rotatePentagon();
    });

    nextBtn.addEventListener('click', () => {
        currentFace++;
        rotatePentagon();
    });
});