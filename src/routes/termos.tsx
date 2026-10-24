import { createFileRoute } from "@tanstack/react-router";
import { InformationPage } from "@/components/site-information";

export const Route = createFileRoute("/termos")({ head: () => ({ meta: [{ title: "Termos de uso — Nuven Bot" }] }), component: Terms });
function Terms() {
  return <InformationPage title="Termos de uso">
    <p>Condições de funcionamento do Nuven Bot. Atualização: 24 de outubro de 2026.</p>
    <section><h2 className="text-xl font-medium text-navy">Uso do aplicativo</h2><p className="mt-2">O Nuven Bot ajuda a organizar notas, projetos, documentos e cenários. Utilize apenas conteúdo que você tenha autorização para processar. Proteja sua senha e confira os e-mails e permissões antes de compartilhar um projeto. Não tente acessar contas de outras pessoas, explorar falhas ou contornar limites de consumo.</p></section>
    <section><h2 className="text-xl font-medium text-navy">Demonstrações e IA</h2><p className="mt-2">As simulações são demonstrativas: não preveem o mercado nem garantem resultados. Respostas de IA podem conter erros e precisam ser conferidas. A disponibilidade de análise depende do provedor, da confirmação da conta e das cotas aplicáveis. Os limites aparecem nas telas correspondentes.</p></section>
    <section><h2 className="text-xl font-medium text-navy">Orçamentos e pagamentos</h2><p className="mt-2">Um rascunho de orçamento não confirma contratação nem pagamento. Confira escopo, preço e condições antes de aprovar um pedido. As condições de entrega, cancelamento e eventual reembolso precisam ser informadas no atendimento antes da contratação. Para dúvidas sobre um pedido, entre em contato; esta página não restringe direitos previstos em lei.</p></section>
    <section><h2 className="text-xl font-medium text-navy">Salvamento e disponibilidade</h2><p className="mt-2">O quadro local e os projetos da conta têm formas diferentes de armazenamento. Use a exportação para guardar uma cópia dos projetos importantes. O arquivo JSON exportado contém o quadro, não as contas, senhas ou permissões. Interrupções de rede e manutenção podem afetar o serviço; não há garantia publicada de disponibilidade ou prazo de recuperação.</p></section>
    <p>Atendimento: <a className="break-all text-sky underline" href="mailto:contato@nuvembot.net">contato@nuvembot.net</a>. Consulte também a <a className="text-sky underline" href="/privacidade">página de privacidade</a>.</p>
  </InformationPage>;
}
