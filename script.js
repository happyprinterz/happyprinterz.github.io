// Set year
document.getElementById('year').textContent = new Date().getFullYear();

(function () {
  /* === Background & Avatar Loading === */
  const bgTest = new Image();
  // Try WebP first, fallback to PNG if needed (though we'll just use WebP in CSS/JS)
  // For this script, we'll assume we are switching to w.webp
  // If you want to support fallback, you can check onerror.
  const bgUrl = 'w.webp';

  bgTest.onload = function () {
    document.documentElement.style.setProperty('--bg-url', `url('${bgUrl}')`);
  };
  bgTest.onerror = function () {
    // Fallback to old png if webp fails or doesn't exist yet
    document.documentElement.style.setProperty('--bg-url', `url('w.png')`);
  };
  bgTest.src = bgUrl;

  const avatarEl = document.getElementById('avatar');
  if (avatarEl) {
    const av = new Image();
    av.onload = function () {
      avatarEl.src = 'i.jpg';
      avatarEl.style.display = 'block';
    };
    av.onerror = function () {
      avatarEl.style.display = 'none';
    };
    av.src = 'i.jpg';
  }

  /* === Mouse Parallax === */
  (function mouseParallax() {
    const maxOffset = 18;
    const ease = 0.12;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    // Disable parallax on touch devices for performance/UX
    if (isTouch) return;

    function onPointerMove(e) {
      const x = e.clientX !== undefined ? e.clientX : (window.innerWidth / 2);
      const y = e.clientY !== undefined ? e.clientY : (window.innerHeight / 2);

      const nx = (x - window.innerWidth / 2) / (window.innerWidth / 2);
      const ny = (y - window.innerHeight / 2) / (window.innerHeight / 2);

      targetX = -nx * maxOffset;
      targetY = -ny * maxOffset * 0.6;
    }

    function onLeave() {
      targetX = 0;
      targetY = 0;
    }

    function frame() {
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;

      document.documentElement.style.setProperty('--parallaxX', Math.round(currentX) + 'px');
      document.documentElement.style.setProperty('--parallaxY', Math.round(currentY) + 'px');

      requestAnimationFrame(frame);
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onLeave, { passive: true });
    // window.addEventListener('mouseout', (ev) => { if (!ev.relatedTarget) onLeave(); });

    frame();
  })();

  /* === IntersectionObserver === */
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.12
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.link-card').forEach((el, i) => {
    el.style.transitionDelay = (i * 60) + 'ms';
    io.observe(el);
  });

  // Keyboard accessibility
  document.querySelectorAll('.link-card').forEach(el => {
    el.setAttribute('tabindex', '0');
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        el.click();
      }
    });
  });

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('SW registered!', reg))
        .catch(err => console.log('SW failed', err));
    });
  }

})();
