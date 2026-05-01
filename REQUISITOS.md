# REQUISITOS DO SISTEMA - RAÍZES DO NORDESTE

## REQUISITOS FUNCIONAIS (RF)

### RF01 - Cadastro e Autenticação de Usuários
O sistema deve permitir cadastro de usuários com nome, email e senha (hash). Deve haver perfis: CLIENTE, ATENDENTE, COZINHA, GERENTE, ADMIN. Autenticação via JWT.

### RF02 - Gestão de Unidades
O sistema deve permitir cadastrar, listar e consultar unidades da rede (nome, endereço, cidade, tipo de cozinha: completa/reduzida).

### RF03 - Cardápio por Unidade
O sistema deve permitir que cada unidade tenha seu próprio cardápio (produtos com nome, descrição, preço, disponibilidade sazonal – ex: período junino).

### RF04 - Gestão de Pedidos (fluxo principal)
O sistema deve permitir:
- Criar pedido com itens (produtoId, quantidade, preço unitário)
- Registrar canal de origem (APP, TOTEM, BALCAO, PICKUP, WEB) → obrigatório pelo roteiro
- Atualizar status do pedido (AGUARDANDO_PAGAMENTO, PAGO, EM_PREPARO, PRONTO, ENTREGUE, CANCELADO)
- Cancelar pedido
- Consultar pedidos por unidade, canal, status, período

### RF05 - Controle de Estoque
O sistema deve controlar estoque por unidade (entrada/saída de produtos). Deve impedir venda se produto estiver indisponível ou quantidade insuficiente.

### RF06 - Programa de Fidelização
O sistema deve permitir:
- Cliente acumular pontos por valor gasto
- Consultar saldo de pontos
- Resgatar pontos (desconto/prêmio)
- Registrar consentimento LGPD para participação

### RF07 - Promoções e Campanhas
O sistema deve permitir cadastrar promoções (ex: % de desconto, data válida, produtos aplicáveis). (Implementação mínima: regra/documentada)

### RF08 - Integração com Pagamento (Mock)
O sistema deve solicitar pagamento a um serviço externo simulado (mock). Deve receber confirmação ou recusa e atualizar status do pedido.

### RF09 - Multicanais (obrigatório)
Todo pedido deve armazenar o campo `canalPedido`. A API deve permitir filtrar pedidos por canal via query param.

### RF10 - Auditoria e Logs
O sistema deve registrar logs de ações sensíveis: criação de pedido, alteração de status, cancelamento, acesso a dados pessoais.