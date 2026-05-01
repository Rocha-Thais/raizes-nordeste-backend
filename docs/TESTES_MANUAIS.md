# Evidencias de Testes - API Raizes do Nordeste

Testei no meu computador com o node rodando.

## Ambiente
- Localhost:8080
- Banco SQLite em memoria (só pra teste)

## Teste 1 - Listar unidades
GET /api/unidades  
Funcionou: apareceu a unidade de Recife que eu cadastrei.

## Teste 2 - Cardapio por unidade
GET /api/cardapio?unidadeId=1  
Deu certo, mostrou a tapioca de carne seca.

## Teste 3 - Criar pedido (POST)
Testei pelo terminal porque o navegador nao deixa. O endpoint existe e retorna id_pedido.

## Teste 4 - Pagamento mock
POST /api/pagamentos/mock  
As vezes aprova, as vezes recusa (fiz um random). Funciona.

## Conclusão
A API ta rodando. Os endpoints principais tão ok. Deu pra testar sem grandes problemas.