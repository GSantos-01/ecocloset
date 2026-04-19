/* ─────────────────────────────────────────
   EcoCloset · script.js
───────────────────────────────────────── */

const API_URL = 'http://localhost:3000';

// Espera o HTML carregar completamente antes de rodar qualquer coisa
document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════
     UTILITÁRIOS
  ══════════════════════════════════════ */
  const $ = id => document.getElementById(id);

  function on(id, evento, fn) {
    const el = $(id);
    if (el) el.addEventListener(evento, fn);
  }

  function mostrarMsg(texto, tipo = 'erro') {
    const el = $('modal-msg');
    if (!el) return;
    el.textContent = texto;
    el.className = `modal-msg ${tipo}`;
    el.classList.remove('hidden');
  }

  function esconderMsg() {
    const el = $('modal-msg');
    if (el) el.classList.add('hidden');
  }

  function setCarregando(btnId, loaderId, carregando) {
    const btn    = $(btnId);
    const loader = $(loaderId);
    if (btn)    btn.disabled = carregando;
    if (loader) loader.classList.toggle('hidden', !carregando);
  }

  function salvarSessao(token, usuario) {
    localStorage.setItem('eco_token',   token);
    localStorage.setItem('eco_usuario', JSON.stringify(usuario));
  }

  function limparSessao() {
    localStorage.removeItem('eco_token');
    localStorage.removeItem('eco_usuario');
  }

  function getSessao() {
    const token   = localStorage.getItem('eco_token');
    const usuario = localStorage.getItem('eco_usuario');
    return token ? { token, usuario: JSON.parse(usuario) } : null;
  }


  /* ══════════════════════════════════════
     NAVBAR — ESTADO DE LOGIN
  ══════════════════════════════════════ */
  function atualizarNavbar() {
    const sessao    = getSessao();
    const navAuth   = $('nav-auth');
    const navUser   = $('nav-user');
    const nomeEl    = $('nav-user-nome');

    if (sessao) {
      if (navAuth) navAuth.classList.add('hidden');
      if (navUser) navUser.classList.remove('hidden');
      if (nomeEl)  nomeEl.textContent = `Olá, ${sessao.usuario.nome.split(' ')[0]} 🌿`;
    } else {
      if (navAuth) navAuth.classList.remove('hidden');
      if (navUser) navUser.classList.add('hidden');
    }
  }


  /* ══════════════════════════════════════
     MODAL — ABRIR / FECHAR / TROCAR ABA
  ══════════════════════════════════════ */
  function abrirModal(aba = 'login') {
    const overlay = $('modal-overlay');
    if (overlay) overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    trocarAba(aba);
    esconderMsg();
  }

  function fecharModal() {
    const overlay = $('modal-overlay');
    if (overlay) overlay.classList.add('hidden');
    document.body.style.overflow = '';
    esconderMsg();
  }

  function trocarAba(aba) {
    const isLogin = aba === 'login';
    const tabLogin    = $('tab-login');
    const tabCadastro = $('tab-cadastro');
    const formLogin    = $('form-login');
    const formCadastro = $('form-cadastro');

    if (tabLogin)    tabLogin.classList.toggle('active', isLogin);
    if (tabCadastro) tabCadastro.classList.toggle('active', !isLogin);
    if (formLogin)    formLogin.classList.toggle('hidden', !isLogin);
    if (formCadastro) formCadastro.classList.toggle('hidden', isLogin);
    esconderMsg();
  }

  // Botões que abrem o modal
  on('btn-abrir-login',    'click', () => abrirModal('login'));
  on('btn-abrir-cadastro', 'click', () => abrirModal('cadastro'));
  on('btn-hero-comecar',   'click', () => abrirModal('cadastro'));
  on('btn-cta-final',      'click', () => abrirModal('cadastro'));
  on('btn-mobile-cadastro','click', () => { fecharMenu(); abrirModal('cadastro'); });

  // Fechar modal
  on('modal-close', 'click', fecharModal);

  const overlay = $('modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) fecharModal();
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharModal();
  });

  // Trocar abas
  on('tab-login',    'click', () => trocarAba('login'));
  on('tab-cadastro', 'click', () => trocarAba('cadastro'));

  // Logout
  on('btn-logout', 'click', () => {
    limparSessao();
    atualizarNavbar();
  });


  /* ══════════════════════════════════════
     CADASTRO
  ══════════════════════════════════════ */
  on('btn-cadastro', 'click', async () => {
    const nome  = $('cadastro-nome')  ? $('cadastro-nome').value.trim()  : '';
    const email = $('cadastro-email') ? $('cadastro-email').value.trim() : '';
    const senha = $('cadastro-senha') ? $('cadastro-senha').value        : '';

    if (!nome || !email || !senha) { mostrarMsg('Preencha todos os campos.'); return; }
    if (senha.length < 6)          { mostrarMsg('A senha deve ter no mínimo 6 caracteres.'); return; }

    setCarregando('btn-cadastro', 'btn-cadastro-loader', true);
    esconderMsg();

    try {
      const res   = await fetch(`${API_URL}/api/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
      });
      const dados = await res.json();

      if (!res.ok) { mostrarMsg(dados.erro || 'Erro ao criar conta.'); return; }

      salvarSessao(dados.token, dados.usuario);
      atualizarNavbar();
      mostrarMsg(`Bem-vindo(a), ${dados.usuario.nome.split(' ')[0]}! 🌿`, 'sucesso');
      setTimeout(fecharModal, 1500);

    } catch {
      mostrarMsg('Não foi possível conectar ao servidor. O backend está rodando?');
    } finally {
      setCarregando('btn-cadastro', 'btn-cadastro-loader', false);
    }
  });

  on('cadastro-senha', 'keydown', e => { if (e.key === 'Enter') $('btn-cadastro')?.click(); });


  /* ══════════════════════════════════════
     LOGIN
  ══════════════════════════════════════ */
  on('btn-login', 'click', async () => 
    {
    const email = $('login-email') ? $('login-email').value.trim() : '';
    const senha = $('login-senha') ? $('login-senha').value        : '';

    if (!email || !senha) { mostrarMsg('Preencha e-mail e senha.'); return; }

    setCarregando('btn-login', 'btn-login-loader', true);
    esconderMsg();

    try {
      const res   = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      const dados = await res.json();

      if (!res.ok) { mostrarMsg(dados.erro || 'E-mail ou senha incorretos.'); return; }

      salvarSessao(dados.token, dados.usuario);
      atualizarNavbar();
      mostrarMsg(`Bem-vindo(a) de volta, ${dados.usuario.nome.split(' ')[0]}! 🌿`, 'sucesso');
      setTimeout(fecharModal, 1500);

    } catch {
      mostrarMsg('Não foi possível conectar ao servidor. O backend está rodando?');
    } finally {
      setCarregando('btn-login', 'btn-login-loader', false);
    }
  });

  on('login-senha', 'keydown', e => { if (e.key === 'Enter') $('btn-login')?.click(); });


  /* ══════════════════════════════════════
     MENU HAMBÚRGUER
  ══════════════════════════════════════ */
  const hamburger  = $('hamburger');
  const mobileMenu = $('mobile-menu');

  function fecharMenu() {
    if (mobileMenu) mobileMenu.classList.remove('open');
    if (hamburger)  hamburger.innerHTML = '☰';
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.innerHTML = isOpen ? '✕' : '☰';
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', fecharMenu);
    });
  }


  /* ══════════════════════════════════════
     CONTADORES ANIMADOS
  ══════════════════════════════════════ */
  function animateCounter(el, target, suffix, duration = 1800) {
    if (!el) return;
    let start = 0;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('pt-BR') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const statsSection = document.querySelector('.stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter($('count-water'), 2700, 'L');
          if ($('count-co2'))  $('count-co2').textContent  = '↓ CO₂';
          if ($('count-cost')) $('count-cost').textContent = 'R$ 0';
          statsObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });
    statsObserver.observe(statsSection);
  }


  /* ══════════════════════════════════════
     SCROLL REVEAL
  ══════════════════════════════════════ */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));


  /* ══════════════════════════════════════
     HIGHLIGHT DO MENU ATIVO
  ══════════════════════════════════════ */
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
  const sections = document.querySelectorAll('section[id]');

  if (sections.length && navLinks.length) {
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
    sections.forEach(s => menuObserver.observe(s));
  }


  /* ══════════════════════════════════════
     INICIALIZAÇÃO
  ══════════════════════════════════════ */
  atualizarNavbar();

}); // fim do DOMContentLoaded
