import { createFileRoute } from "@tanstack/react-router";
import { InformationPage } from "@/components/site-information";

export const Route = createFileRoute("/contato")({ head: () => ({ meta: [{ title: "Contato — Nuven Bot" }] }), component: Contact });
function Contact() {
  return <InformationPage title="Fale com o Nuven Bot">
    <p>Para dúvidas, problemas de acesso, orçamentos ou solicitações sobre seus dados, escreva para nosso endereço de contato.</p>
    <a className="inline-flex min-h-12 max-w-full items-center break-all rounded-xl bg-navy px-5 text-surface" href="mailto:contato@nuvembot.net">contato@nuvembot.net</a>
    <p>O botão abre seu aplicativo de e-mail. Nenhuma mensagem é enviada automaticamente pelo site.</p>
    <p>Ao relatar um erro, informe a página e o que aconteceu. Não envie senhas, chaves de API, números de cartão ou documentos sensíveis.</p>
    <p>Solicitações de acesso, correção ou exclusão de dados precisam de confirmação de identidade. Não compartilhe sua senha para fazer essa confirmação.</p>
  </InformationPage>;
}
