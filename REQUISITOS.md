# REQUISITOS DO SISTEMA - RAÍZES DO NORDESTE

(versão simplificada e resumida)

## REQUISITOS FUNCIONAIS (o que o sistema faz)

RF01 - O usuario pode se cadastrar e fazer login (com email e senha). Tem perfis: cliente, atendente, cozinha, gerente e admin.

RF02 - O gerente pode cadastrar as unidades da rede (nome, endereço, cidade, tipo de cozinha).

RF03 - Cada unidade tem seu proprio cardapio. Produtos podem ser sazonais (ex: periodo junino).

RF04 - O cliente faz pedido pelo APP, totem ou balcão. O pedido tem status (esperando pagamento, pago, preparando, pronto, entregue, cancelado). O pedido guarda o canal de origem (APP, TOTEM, BALCAO...).

RF05 - Controle de estoque por unidade. Se não tem estoque, não vende.

RF06 - Programa de fidelidade: acumula pontos por valor gasto. Precisa do consentimento do cliente (LGPD).

RF07 - Promoções podem ser cadastradas (ex: desconto em datas especiais).

RF08 - Pagamento é terceirizado (mock). A gente só recebe aprovado ou recusado.

RF09 - Todo pedido registra o canal (multicanais). Dá pra filtrar por canal na consulta.

RF10 - Logs de ações importantes: criar pedido, cancelar, alterar status.

## REQUISITOS NÃO FUNCIONAIS (qualidades)

- Senhas em hash (bcrypt)
- Login com JWT
- Cada perfil tem sua permissão (ex: cliente não vê estoque)
- LGPD: consentimento guardado
- Disponibilidade alta em horários de pico
- Resposta da API em menos de 2 segundos
- Se o pagamento mock falhar, o pedido não é cancelado automaticamente
- Documentação com Swagger e Postman (simplificado)
- Código organizado em camadas (API, Application, Domain, Infrastructure)


## Priorização e Justificativa (feito em 03/05)

Nem todos os requisitos foram implementados completamente por causa do tempo. Eu priorizei o que era mais importante pro negócio:

- **Fluxo de pedido com pagamento mock**: foi priorizado porque é o coração do sistema. Sem ele a lanchonete não funciona.
- **LGPD e consentimento**: coloquei como prioridade porque a empresa pediu explicitamente no estudo de caso.
- **Multicanais (canalPedido)**: implementei porque é obrigatório no roteiro e dá pra rastrear de onde vem o pedido.
- **Autenticação JWT e logs**: fiz o mínimo mas funcionam. Os logs ajudam na auditoria.
- **Estoque**: ficou simples (só impede venda se não tiver). Não deu tempo de fazer entrada/saída completa.
- **Fidelidade**: modelei no DER e nas classes, mas não implementei os endpoints. Ficou como melhoria futura.

