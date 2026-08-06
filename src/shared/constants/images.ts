/** تصاویر با کیفیت — منبع Unsplash، ذخیره‌شده در public/images */
const img = (filename: string) => `/images/${filename}`;

export const IMAGES = {
  hero: {
    main: img("hero-main.jpg"),
    dashboard: img("hero-dashboard.jpg"),
  },
  whyUs: img("power-plant.jpg"),
  steps: img("team-meeting.jpg"),
  stats: img("solar-panels.jpg"),
  cta: img("lightning.jpg"),
  about: {
    office: img("office.jpg"),
    team: img("team-collab.jpg"),
  },
  auth: img("hero-main.jpg"),
  contact: img("contact-hero-house.png"),
  contactPage: {
    hero: img("contact-hero-house.png"),
    faq: img("contact-faq-illustration.png"),
    headphones: img("contact-headphones.png"),
    map: img("contact-map.png"),
  },
  app: img("mobile-app.jpg"),
  services: {
    "power-supply": img("power-plant.jpg"),
    "uninterrupted-power": img("lightning.jpg"),
    optimization: img("industrial.jpg"),
    "energy-consulting": img("consulting.jpg"),
    renewable: img("solar-farm.jpg"),
  },
  landing: {
    cooler: img("hvac.jpg"),
    solar: img("solar-roof.jpg"),
    support: img("electrician.jpg"),
  },
  blog: {
    "cooler-optimization": img("hvac.jpg"),
    "industrial-energy": img("industrial.jpg"),
    "solar-system": img("solar-farm.jpg"),
    "industrial-solar": img("wind-turbines.jpg"),
    "sell-electricity-to-barghino": img("lightning.jpg"),
    "home-solar-installation-guide": img("solar-roof.jpg"),
    "green-exchange-price": img("power-plant.jpg"),
    "government-vs-barghino": img("consulting.jpg"),
    "solar-roi-payback": img("solar-panels.jpg"),
    "rooftop-assessment-checklist": img("solar-roof.jpg"),
    "solar-panel-maintenance": img("solar-farm.jpg"),
    "home-solar-documents": img("office.jpg"),
    "seasonal-solar-production": img("solar-panels.jpg"),
    "electricity-sale-contract-tips": img("team-meeting.jpg"),
    "why-home-solar-now": img("solar-roof.jpg"),
  },
  testimonials: [
    img("avatar-1.jpg"),
    img("avatar-2.jpg"),
    img("avatar-3.jpg"),
    img("avatar-4.jpg"),
  ],
} as const;

export function getServiceImage(slug: string): string {
  return IMAGES.services[slug as keyof typeof IMAGES.services] ?? IMAGES.hero.main;
}

export function getBlogImage(slug: string): string {
  return IMAGES.blog[slug as keyof typeof IMAGES.blog] ?? IMAGES.hero.main;
}
