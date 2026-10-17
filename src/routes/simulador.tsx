import { createFileRoute } from "@tanstack/react-router";
import { DecisionSim } from "@/components/decision-sim";

export const Route = createFileRoute("/simulador")({ component: DecisionSim });
