// Основна логіка: клік по кульці -> шарики -> показати привітання
(function () {
  const balloon  = document.getElementById('smiley');
  const hint     = document.querySelector('.click-text');
  const congrats = document.querySelector('.congrats-wrapper');
  const bgMusic  = document.getElementById('bg-music');
  const openSound= document.getElementById('open-sound');
  const canvas   = document.getElementById('confetti-canvas');
  const ctx      = canvas.getContext('2d');

  // Розміри canvas
  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // ======= ШАРИКИ =======

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  // кольори шариків (рожевий замінений на персиковий)
const BALLOON_COLORS = [
  "#FF7A59", // яркий персиково-коралловый
  "#FFCC00", // яркий жовтий
  "#3FC764", // яркий зелений
  "#1E78FF", // насичений блакитний/синій
  "#B623FF", // яскравий фіолетовий
];


  let balloons = [];
  let balloonsRunning   = false;
  let balloonsStartTime = 0;   // час старту анімації

  const FLY_TIME  = 8000; // 8 сек активного польоту
  const FADE_TIME = 4000; // 4 сек м'якого розчинення з рухом

  function createBalloons() {
    balloons = [];
    const total = 40; // кількість шариків

    for (let i = 0; i < total; i++) {
      balloons.push({
        x: rand(0, canvas.width),
        y: canvas.height + rand(20, 200),  // стартують знизу
        size: rand(20, 50),
        vy: rand(1.0, 2.3),               // ЧУТЬ ШВИДШЕ, ніж раніше
        sway: rand(0.4, 1.2),             // амплітуда похитування
        swaySpeed: rand(0.002, 0.005),    // швидкість похитування
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
        baseAlpha: rand(0.8, 1),
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function drawBalloon(b, t, globalFade) {
    ctx.save();
    // прозорість шарика = його базова * фактор загального зникнення
    const alpha = b.baseAlpha * globalFade;
    ctx.globalAlpha = alpha <= 0 ? 0 : alpha;

    const swayX = Math.sin(t * b.swaySpeed + b.phase) * b.sway;
    const x = b.x + swayX;
    const y = b.y;

    // овал шарика
    ctx.beginPath();
    ctx.ellipse(x, y, b.size * 0.7, b.size, 0, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.fill();

    // блик
    ctx.beginPath();
    ctx.ellipse(
      x - b.size * 0.2,
      y - b.size * 0.3,
      b.size * 0.15,
      b.size * 0.28,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fill();

    // нитка
    ctx.beginPath();
    ctx.moveTo(x, y + b.size);
    ctx.lineTo(x, y + b.size + 35);
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  function updateBalloon(b, elapsed) {
    b.y -= b.vy;

    // ДО 8 секунд дозволяємо "респаун" знизу, потім тільки летять вгору й зникають
    if (elapsed < FLY_TIME && b.y < -120) {
      b.y = canvas.height + rand(20, 200);
      b.x = rand(0, canvas.width);
    }
  }

  // анімація: 8 секунд польоту, потім ще 4 секунди — рух + м'яке розчинення до 0 прозорості
  function animateBalloons(ts) {
    if (!balloonsRunning) return;

    if (!balloonsStartTime) {
      balloonsStartTime = ts;
    }
    const elapsed = ts - balloonsStartTime;

    // обчислюємо загальний фактор прозорості
    let fadeFactor = 1;
    if (elapsed > FLY_TIME) {
      const fadeElapsed = elapsed - FLY_TIME;
      fadeFactor = 1 - fadeElapsed / FADE_TIME;
      if (fadeFactor < 0) fadeFactor = 0;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const b of balloons) {
      updateBalloon(b, elapsed);
      drawBalloon(b, ts, fadeFactor);
    }

    // поки не закінчилась фаза повного зникнення — продовжуємо анімацію
    if (elapsed < FLY_TIME + FADE_TIME && fadeFactor > 0) {
      requestAnimationFrame(animateBalloons);
    } else {
      balloonsRunning = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // ======= ПОКАЗ ПРИВІТАННЯ =======

  function revealCongrats() {
    congrats.classList.remove('hidden');
    congrats.classList.add('show-dissolve');
    const lines = document.querySelectorAll('.congrats-text .line');
    lines.forEach((line, i) => {
      setTimeout(() => line.classList.add('visible'), 250 + i * 250);
    });
  }

  function startExperience() {
    // Приховати кульку і підказку
    balloon.classList.add('hidden');
    if (hint) hint.classList.add('hidden');

    // Сразу только короткий звук відкриття
    try { openSound && openSound.play(); } catch (e) {}

    // Запуск шариків
    createBalloons();
    balloonsStartTime = 0;
    balloonsRunning   = true;
    requestAnimationFrame(animateBalloons);

    // Музика і привітання — через 2 секунди
    setTimeout(() => {
      // запуск фонової музики
      try { bgMusic && bgMusic.play(); } catch (e) {}

      // показати привітання
      revealCongrats();
    }, 2000);
  }

  // Події
  balloon.addEventListener('click', startExperience);
  balloon.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') startExperience();
  });
})();

// Wrap smiley (flower) to draw glow aura
(function () {
  var img = document.getElementById('smiley');
  if (!img) return;
  var wrap = document.createElement('div');
  wrap.className = 'smiley-wrap floating';
  img.parentNode.insertBefore(wrap, img);
  wrap.appendChild(img);
})();

// Subtle parallax tilt on hover (desktop only)
(function () {
  var img = document.getElementById('smiley');
  if (!img) return;
  var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouch) return;

  var maxTilt = 6; // degrees
  function onMove(e) {
    var rect = img.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width;  // 0..1
    var y = (e.clientY - rect.top)  / rect.height; // 0..1
    var tiltX = (0.5 - y) * maxTilt;
    var tiltY = (x - 0.5) * maxTilt;
    img.style.transform =
      'rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) scale(1.03)';
  }
  function reset() { img.style.transform = ''; }
  img.addEventListener('mousemove', onMove);
  img.addEventListener('mouseleave', reset);
})();
