# Nuvem Bot — conclusão operacional

Atualização de 22/10/2026 (horário do Brasil). Código-base: 3417c41, incluindo alterações recentes da colaboração, conta, documentos e segurança. Não restaurar os ZIPs antigos sobre esta versão.

## Concluído e verificado nesta rodada

1. Acrescentado limite global persistente de IA no banco: 1.000 tentativas por mês UTC e 20 por minuto para todo o aplicativo. As cotas anteriores por conta continuam valendo. Tentativas que falham também contam no teto global para evitar repetição abusiva; as cotas individuais seguem a regra existente.
2. Configuração protegida em nuven_private.service_limits. Clientes autenticados e anônimos não podem ler/alterar a tabela diretamente. Zero interrompe novas tentativas; ausência de configuração bloqueia uso. Não foi alterado nenhum segredo nem switch de ativação da IA.
3. Índice de data e trava transacional evitam que solicitações simultâneas ultrapassem a contagem. Não é um teto de dinheiro em reais: preços, modelo, tamanho de texto, taxas e chamadas fora deste aplicativo continuam relevantes.
4. Teste transacional real no Supabase passou: limite mensal, limite por minuto, reserva permitida, esgotamento e proteção da configuração. Toda a massa de teste e alterações de teste foram revertidas; nenhuma conta de teste ficou criada.
5. Teste real de colaboração no PostgreSQL passou: dono, editor, leitor, isolamento de estranho, revogação e reversão integral após conflito. Isso testa banco/permissões, sem simular login real nem comprovar entrega multiusuário pelo websocket.
6. TypeScript, 198 testes de scripts, 61 testes de infraestrutura, 45 testes de produto e compilação de produção passaram: 304 testes. Ambiente local Node 24; runtime do projeto declara Node 22.
7. Preparado monitor de páginas públicas via GitHub Actions, duas verificações por hora. Não faz login, envia e-mail, lê projetos privados ou usa IA paga. A execução inicial foi testada separadamente; a agenda só entra em vigor depois de publicada na branch padrão. Alertas dependem das notificações de Actions configuradas na conta GitHub; não foi configurado um serviço externo de alertas.
8. DNS preservado conforme orientação do proprietário: não contratar nem modificar registros. E-mail profissional adiado.

## Ativação externa que ainda impede comprovação comercial completa

- DeepSeek: cadastrar DEEPSEEK_API_KEY, NUVEN_AI_PROVIDER=deepseek e ativar NUVEN_AI_ENABLED nos secrets do Supabase. Os tools disponíveis não permitem inserir um segredo fornecido por um canal seguro; nenhuma chave deve ser enviada pelo chat. Após configuração, testar uma chamada real e saldo.
- E-mail transacional: verificar configurações Auth e SMTP, redirecionamentos e entrega de cadastro/recuperação com duas contas de teste consentidas. Não foi contratado e-mail profissional.
- Pagamentos: configurar conta recebedora Stripe, credenciais de teste e webhook; executar checkout, rejeição de assinatura, repetição, reconciliação e eventual reembolso. Assinatura mensal/cancelamento não são o checkout avulso atual. Não habilitar cobrança real sem validar a operação e política de atendimento.
- Backup: confirmar o plano e a retenção do banco, criar restauração de teste fora da produção. Exportação JSON já disponível não substitui essa operação. Nenhuma restauração de produção foi executada.
- Teste final real de duas contas/dispositivos e websocket, acessibilidade em dispositivo real, revisão ampliada de segurança e operação. Testes automatizados não garantem imunidade contra ataques.
- Depoimentos só podem ser publicados depois de recebidos de clientes reais com autorização; não criar relatos ou avaliações fictícios.
- Termos, privacidade, cancelamento e identificação do responsável precisam refletir dados e políticas reais do negócio. Não inventar CNPJ, endereço, telefone, conta recebedora ou perfis sociais.

## Roteiro para incidente

Se houver abuso de IA, definir ambos os limites globais como zero pelo painel administrativo e desativar NUVEN_AI_ENABLED nos secrets. Preservar logs e identificar a causa antes de reativar. Se houver chave exposta, revogá-la no provedor e cadastrar uma substituta no painel seguro. Se houver problema de acesso, revogar o compartilhamento e conferir as sessões sem apagar os projetos. Antes de restaurar dados, guardar o estado atual e testar a recuperação numa cópia isolada.
