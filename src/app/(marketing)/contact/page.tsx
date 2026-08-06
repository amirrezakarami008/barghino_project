import { ContactPageContent } from "@/features/marketing/components/ContactPageContent";
import { CONTACT_PAGE } from "@/features/marketing/constants/pages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: CONTACT_PAGE.meta.title,
  description: CONTACT_PAGE.meta.description,
};

export default function ContactPage() {
  return <ContactPageContent />;
}
