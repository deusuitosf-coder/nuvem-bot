# Nuvem Bot — correções e limites desta entrega

Base preservada: commit 609d9dd do repositório atual. O ZIP antigo não foi usado para substituir o projeto. A conexão com a API de IA ficou fora desta rodada, a pedido do responsável.

## Correções aplicadas

- Reenvio de confirmação de cadastro, com tratamento de erro e sem revelar se um e-mail existe.
- Recuperação de senha passa a reconhecer respostas de erro do serviço; mudança de senha libera a interface após falhas de rede.
- Compartilhamento com papel de leitor ou editor. Novos convites começam em somente leitura; convites existentes mantêm edição. As restrições são impostas no banco, inclusive em chamadas diretas à API.
- Salvamento de comandos compostos por uma função transacional: uma atualização desatualizada desfaz também as inserções do mesmo comando. Não há mais sequência de gravações parcialmente concluídas pelo editor.
- Recuperação da sincronização ao voltar à janela ou reconectar, consulta de segurança a cada 15 segundos e indicação de interrupção do canal ao vivo. Revogação é conferida nas consultas; dados já visualizados/exportados não podem ser recolhidos.
- Paginação para não truncar silenciosamente projetos com mais de 1.000 elementos. O limite total continua em 2.000.
- Tratamento de falhas ao conceder e retirar acesso, preservando o comando não salvo para nova tentativa.
- Rota `/orcamento` redireciona à seção de orçamento existente.

## Validação

- TypeScript, compilação de produção e os 298 testes existentes passaram.
- `supabase/collaboration.sql` aplicado ao banco conectado; não removeu quadros, notas nem contas existentes.
- `supabase/collaboration-test.sql` passou no PostgreSQL real, com RLS: dono/editor podem gravar; leitor não pode inserir, atualizar, apagar ou elevar sua permissão; estranho não lê; editor revogado perde acesso; um conflito desfaz todas as alterações do comando. Todos os dados de teste foram revertidos ao final.
- Teste de interface da compilação de produção passou em 1.280 e 390 px: autenticação simulada, projetos isolados, comando via RPC, convite de leitura, revogação, recuperação após erro de envio, reenvio de confirmação, TXT/PDF e IA desativada. São respostas simuladas para testar a interface, não cadastro ou entrega de e-mail reais.
- Página inicial renderizou nas duas larguras, sem erro JavaScript não tratado nem rolagem horizontal; capturas inspecionadas. O verificador geral não ficou inteiramente verde: houve falhas de carregamento de recursos externos e aviso preexistente de cartão social ausente. Não representam aprovação integral.
- Antes da publicação desta rodada, as sete páginas principais do domínio público responderam HTTP 200. O serviço Auth informou cadastro e e-mail habilitados, com confirmação obrigatória. Isso não comprova entrega SMTP.
- Node usado na verificação: 24; o projeto declara Node 22. O servidor de desenvolvimento foi limitado pelo ambiente de execução; a verificação visual usou a compilação de produção.

## Pendências externas e de lançamento

1. API de IA: chave e ativação, deixadas pendentes conforme solicitado.
2. E-mail: configurar/verificar o remetente SMTP e concluir cadastro, confirmação e recuperação com uma conta real de teste. Nenhum e-mail foi enviado nesta rodada.
3. Pagamentos: credenciais da conta recebedora e testes Stripe em ambiente de teste, incluindo webhook, eventos duplicados, conciliação e cancelamento. O produto atual vende serviço avulso; assinatura mensal não está implementada nem foi anunciada como pronta.
4. Colaboração: concluir teste ponta a ponta de duas contas autenticadas e entrega real de eventos ao vivo; o banco e a interface foram testados separadamente.
5. Operação: configurar e testar monitoramento, alertas e restauração de backup do banco; exportação JSON não substitui backup operacional. Conferir políticas comerciais e atendimento antes de vender.
6. Publicação: confirmar que o pipeline instalou esta revisão no domínio público. Código salvo no GitHub não é prova de implantação.

Não declarar “tudo concluído”, “sem erros” ou “todos os ataques testados”. O auditor do banco ainda informa uma tabela privada de limites sem políticas; RLS permanece ligado. Não se trata de certificação de segurança.

## Segunda conferência — segurança das dependências e crédito público

- O CI revelou alerta alto no Vite 8.3.1. A dependência foi fixada em 8.3.3, com lockfile atualizado. `npm audit --omit=dev --audit-level=high` passou e informou zero vulnerabilidades nessa consulta. Isso não é garantia de ausência de falhas.
- Os 298 testes, TypeScript e compilação passaram novamente após essa atualização.
- A verificação ampliada do navegador passou para quadro local (criar, reabrir, exportar, importar e rejeitar backup inválido), página inicial, navegação, orçamentos e projetos da conta em 1.280 e 390 px. A análise de segurança local passou para cabeçalhos HTTP, conteúdo malicioso importado como texto, bloqueio de eventos inline e bloqueio de enquadramento externo.
- O rodapé passou a informar “Desenvolvido com apoio do ChatGPT”, conforme pedido. Isso descreve apoio no desenvolvimento e não indica endosso da OpenAI.
- A atualização permanece na proposta nº 6 até autorização de integração na versão principal e confirmação dos checks remotos.
