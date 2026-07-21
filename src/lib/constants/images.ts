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
  contact: img("contact.jpg"),
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
