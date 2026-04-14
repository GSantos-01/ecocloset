/* ─────────────────────────────────────────
   EcoCloset · script.js
   1. Menu hambúrguer (mobile)
   2. Contadores animados
   3. Scroll reveal (animação ao entrar na tela)
   4. Highlight do menu ativo
───────────────────────────────────────── */


/* ══════════════════════════════════════
   1. MENU HAMBÚRGUER (mobile)
══════════════════════════════════════ */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.innerHTML = isOpen ? '✕' : '☰';
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Fecha o menu ao clicar em um link
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.innerHTML = '☰';
  });
});


/* ══════════════════════════════════════
   2. CONTADORES ANIMADOS
   Anima os números da seção .stats
   quando ela entra na tela
══════════════════════════════════════ */
function animateCounter(el, target, suffix, duration = 1800) {
  let start = 0;
  const isFloat = target % 1 !== 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    // Easing: ease-out
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;
    el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current))
      .toLocaleString('pt-BR') + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Água: 2700
      animateCounter(document.getElementById('count-water'), 2700, 'L');
      // CO2: texto, não número — apenas revela
      document.getElementById('count-co2').textContent = '↓ CO₂';
      // Custo: R$ 0
      animateCounter(document.getElementById('count-cost'), 0, '');
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.4 });

const statsSection = document.querySelector('.stats');
if (statsSection) statsObserver.observe(statsSection);


/* ══════════════════════════════════════
   3. SCROLL REVEAL
   Elementos com [data-reveal] aparecem
   com fade + slide ao entrar na tela
══════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => {
  revealObserver.observe(el);
});


/* ══════════════════════════════════════
   4. HIGHLIGHT DO MENU ATIVO
   Marca o link do menu conforme a seção
   visível na tela durante o scroll
══════════════════════════════════════ */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav a');

const menuObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(section => menuObserver.observe(section));
