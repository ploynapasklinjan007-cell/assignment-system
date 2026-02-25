// ================== Particles (Landing Page) ==================
function createParticles() {
  const container = document.getElementById('particleContainer');
  if (!container) return;

  // ✅ ล้างก่อนสร้าง (ถูกตำแหน่ง)
  container.innerHTML = '';

for (let i = 0; i < 30; i++) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  particle.style.left = Math.random() * 100 + '%';
  particle.style.top = 30 + Math.random() * 70 + '%';
  particle.style.animationDelay = Math.random() * 20 + 's';
  particle.style.animationDuration =
    15 + Math.random() * 10 + 's';

    container.appendChild(particle);
  }
}

// ================== Stars (Landing Page) ==================
function createStars() {
  const container = document.getElementById('starContainer');
  if (!container) return;

  // ✅ ล้างก่อนสร้าง (ถูกตำแหน่ง)
  container.innerHTML = '';

  for (let i = 0; i < 50; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = 25 + Math.random() * 75 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';

    container.appendChild(star);
  }
}

// ================== Confetti Effect ==================
let isConfettiRunning = false;

function triggerConfetti() {
  if (isConfettiRunning) return;
  isConfettiRunning = true;

  const colors = ['#e879f9', '#8b5cf6', '#22c55e', '#eab308'];

  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '-10px';
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 0.3 + 's';

    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, 1500);
  }

  // ปลดล็อกหลังเอฟเฟกต์จบ
  setTimeout(() => {
    isConfettiRunning = false;
  }, 1600);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('particleContainer')) {
    createParticles();
  }

  if (document.getElementById('starContainer')) {
    createStars();
  }
});

// ================== Export ==================
window.createParticles = createParticles;
window.createStars = createStars;
window.triggerConfetti = triggerConfetti;
