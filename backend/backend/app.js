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

// funcao padrao pra errors (feito em 03/05)
function erroPadrao(res, status, mensagem) {
  return res.status(status).json({
    erro: mensagem,
    status: status,
    timestamp: new Date().toISOString()
  });
}

// criando as tabelas (feito em 01/05)
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

// MIDDLEWARE PRA VALIDAR TOKEN - adicionado em 02/05
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return erroPadrao(res, 401, 'token nao informado');
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return erroPadrao(res, 403, 'token invalido ou expirado');
    }
    req.usuario = decoded;
    next();
  });
}

// funcao pra verificar se o usuario é admin - feito em 03/05
function verificarAdmin(req, res, next) {
  if (req.usuario.role !== 'ADMIN') {
    return erroPadrao(res, 403, 'acesso negado - precisa ser admin');
  }
  next();
}

// ROTA DE LOGIN COM VALIDACAO DE SENHA E LOG
app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body;

  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, usuario) => {
    if (err) {
      return erroPadrao(res, 500, 'erro no servidor');
    }
    if (!usuario) {
      console.log(`[LOG] Login FALHOU - email nao encontrado: ${email} - ${new Date().toISOString()}`);
      return erroPadrao(res, 401, 'email ou senha invalidos');
    }

    const senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);
    if (!senhaValida) {
      console.log(`[LOG] Login FALHOU - senha incorreta para: ${email} - ${new Date().toISOString()}`);
      return res.status(401).json({ erro: 'email ou senha invalidos' });
    }

    console.log(`[LOG] Login SUCESSO: ${email} - ${new Date().toISOString()}`);

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      SECRET_KEY,
      { expiresIn: '2h' }
    );
    res.json({ accessToken: token, role: usuario.role });
  });
});

// ENDPOINTS PROTEGIDOS COM MIDDLEWARE E LOGS

app.get('/api/unidades', verificarToken, verificarAdmin, (req, res) => {
  db.all('SELECT * FROM unidades', [], (err, rows) => {
    if (err) return erroPadrao(res, 500, err.message);
    res.json(rows);
  });
});

app.get('/api/cardapio', verificarToken, (req, res) => {
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

app.post('/api/pedidos', verificarToken, (req, res) => {
  const { canalPedido, id_unidade, itens } = req.body;
  const status = 'AGUARDANDO_PAGAMENTO';
  const data_hora = new Date().toISOString();
  const valor_total = itens.reduce((sum, item) => sum + (item.quantidade * 10), 0);

  console.log(`[LOG] Pedido criado por ${req.usuario.email} | canal: ${canalPedido} | unidade: ${id_unidade} - ${new Date().toISOString()}`);

  db.run(`INSERT INTO pedidos (id_cliente, id_unidade, canal_pedido, status, data_hora, valor_total)
          VALUES (1, ?, ?, ?, ?, ?)`,
    [id_unidade, canalPedido, status, data_hora, valor_total],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id_pedido: this.lastID, status, valor_total });
    });
});

app.post('/api/pagamentos/mock', verificarToken, (req, res) => {
  const { id_pedido, valor } = req.body;
  const aprovado = Math.random() > 0.2;
  if (aprovado) {
    console.log(`[LOG] Pagamento APROVADO | pedido ${id_pedido} | valor ${valor} - ${new Date().toISOString()}`);
    res.json({ status: 'APROVADO', transacaoId: 'mock_' + Date.now() });
  } else {
    console.log(`[LOG] Pagamento RECUSADO | pedido ${id_pedido} | valor ${valor} - ${new Date().toISOString()}`);
    return erroPadrao(res, 400, 'pagamento recusado - saldo insuficiente');
  }
});

// ENDPOINT PRA LISTAR PEDIDOS COM FILTRO POR CANAL
// feito em 03/05 - Thais
app.get('/api/pedidos', verificarToken, (req, res) => {
  const canal = req.query.canalPedido;
  let sql = 'SELECT * FROM pedidos';
  let params = [];

  if (canal) {
    sql += ' WHERE canal_pedido = ?';
    params.push(canal);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      return erroPadrao(res, 500, 'erro ao buscar pedidos');
    }
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});