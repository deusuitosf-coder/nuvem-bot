# Nuvem Bot — revisão de 21/10/2026

Base preservada: GitHub main fbc33fe3e9225ff1245bc104d36dde8a49a44d0e, mais recente que nuven-bot-revisado-2026-10-21.zip. O ZIP original não foi substituído.

## Alterações desta revisão
- Cotas configuráveis por conta no banco: ideias, documentos, armazenamento JSON e operações de IA por minuto. Reservas de IA usam bloqueio transacional para impedir concorrência acima da cota.
- Padrões conservadores: 2 análises de ideias e 1 de documento por conta, sem renovação automática; 10 MiB de JSON e 5 reservas de IA por minuto. Cotas de IA são de operações, não tokens nem reais. Falhas são registradas e não consomem a cota de operações concluídas; podem ainda ter custo no provedor.
- Armazenamento aplicado por trigger no banco, inclusive quando o cliente chama a API diretamente. Até 2.000 elementos por quadro; não substitui limites de tráfego, projetos ou uploads externos.
- Painel da própria conta passa a informar uso de JSON em MB. Não representa armazenamento físico total, índices ou backups.
- Mascote original integrado ao quadro com versões WebP leves e favicon PNG. Não foi removido o fundo da imagem nem redesenhada sua identidade.
- Recuperação de senha trata falhas de rede e libera o botão ao terminar.
- Quadro local valida limites antes de alterar o estado, evitando aceitar alterações que não poderiam ser exportadas.
- Permitido o hostname exato da prévia no servidor de desenvolvimento, mantendo os demais controles.

## Testes executados
- npm test: 198 testes de scripts + 61 testes de bibliotecas, todos aprovados.
- npm run test:product: 37 testes aprovados.
- npm run typecheck: aprovado.
- npm run build: aprovado; não havia DATABASE_URL no processo local, portanto a etapa de migração desse comando foi ignorada. O banco Supabase foi verificado separadamente.
- Banco real: testes transacionais com duas identidades sintéticas confirmadas; leitura e escrita cruzadas recusadas, acesso compartilhado permitido, cota de IA bloqueada, armazenamento excedente recusado. Testado antes e após aplicar a migração nuven_account_usage_controls. Todas as identidades e dados de teste foram revertidos. Confirmado: zero usuários de teste remanescentes.
- Navegador: página inicial, quadro, conta e documentos abriram. Criação de três notas e preservação após recarregar observadas. Formulário de conta carregou. Layout desktop inspecionado. Não foi possível emular viewport móvel pelo navegador disponível; revisão em celular real pendente.
- HTTPS de https://www.nuvembot.net/conta respondeu HTTP 200. Isso não comprova login, e-mail, IA ou os novos arquivos publicados.

## O que ainda exige validação/configuração
- Confirmação de cadastro, recebimento real de e-mail, login e recuperação completos precisam de uma conta de teste com caixa de entrada acessível; nenhum e-mail foi enviado nesta execução.
- Colaboração foi validada na autorização do banco, mas não em dois navegadores autenticados com edição simultânea. O editor atual salva alterações em etapas; conflitos entre várias alterações ainda podem exigir atualização e repetição do comando.
- As funções nuven-service e nuven-stripe-webhook estão ACTIVE no Supabase. Não foram expostos segredos. Não foi feita chamada paga de IA nem teste financeiro. Configurar OPENAI_API_KEY, NUVEN_AI_MODEL e NUVEN_AI_ENABLED no servidor e então testar análise real. Não enviar chaves pelo chat.
- Pagamento atual é serviço avulso, não assinatura recorrente. Requer Stripe em modo de testes, webhook e validação de acesso após pagamento. Não ativado nesta revisão.
- Painel administrativo global e editor de cotas ainda precisam de definição de quem será administrador e implementação de autorização. Os limites podem ser configurados por administrador do banco na tabela privada; usuários comuns não podem alterá-los.
- Tokens e valores reais por operação ainda não são medidos neste painel. O controle implementado limita operações e JSON; não promete um teto financeiro global.
- Prevenção de abuso entre múltiplas contas, rate limit geral de HTTP, backup automático e monitoramento de produção precisam de validação adicional.
- Sem acesso ao painel Vercel nesta execução: plano contratado, configuração DNS e publicação exata das alterações não confirmados.

## Custos consultados em 21/10/2026 — USD
- Vercel Pro: US$20/mês de base, mais uso excedente e impostos. Hobby restrito a uso pessoal não comercial. Fontes: https://vercel.com/pricing e https://vercel.com/docs/limits/fair-use-guidelines.
- Supabase Free: US$0 dentro das cotas; 500 MB de banco e pausa após uma semana sem atividade. Pro a partir de US$25/mês. Fonte: https://supabase.com/pricing.
- Mantendo Vercel: estimativa de base US$20/mês com Supabase Free, ou US$45/mês com Supabase Pro; não inclui IA, e-mail, domínio, impostos ou excedentes. Isso é cenário, não fatura da conta.
- IA: variável conforme modelo e tokens de entrada/saída. Consultar https://developers.openai.com/api/docs/pricing antes da ativação. Não foi calculado um custo por cliente sem medição de uso.
- E-mail: serviço de envio e domínio devem ser configurados; valor depende do provedor. Não foi contratado nenhum serviço pago.

## Anúncio
Roteiro original de 30 segundos, narração textual e legendas SRT prontos em anuncio/. Link Mirror Fish não acessível; sem alegação de equivalência. MP4 e voz ainda não exportados. Anunciar apenas notas, conexões, organização local e backup já verificados; não anunciar IA, cobrança ou colaboração como validados ponta a ponta.

## Retorno à versão anterior
O commit base permanece no GitHub. Reverter apenas as alterações visuais com git revert do commit desta entrega e republicar pelo painel de hospedagem. A migração é aditiva e não excluiu dados; para remover o bloqueio de armazenamento, um administrador pode retirar somente o trigger nuven_storage_guard. Não apagar tabelas ou operações. Para recuperar os limites antigos, restaurar as definições de reserve_operation e remaining_uses do arquivo supabase/nuven_service.sql, sem executar o arquivo inteiro nem recriar tabelas existentes.
