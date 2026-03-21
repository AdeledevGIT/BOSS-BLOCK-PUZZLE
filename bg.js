/**
 * Boss Block Puzzle — Aurora Background Particles
 * Soft floating orbs that complement the night sky and aurora effects.
 */
(function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const COLORS = [
        'rgba(29,201,154,',   // aurora green
        'rgba(155,89,245,',   // aurora purple
        'rgba(78,205,196,',    // turquoise
        'rgba(249,202,36,',    // moon yellow
        'rgba(108,92,231,',    // deep purple
        'rgba(116,185,255,',   // sky blue
    ];

    let W, H, particles = [];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function createParticle() {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 100 + 60,
            alpha: Math.random() * 0.08 + 0.02,
            dx: (Math.random() - 0.5) * 0.2,
            dy: (Math.random() - 0.5) * 0.2,
            color,
        };
    }

    function init() {
        resize();
        particles = Array.from({ length: 5 }, createParticle);
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        for (const p of particles) {
            const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
            grd.addColorStop(0,   p.color + p.alpha + ')');
            grd.addColorStop(1,   p.color + '0)');
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();

            p.x += p.dx;
            p.y += p.dy;

            if (p.x < -p.r) p.x = W + p.r;
            if (p.x > W + p.r) p.x = -p.r;
            if (p.y < -p.r) p.y = H + p.r;
            if (p.y > H + p.r) p.y = -p.r;
        }
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    init();
    draw();
})();
