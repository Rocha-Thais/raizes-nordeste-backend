# ENDPOINTS DA API

(Contratos básicos - versão resumida)

## Padrões
- URL base: http://localhost:8080/api
- Autenticação: usar token JWT no header
- Erro padrão: { "erro": "mensagem", "status": 400 }

## Autenticação
POST /auth/login
{ "email": "cliente@email.com", "senha": "123456" }
Resposta: { "token": "abc123...", "perfil": "CLIENTE" }

## Unidades
GET /unidades  
Lista todas as unidades

## Cardápio
GET /cardapio?unidadeId=1  
Lista produtos da unidade

## Pedidos
POST /pedidos  
{ "canalPedido": "APP", "id_unidade": 1, "itens": [{"id_produto": 10, "quantidade": 2}] }

GET /pedidos?canalPedido=APP  
Filtrar por canal

PATCH /pedidos/{id}/status  
{ "status": "PRONTO" }

## Pagamento (mock)
POST /pagamentos/mock  
{ "id_pedido": 101, "valor": 45.70 }

Pode retornar aprovado (200) ou recusado (400)

## Fidelidade
GET /fidelidade/pontos  
{ "pontos": 150 }

POST /fidelidade/resgatar  
{ "pontos": 50 }

## Status HTTP usados
200, 201, 400, 401, 403, 404, 409, 422