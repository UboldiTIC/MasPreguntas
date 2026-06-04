// ================================================================
//  stars.js — Campo de estrellas animado (canvas de fondo)
// ================================================================

const Stars = (function () {
  let canvas, ctx, stars = [], raf;

  function init() {
    canvas = document.getElementById('bg-canvas');
    ctx = canvas.getContext('2d');
    resize();
    buildStars();
    animate();
    window.addEventListener('resize', function () {
      resize();
      buildStars();
    });
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function buildStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 4500);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.3 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.6 + 0.2   // parpadeo
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = Date.now() / 1000;

    stars.forEach(function (s) {
      const alpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + alpha.toFixed(2) + ')';
      ctx.fill();
    });

    raf = requestAnimationFrame(animate);
  }

  return { init };
})();
