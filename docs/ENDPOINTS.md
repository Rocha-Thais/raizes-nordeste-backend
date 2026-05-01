# ENDPOINTS DA API - RAÍZES DO NORDESTE

## Padrões gerais
- Base URL: `http://localhost:8080/api`
- Autenticação: JWT via header `Authorization: Bearer <token>`
- Erro padrão:
```json
{
  "timestamp": "2025-01-01T10:00:00",
  "status": 400,
  "error": "Mensagem descritiva",
  "path": "/rota"
}

1. Autenticação
1.1 Login
Método: POST

Rota: /auth/login

Autenticação: Não

Request:

{
  "email": "cliente@email.com",
  "senha": "123456"
}

Response (200):

{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "role": "CLIENTE"
}

2. Unidades
2.1 Listar unidades
Método: GET

Rota: /unidades

Autenticação: Sim (qualquer role)

Response (200):

[
  {
    "id_unidade": 1,
    "nome": "Recife - Boa Viagem",
    "cidade": "Recife",
    "tipo_cozinha": "completa"
  }
]

3. Cardápio
3.1 Listar cardápio por unidade
Método: GET

Rota: /cardapio?unidadeId={id}

Autenticação: Sim (qualquer role)

Response (200):

[
  {
    "id_produto": 10,
    "nome": "Tapioca de Carne Seca",
    "preco": 12.90,
    "disponivel": true
  }
]

4. Pedidos
4.1 Criar pedido
Método: POST

Rota: /pedidos

Autenticação: Sim (CLIENTE, ATENDENTE)

Request:

{
  "canalPedido": "APP",
  "id_unidade": 1,
  "itens": [
    { "id_produto": 10, "quantidade": 2 },
    { "id_produto": 5, "quantidade": 1 }
  ]
}

Response (201):

{
  "id_pedido": 101,
  "status": "AGUARDANDO_PAGAMENTO",
  "valor_total": 45.70
}

4.2 Consultar pedidos por canal
Método: GET

Rota: /pedidos?canalPedido=APP&status=PAGO

Autenticação: Sim (GERENTE, ADMIN)

Response (200): Lista de pedidos

4.3 Atualizar status do pedido
Método: PATCH

Rota: /pedidos/{id}/status

Autenticação: Sim (COZINHA, ATENDENTE)

Request:

{ "status": "PRONTO" }

Response (200): Pedido atualizado

5. Pagamento (Mock)
5.1 Processar pagamento
Método: POST

Rota: /pagamentos/mock

Autenticação: Sim (CLIENTE)

Request:

{
  "id_pedido": 101,
  "valor": 45.70
}

Response (200) aprovado:

{ "status": "APROVADO", "transacaoId": "mock_123" }

Response (400) recusado:

{ "status": "RECUSADO", "motivo": "saldo insuficiente" }

6. Fidelidade
6.1 Consultar pontos
Método: GET

Rota: /fidelidade/pontos

Autenticação: Sim (CLIENTE)

Response (200):

{ "pontos_totais": 150, "pontos_resgatados": 30 }

6.2 Resgatar pontos
Método: POST

Rota: /fidelidade/resgatar

Autenticação: Sim (CLIENTE)

Request:

{ "pontos": 50 }

Response (200):

{ "desconto": 5.00, "novo_saldo": 100 }

Códigos de status usados
200 OK

201 Criado

400 Requisição inválida

401 Não autenticado

403 Sem permissão

404 Não encontrado

409 Conflito (ex: estoque insuficiente)

422 Dados inválidos

