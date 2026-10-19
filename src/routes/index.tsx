import { createFileRoute } from "@tanstack/react-router";
import { NuvenHome } from "@/components/nuven-home";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Nuven Bot — explore sua ideia antes de investir" }] }),
  component: NuvenHome,
});
