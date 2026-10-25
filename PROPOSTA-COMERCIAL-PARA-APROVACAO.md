# Proposta comercial do Nuven Bot — para decisão do proprietário

25/10/2026. Rascunho administrativo: não é uma oferta contratada nem autorização para ativar cobranças reais. Nenhum prazo abaixo foi anunciado aos clientes como garantido. R$ 100 por serviço simples e estimativa inicial de R$ 800 para serviços personalizados já existem no código.

## Pacote sugerido de R$ 100: organizar uma ideia em um plano de ação

| Item | Proposta concreta para aprovar |
|---|---|
| Unidade | Uma ideia ou estratégia com um objetivo principal. Um objetivo adicional é outro escopo, a confirmar antes da contratação. |
| Material recebido | Um texto de até 6.000 caracteres, fornecido pelo cliente. PDF com OCR, arquivos extensos ou múltiplos documentos exigem orçamento separado. |
| Entrega | Um arquivo TXT em português, com até 800 palavras: resumo da ideia, objetivo, até cinco pontos de atenção e plano com até cinco próximos passos. Sem previsões de resultado. |
| Qualidade | Conferência do conteúdo com o material enviado. Se houver uso de IA, revisar a resposta antes da entrega; não afirmar revisão humana sem atribuir um responsável real. |
| Revisão | Sugestão: uma rodada de ajustes dentro do objetivo aprovado, solicitada em até sete dias corridos da entrega. Novo objetivo ou material adicional exige nova avaliação. Essa regra precisa de aprovação do proprietário. |
| Prazo | Sugestão para UMA unidade: até três dias úteis após material completo, confirmação das condições e pagamento. O responsável precisa confirmar capacidade e data antes da cobrança. Pedidos com várias unidades têm prazo próprio; não multiplicar ou prometer prazo automaticamente. |
| Canal | Entrega pelo canal confirmado no orçamento. A caixa de e-mail e o envio ainda precisam passar por teste real. |
| Cobrança | Pagamento avulso de R$ 100 por unidade, após aprovação do escopo. Não é assinatura nem compra automática de créditos de IA. O valor é bruto ao cliente; taxas, tributos e custos operacionais precisam ser conferidos antes de estimar quanto sobra para o negócio. |
| Fora do pacote | Pesquisa externa ampla, parecer jurídico/médico/financeiro, projeto técnico, programação, identidade visual, vídeo, imagens, atendimento contínuo, garantia de vendas ou previsão de mercado. |

O fluxo atual de pagamento não cria nem envia esse arquivo automaticamente. Antes de vender, designar quem entrega ou implementar e testar o fluxo de produção e envio. Não apresentar o chat gratuito como cumprimento automático de um serviço pago.

## Serviços personalizados: documentos, empresas e escopo complexo

Os R$ 800 são apenas referência inicial. Antes de contratar, registrar:

1. Objetivo e lista dos materiais, documentos e páginas aceitos.
2. Entregáveis, formato, quantidade e exclusões.
3. Revisões incluídas e condições para material adicional.
4. Prazo/data de entrega e quando começa a contagem.
5. Preço FINAL em reais, forma de pagamento e validade da proposta.
6. Canal de entrega e responsável pelo atendimento.
7. Condições de cancelamento e reembolso compatíveis com a operação e os direitos aplicáveis.
8. Confirmação explícita do cliente sobre essa versão da proposta.

O código atual NÃO oferece checkout automático para serviços personalizados, mesmo quando o pedido está marcado como aprovado. Não usar o valor inicial como cobrança final. Para habilitar esse caminho, ainda é necessário implementar proposta versionada com valor final, aceitação e checkout correspondente no servidor.

## Proteções e correções implementadas nesta rodada

- Pedidos novos passam a preservar a data desejada e a estimativa condicional junto ao escopo. A descrição aceita até 1.200 caracteres para caber nos 1.500 do banco sem perder os dados adicionais. Nenhum pedido antigo é reescrito e nenhuma data ausente é inventada.
- O botão de checkout aparece somente no pedido simples/padrão aprovado. Pedido recebido ou em análise explica por que ainda não pode pagar; personalizado orienta confirmar condições com atendimento; pago não oferece uma segunda cobrança.
- O servidor existente continua conferindo proprietário, conta confirmada, estado aprovado, tipo do pedido e ativação das credenciais. A página de retorno sozinha não marca o pedido como pago; isso depende do aviso validado da Stripe.
- Testes automatizados verificam preço simples, preço inicial personalizado, preservação do prazo, limites sem corte e visibilidade de checkout nos quatro estados de exemplo. Fixtures não comprovam operação financeira real.

## Pendências em ordem de execução

1. Proprietário aprovar ou ajustar este pacote, especialmente capacidade de entrega, prazo sugerido, revisão e responsável. Não há operador ou prazo real confirmado nesta proposta.
2. Informar identificação real do negócio e condições comerciais/atendimento para completar os textos do site. Não publicar dados inventados.
3. Concluir a conta Stripe com dados e conta bancária diretamente no painel seguro; eventual verificação é pessoal.
4. Configurar credenciais de TESTE e segredo do webhook diretamente nos Secrets do Supabase. Não enviar chaves ao chat ou repositório.
5. Executar teste real no ambiente de teste: aprovado, recusado, abandono, valor divergente, aviso inválido, repetição e reembolso. Conferir o pedido e o painel Stripe. Nenhuma compra foi executada nesta rodada.
6. Definir e validar a operação de entrega: produção, revisão, envio, registro e atendimento após a entrega. Pagamento confirmado não significa entrega realizada.
7. Validar SMTP, consulta real à IA e limites. Confirmar custo por entrega e capacidade antes de vender o pacote.
8. Configurar backup integral privado, restauração isolada e recebimento dos alertas. Exportação JSON de quadros não substitui backup do serviço.
9. Definir emissão de documento fiscal/recibo e procedimentos aplicáveis ao negócio com os dados reais. Não foi emitido nem prometido documento fiscal automático.
10. Para projetos personalizados, implementar o valor final versionado e a aceitação antes de adicionar pagamento automático. Para assinatura mensal, desenvolver plano, renovação, cancelamento e eventos próprios; isso não existe no checkout avulso atual.
11. Só habilitar o modo real de pagamento depois dessas validações e da decisão do proprietário. Não foram alteradas credenciais, ativação de pagamentos, dados bancários ou assinaturas.
