const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 8080;
const SECRET_KEY = 'raizes2025';

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(':memory:');

// criando as tabelas
db.serialize(() => {
  db.run(`CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT UNIQUE,
    senha_hash TEXT,
    role TEXT,
    consentimento_lgpd BOOLEAN
  )`);

  db.run(`CREATE TABLE unidades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    endereco TEXT,
    cidade TEXT,
    tipo_cozinha TEXT
  )`);

  db.run(`CREATE TABLE produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    descricao TEXT,
    sazonal BOOLEAN,
    periodo_sazonal TEXT
  )`);

  db.run(`CREATE TABLE cardapio_unidade (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_unidade INTEGER,
    id_produto INTEGER,
    preco_atual REAL,
    disponivel BOOLEAN
  )`);

  db.run(`CREATE TABLE pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER,
    id_unidade INTEGER,
    canal_pedido TEXT,
    status TEXT,
    data_hora TEXT,
    valor_total REAL
  )`);

  // inserindo dados de exemplo com senha 123456
  const hash = bcrypt.hashSync('123456', 10);
  db.run(`INSERT INTO usuarios (nome, email, senha_hash, role, consentimento_lgpd) VALUES 
    ('Cliente Teste', 'cliente@email.com', ?, 'CLIENTE', 1)`, [hash]);

  db.run(`INSERT INTO unidades (nome, endereco, cidade, tipo_cozinha) VALUES 
    ('Recife - Boa Viagem', 'Av. Boa Viagem, 1000', 'Recife', 'completa')`);

  db.run(`INSERT INTO produtos (nome, descricao, sazonal, periodo_sazonal) VALUES 
    ('Tapioca de Carne Seca', 'Tapioca recheada com carne seca', 0, '')`);

  db.run(`INSERT INTO cardapio_unidade (id_unidade, id_produto, preco_atual, disponivel) VALUES 
    (1, 1, 12.90, 1)`);
});

// ROTA DE LOGIN com validacao de senha
app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body;

  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, usuario) => {
    if (err) {
      return res.status(500).json({ erro: 'erro no servidor' });
    }
    if (!usuario) {
      return res.status(401).json({ erro: 'email ou senha invalidos' });
    }

    const senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'email ou senha invalidos' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      SECRET_KEY,
      { expiresIn: '2h' }
    );
    res.json({ accessToken: token, role: usuario.role });
  });
});

// ENDPOINTS
app.get('/api/unidades', (req, res) => {
  db.all('SELECT * FROM unidades', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/cardapio', (req, res) => {
  const unidadeId = req.query.unidadeId;
  db.all(`
    SELECT p.id as id_produto, p.nome, c.preco_atual as preco, c.disponivel 
    FROM cardapio_unidade c
    JOIN produtos p ON c.id_produto = p.id
    WHERE c.id_unidade = ?`, [unidadeId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/pedidos', (req, res) => {
  const { canalPedido, id_unidade, itens } = req.body;
  const status = 'AGUARDANDO_PAGAMENTO';
  const data_hora = new Date().toISOString();
  const valor_total = itens.reduce((sum, item) => sum + (item.quantidade * 10), 0);

  db.run(`INSERT INTO pedidos (id_cliente, id_unidade, canal_pedido, status, data_hora, valor_total)
          VALUES (1, ?, ?, ?, ?, ?)`,
    [id_unidade, canalPedido, status, data_hora, valor_total],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id_pedido: this.lastID, status, valor_total });
    });
});

app.post('/api/pagamentos/mock', (req, res) => {
  const { id_pedido, valor } = req.body;
  const aprovado = Math.random() > 0.2;
  if (aprovado) {
    res.json({ status: 'APROVADO', transacaoId: 'mock_' + Date.now() });
  } else {
    res.status(400).json({ status: 'RECUSADO', motivo: 'saldo insuficiente' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});