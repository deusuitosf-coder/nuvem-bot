import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/orcamento")({
  beforeLoad: () => { throw redirect({ href: "/#orcamento" }); },
});
