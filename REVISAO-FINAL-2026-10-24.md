# Revisão de interface, segurança, monitoramento e backup

Base preservada: `bac00fac9eac8e282b9395fcec5df69b435effcc`. Nenhum dado de produção, senha, chave de IA, DNS, cobrança ou plano foi alterado.

## Correções

- Zod atualizado de 4.6.5 para a versão corrigida 4.6.6 e fixado no manifesto e lockfile. O alerta GHSA-mrhx-c7xc-m3w5 bloqueava o job de qualidade. Auditoria das dependências de produção passou com zero vulnerabilidades conhecidas no momento da revisão. Isso não equivale a aprovação integral de segurança.
- Criadas páginas de contato, termos de funcionamento e privacidade. Links disponíveis em todas as páginas; contato usa `mailto:contato@nuvembot.net`, sem envio automático. Cadastro oferece links para consultar os textos.
- Oferta revisada: demonstração aberta; até dois testes de ideias e um de documento por conta confirmada, condicionados à ativação e cotas. Não anuncia previsões garantidas nem pagamento decorrente de um rascunho.
- Removida regra que impedia quebra de um título em telas estreitas. Links Entrar/Criar conta têm âncoras reais no formulário.
- Monitor ampliado de quatro para sete páginas, com repetição em falha e resumo por página no GitHub Actions. Não executa IA, cobrança ou login. Mantida agenda de duas verificações por hora, sujeita a atrasos do GitHub.
- Acrescentada auditoria pública de links, âncoras, navegação de conta e largura em 1280 e 390 pixels ao job de qualidade.

## Evidências

- TypeScript, 198 testes de scripts, 61 testes de infraestrutura, 45 testes de produto e compilação: passaram (304 testes).
- Renderização de desenvolvimento e produção: conteúdo visível nos dois tamanhos e sem divergência de baseline. Sem exceções da aplicação. O ambiente local registrou falhas de carregamento de recursos externos; não foram escondidas nem tratadas como sucesso de rede. Há nota não bloqueante da ferramenta sobre cartão social padrão.
- Páginas `/`, `/conta`, `/documentos`, `/nuvem`, `/contato`, `/termos`, `/privacidade`: HTTP 200, links internos válidos, sem estouro horizontal em 1280/390 pixels; navegação entre entrada e cadastro passou. Isso é emulação de tela, não teste físico em celular.
- Orçamento/download: passaram nos dois tamanhos.
- Quadro: criação, recarga, exportação, importação, rejeição de JSON inválido e recuperação de corrupção passaram nos dois tamanhos. Isso não testa restauração do banco Supabase.
- Segurança em navegador: cabeçalhos reais locais, escape de conteúdo malicioso importado, bloqueio de handlers inline e de enquadramento hostil passaram.
- Interface da conta: projetos, compartilhamento, PDF/TXT, bloqueio da IA não ativada e saída passaram em navegador com fixtures. Não foi realizado cadastro real nem enviado e-mail.
- Advisors Supabase: dois avisos INFO de RLS sem políticas em tabelas privadas. Verificada RLS ativa e ausência de SELECT para `anon` e `authenticated` em `nuven_private.account_limits` e `nuven_private.service_limits`; acesso fechado intencional.
- Monitor anterior: últimas execuções automáticas observadas concluíram com sucesso, incluindo https://github.com/deusuitosf-coder/nuvem-bot/actions/runs/40122269036 . Nenhum recebimento de notificação foi comprovado.

## Pendências que continuam reais

1. Banco no plano gratuito: não há comprovação de backup completo externo nem restauração isolada. Procedimento e distinção entre cópia JSON e backup integral em `BACKUP-E-RESTAURACAO.md`. Precisa de conexão administrativa segura e destino privado; não publicar dumps no GitHub nem restaurar sobre a produção.
2. Alertas: o job falha e registra o resumo quando detecta erro. O recebimento de e-mail depende das preferências de notificações de Actions da conta GitHub; esse recebimento ainda precisa ser confirmado. Não foi simulado incidente de produção.
3. Contato: link configurado; entrega e recebimento da caixa Hostinger/SMTP continuam sem teste real nesta rodada.
4. Termos e privacidade descrevem a implementação observada. Identificação jurídica completa do responsável, política operacional de retenção e condições comerciais de entrega/cancelamento ainda precisam de dados e decisão do proprietário. Não foram inventados CNPJ, endereço, prazos nem direitos adicionais de cobrança.
5. Testes reais de duas contas/dispositivos, entrega de e-mails, consulta paga à IA, pagamento de teste e restauração completa não são substituídos pelos testes com fixtures.

Instrução de notificações: na conta GitHub, abrir Settings > Notifications > Actions e habilitar avisos de execuções com falha. Conferir também Watch/participação no repositório. Não enviar senhas ou tokens ao chat.
