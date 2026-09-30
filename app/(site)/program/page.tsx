import type { Metadata } from "next";
import ProgramPage from "@/components/ProgramPage";

export const metadata: Metadata = {
  title: "Programma — Bob van Boekel",
  description: "Politiek programma van Bob van Boekel.",
};

export default function Program() {
  return <ProgramPage />;
}
