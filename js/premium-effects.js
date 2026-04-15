document.addEventListener("DOMContentLoaded", () => {
    // 2. Ambient Particles (Light Dust / Bokeh)
    const canvas = document.getElementById('ambient-particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let mouse = { x: -1000, y: -1000 };

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }

        window.addEventListener('resize', resize);
        resize();

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * -1 - 0.2; // Sobem lentamente
                this.opacity = Math.random() * 0.5 + 0.1;
                this.color = `rgba(212, 175, 111, ${this.opacity})`;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Repulsão suave do mouse
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) {
                    this.x -= dx * 0.02;
                    this.y -= dy * 0.02;
                }

                // Loop
                if (this.y < 0 || this.x < 0 || this.x > width) {
                    this.y = height + 10;
                    this.x = Math.random() * width;
                }

                this.draw();
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            let particleCount = window.innerWidth < 768 ? 30 : 80;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => p.update());
            requestAnimationFrame(animateParticles);
        }

        initParticles();
        animateParticles();
    }

    // 3. Efeito Tilt 3D (Hover) nos Cards de Presente
    // Usamos delegação no mousemove, o framework (AOS ou CSS float) pode ter conflito
    // Para evitar conflito com a animação de float do CSS constante:
    // O JS vai adicionar o tilt em cima, controlamos melhor.
    let currentTiltCard = null;

    document.addEventListener("mousemove", (e) => {
        const targetCard = e.target.closest('.gift-card');
        
        if (targetCard) {
            currentTiltCard = targetCard;
            const rect = targetCard.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2; // -Centro até +Centro
            const y = e.clientY - rect.top - rect.height / 2;
            
            const rotateX = -(y / rect.height) * 20; 
            const rotateY = (x / rect.width) * 20;

            gsap.to(targetCard, {
                rotationX: rotateX,
                rotationY: rotateY,
                transformPerspective: 1000,
                transformOrigin: "center center",
                ease: "power2.out",
                duration: 0.5
            });
        }
    });

    document.addEventListener("mouseout", (e) => {
        // Se o mouse sair do body ou mudar de alvo
        if (currentTiltCard && !e.relatedTarget?.closest('.gift-card')) {
            gsap.to(currentTiltCard, {
                rotationX: 0,
                rotationY: 0,
                ease: "power3.out",
                duration: 0.8
            });
            currentTiltCard = null;
        }
    });

    // 4. Efeito de Aparecimento GSAP (ScrollTrigger para a página inteira)
    // O AOS já lida com fade-up. Vamos criar uma máscara na "Lista de Presentes"
    const title = document.querySelector('.premium-title');
    if(title) {
        // Separação manual por palavra para não necessitar SplitText (que é pago no club)
        const text = title.innerText;
        title.innerHTML = text.split(" ").map(w => `<span style="display:inline-block; opacity:0; transform:translateY(20px);">${w}&nbsp;</span>`).join('');
        
        gsap.to(title.querySelectorAll("span"), {
            scrollTrigger: {
                trigger: title,
                start: "top 80%"
            },
            y: 0,
            opacity: 1,
            stagger: 0.15,
            ease: "power4.out",
            duration: 1
        });
    }
});
