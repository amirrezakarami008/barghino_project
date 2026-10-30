import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DesignGuide } from "./design-guide";

export const metadata: Metadata = {
  title: "راهنمای طراحی",
  robots: { index: false, follow: false },
};

/** Dev-only living style guide for Solar Aurora tokens. */
export default function DesignPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <DesignGuide />;
}
