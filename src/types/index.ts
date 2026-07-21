export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  gradient: string;
}

export type ServiceVariant =
  | "commercial"
  | "resilience"
  | "optimization"
  | "advisory"
  | "renewable";

export interface ServiceMetric {
  id: string;
  value: string;
  suffix?: string;
  label: string;
  note?: string;
}

export interface ServiceBulletItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface ServiceQuote {
  id: string;
  name: string;
  role: string;
  company?: string;
  content: string;
  rating?: number;
}

export interface ServiceCta {
  badge?: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export type ServiceCustomSection =
  | {
      id: string;
      type: "metrics";
      badge: string;
      title: string;
      description?: string;
      items: ServiceMetric[];
      tone?: "dark" | "light" | "gradient";
    }
  | {
      id: string;
      type: "feature-grid";
      badge: string;
      title: string;
      description?: string;
      items: FeatureItem[];
      background?: "default" | "muted" | "dark" | "gradient" | "mesh";
    }
  | {
      id: string;
      type: "bullet-columns";
      badge: string;
      title: string;
      description?: string;
      items: ServiceBulletItem[];
      columns?: 2 | 3;
      background?: "default" | "muted" | "dark" | "gradient" | "mesh";
    }
  | {
      id: string;
      type: "spotlight";
      badge: string;
      title: string;
      description: string;
      points: string[];
      highlight?: string;
      background?: "default" | "muted" | "dark" | "gradient" | "mesh";
    }
  | {
      id: string;
      type: "quote";
      badge: string;
      title: string;
      description?: string;
      quote: ServiceQuote;
      background?: "default" | "muted" | "dark" | "gradient" | "mesh";
    };

export interface ServiceDetail extends ServiceItem {
  variant: ServiceVariant;
  subtitle: string;
  overview: string;
  heroLabel?: string;
  heroStats?: ServiceMetric[];
  highlightPoints?: string[];
  trustPoints?: string[];
  benefits: FeatureItem[];
  process: StepItem[];
  faq: FAQItem[];
  customSections?: ServiceCustomSection[];
  relatedCta?: ServiceCta;
}

export interface PageMeta {
  title: string;
  description: string;
  badge?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ContentSection {
  id: string;
  title: string;
  paragraphs: string[];
  list?: string[];
}

export interface LandingPageContent {
  meta: PageMeta;
  hero: {
    title: string;
    highlight?: string;
    description: string;
    image?: string;
  };
  features: FeatureItem[];
  steps: StepItem[];
  sections: ContentSection[];
  faq: FAQItem[];
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "password" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
}

export interface StepItem {
  id: string;
  step: number;
  title: string;
  description: string;
}

export interface StatItem {
  id: string;
  value: string;
  suffix?: string;
  label: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  href: string;
  category: string;
  image?: string;
  author?: string;
  readTime?: string;
  content: ContentSection[];
}

export interface FooterLinkGroup {
  title: string;
  links: { label: string; href: string }[];
}

export interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  align?: "center" | "start";
  compact?: boolean;
}
