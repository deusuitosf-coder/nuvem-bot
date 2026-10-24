import { createFileRoute } from "@tanstack/react-router";
import { AccountAccess } from "@/components/account-access";

export const Route = createFileRoute("/conta")({
  head: () => ({ meta: [{ title: "Minha conta e projetos — Nuven Bot" }] }),
  component: AccountAccess,
});
