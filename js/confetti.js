// ================================================================
//  confetti.js — Guirnaldas y confeti de celebración (canvas superior)
// ================================================================

const Confetti = (function () {
  let canvas, ctx, particles = [], raf = null;

  const COLORES = [
    '#ff6b35', '#ffd700', '#00c88c', '#e91e8c', '#00b4ff',
    '#ff4757', '#2ed573', '#ff6348', '#1e90ff', '#ff6b81',
    '#eccc68', '#a29bfe', '#fd79a8', '#55efc4', '#f9ca24'
  ];

  function init() {
    canvas = document.getElementById('confetti-canvas');
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function crearParticula() {
    const formas = ['rect', 'circle', 'triangle', 'pennant'];
    return {
      x:       Math.random() * canvas.width,
      y:       -(Math.random() * canvas.height + 20),
      w:       Math.random() * 14 + 6,
      h:       Math.random() * 8  + 4,
      color:   COLORES[Math.floor(Math.random() * COLORES.length)],
      vx:      (Math.random() - 0.5) * 2.5,
      vy:      Math.random() * 3.5 + 1.8,
      rot:     Math.random() * 360,
      rotV:    (Math.random() - 0.5) * 7,
      wobble:  Math.random() * Math.PI * 2,
      wobbleV: Math.random() * 0.05 + 0.02,
      forma:   formas[Math.floor(Math.random() * formas.length)]
    };
  }

  function dibujarForma(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = 0.88;

    switch (p.forma) {
      case 'rect':
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        break;

      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -p.h / 2);
        ctx.lineTo( p.w / 2,  p.h / 2);
        ctx.lineTo(-p.w / 2,  p.h / 2);
        ctx.closePath();
        ctx.fill();
        break;

      case 'pennant':
        // Banderita de guirnalda
        ctx.beginPath();
        ctx.moveTo(-p.w / 2, -p.h / 2);
        ctx.lineTo( p.w / 2, -p.h / 2);
        ctx.lineTo(0,         p.h / 2);
        ctx.closePath();
        ctx.fill();
        // Borde blanco fino
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        break;
    }

    ctx.restore();
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(function (p, i) {
      p.y      += p.vy;
      p.wobble += p.wobbleV;
      p.x      += p.vx + Math.sin(p.wobble) * 1.2;
      p.rot    += p.rotV;

      if (p.y > canvas.height + 30) {
        particles[i] = crearParticula();
      }

      dibujarForma(p);
    });

    raf = requestAnimationFrame(frame);
  }

  function start() {
    canvas.style.display = 'block';
    particles = [];
    for (let i = 0; i < 160; i++) {
      particles.push(crearParticula());
    }
    if (raf) cancelAnimationFrame(raf);
    frame();
  }

  function stop() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    particles = [];
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = 'none';
  }

  return { init, start, stop };
})();
