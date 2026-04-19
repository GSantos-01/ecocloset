
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ecocloset_secret_dev';

// ─── Middlewares ───────────────────────
app.use(cors({
  origin: [
    'http://localhost:5500',        // Live Server do VS Code
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'https://gsantos-01.github.io', // GitHub Pages
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ─── Banco de dados simples (JSON) ─────
// Em produção, substituir por PostgreSQL, MySQL, etc.
const DB_PATH = path.join(__dirname, 'db.json');

function lerDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ usuarios: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function salvarDB(dados) {
  fs.writeFileSync(DB_PATH, JSON.stringify(dados, null, 2));
}

// ─── Middleware de autenticação ────────
function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (err) {
    return res.status(403).json({ erro: 'Token inválido ou expirado.' });
  }
}

// ══════════════════════════════════════
//   ROTAS
// ══════════════════════════════════════

// ─── GET / (teste) ────────────────────
app.get('/', (req, res) => {
  res.json({
    app: '🌿 EcoCloset API',
    versao: '1.0.0',
    status: 'online',
    rotas: {
      'POST /api/cadastro': 'Cria uma nova conta',
      'POST /api/login':    'Faz login e retorna token',
      'GET  /api/perfil':   'Retorna dados do usuário logado (requer token)',
    }
  });
});

// ─────────────────────────────────────
//   POST /api/cadastro
//   Corpo esperado: { nome, email, senha }
// ─────────────────────────────────────
app.post('/api/cadastro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Validações básicas
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ erro: 'E-mail inválido.' });
    }

    // Verifica se e-mail já está cadastrado
    const db = lerDB();
    const emailJaExiste = db.usuarios.find(u => u.email === email.toLowerCase());
    if (emailJaExiste) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    // Hash da senha (nunca salvar senha em texto puro!)
    const senhaHash = await bcrypt.hash(senha, 10);

    // Cria o novo usuário
    const novoUsuario = {
      id:         Date.now().toString(),
      nome:       nome.trim(),
      email:      email.toLowerCase().trim(),
      senha:      senhaHash,
      conquistas: [],
      criadoEm:   new Date().toISOString(),
    };

    db.usuarios.push(novoUsuario);
    salvarDB(db);

    // Gera token JWT
    const token = jwt.sign(
      { id: novoUsuario.id, email: novoUsuario.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retorna sem expor a senha
    res.status(201).json({
      mensagem: 'Conta criada com sucesso! 🌿',
      token,
      usuario: {
        id:    novoUsuario.id,
        nome:  novoUsuario.nome,
        email: novoUsuario.email,
      }
    });

  } catch (err) {
    console.error('Erro no cadastro:', err);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

// ─────────────────────────────────────
//   POST /api/login
//   Corpo esperado: { email, senha }
// ─────────────────────────────────────
app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    // Busca o usuário pelo e-mail
    const db = lerDB();
    const usuario = db.usuarios.find(u => u.email === email.toLowerCase().trim());

    if (!usuario) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    // Compara a senha com o hash
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    // Gera token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      mensagem: `Bem-vindo de volta, ${usuario.nome}! 🌿`,
      token,
      usuario: {
        id:    usuario.id,
        nome:  usuario.nome,
        email: usuario.email,
      }
    });

  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

// ─────────────────────────────────────
//   GET /api/perfil  (rota protegida)
//   Requer header: Authorization: Bearer TOKEN
// ─────────────────────────────────────
app.get('/api/perfil', autenticar, (req, res) => {
  const db = lerDB();
  const usuario = db.usuarios.find(u => u.id === req.usuario.id);

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  res.json({
    usuario: {
      id:          usuario.id,
      nome:        usuario.nome,
      email:       usuario.email,
      conquistas:  usuario.conquistas,
      criadoEm:    usuario.criadoEm,
    }
  });
});

// ─── 404 para rotas não encontradas ───
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// ─── Inicia o servidor ─────────────────
app.listen(PORT, () => {
  console.log(`\n🌿 EcoCloset API rodando em http://localhost:${PORT}`);
  console.log(`   Teste em: http://localhost:${PORT}/\n`);
});
