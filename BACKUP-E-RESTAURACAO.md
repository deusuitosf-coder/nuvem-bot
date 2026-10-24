# Backup e restauração — situação verificada em 24/10/2026

## Situação real

A organização do projeto `vqcimzjyhpvdwsvronxw` está no plano gratuito. A documentação do Supabase recomenda exportação regular e cópia externa nesse plano: https://supabase.com/docs/guides/platform/backups . Não foi contratado upgrade, criado backup completo ou restaurado o banco de produção nesta revisão.

## Cópia do quadro que já existe no aplicativo

1. Entre na conta, selecione o projeto e espere o carregamento terminar.
2. Use **Exportar backup do projeto** e guarde o JSON em local privado.
3. Crie um projeto de teste separado e use **Acrescentar um backup a este projeto**.
4. Compare notas, caixas e conexões. O importador acrescenta conteúdo; não substitui os projetos existentes.
5. Esse JSON não contém contas, senhas, permissões, histórico de pagamentos, limites de uso ou arquivos do Storage. Portanto, não é um backup completo do serviço.

## Operação completa que ainda depende do acesso administrativo

1. Obter a conexão do banco em um canal seguro; nunca registrar senha ou URL com credenciais no repositório, chat ou logs.
2. Usar a versão instalada da CLI e conferir `supabase db dump --help`. Seguir o procedimento oficial: https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore . Preservar também os schemas privados do aplicativo, dados de autenticação necessários e políticas. Não considerar uma exportação apenas do schema `public` como cópia completa.
3. Guardar o dump criptografado fora da hospedagem, em armazenamento privado. Nunca usar artefatos públicos do GitHub ou commits para guardar dados de usuários.
4. Inventariar e copiar separadamente objetos do Storage, se existirem. Backup do banco inclui metadados, não os arquivos. Guardar configurações, versões das funções e referências de secrets separadamente; dumps não substituem secrets.
5. Preparar um destino isolado, confirmar que NÃO é `vqcimzjyhpvdwsvronxw` e desativar envio de e-mails, IA paga, pagamentos e tarefas externas nesse destino antes de restaurar. Não criar serviços pagos sem autorização específica.
6. Restaurar usando a documentação correspondente ao tipo de backup. Comparar contagens e relações, testar autenticação e permissões com contas de teste, testar um quadro e a integridade dos objetos. Não enviar mensagens reais durante o ensaio.
7. Registrar data, checksum, local privado da cópia, duração, ponto de recuperação e resultado de cada teste. Só declarar recuperação aprovada depois desse ensaio real.
8. Definir frequência, retenção e responsável conforme o uso. Ainda não há agendamento de backup completo, retenção aprovada nem prazo garantido de recuperação.

Não restaurar uma cópia sobre a produção para testar. Não apresentar os testes do importador JSON como teste de restauração do Supabase.
