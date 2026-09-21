import type { Metadata } from "next";
import ProgramPage from "@/components/ProgramPage";
import { SHOW_PERSONAL_INFO } from "@/lib/personalInfo";

export const metadata: Metadata = SHOW_PERSONAL_INFO
  ? {
      title: "Programma — Bob van Boekel",
      description: "Politiek programma van Bob van Boekel.",
    }
  : {
      title: "Programma",
      description: "Politiek programma.",
    };

export default function Program() {
  return <ProgramPage />;
}
