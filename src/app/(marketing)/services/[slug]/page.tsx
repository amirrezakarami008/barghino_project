import { ServiceDetailTemplate } from "@/features/marketing/components/ServiceDetailTemplate";
import { getAllServiceSlugs, getServiceDetail } from "@/features/marketing/constants";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceDetail(slug);
  if (!service) return { title: "خدمت یافت نشد" };

  return {
    title: service.title,
    description: service.overview,
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = getServiceDetail(slug);

  if (!service) notFound();

  return <ServiceDetailTemplate service={service} />;
}
