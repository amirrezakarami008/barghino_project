import { Button, LinkArrow } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { Accordion } from "@/shared/ui/Interactive";
import { BLOG_POSTS, FAQ_ITEMS } from "@/features/marketing/constants";
import Image from "next/image";
import Link from "next/link";

export function FAQBlogSection() {
  const posts = BLOG_POSTS.slice(0, 4);

  return (
    <section id="faq" className="bg-slate-50/80 py-12 sm:py-14 lg:py-16">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* سوالات — در RTL سمت راست */}
          <div>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                سوالات متداول
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                رایج‌ترین سوالات درباره فروش برق خانگی و نصب نیروگاه.
              </p>
            </div>
            <Accordion items={FAQ_ITEMS} />
          </div>

          {/* مقالات — در RTL سمت چپ */}
          <div>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                آخرین مقالات
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                راهنمای فروش برق خانگی، بورس سبز و نصب نیروگاه.
              </p>
            </div>

            <div className="space-y-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={post.href}
                  className="group flex gap-3 rounded-xl border border-slate-200/70 bg-white p-3 shadow-sm transition-all hover:border-brand-200 hover:shadow-md sm:gap-4 sm:p-3.5"
                >
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg sm:h-[4.5rem] sm:w-24">
                    <Image
                      src={post.image ?? "/images/hero-main.jpg"}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="96px"
                    />
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <span className="mb-1 inline-flex rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 ring-1 ring-brand-100 sm:text-xs">
                      {post.category}
                    </span>
                    <h3 className="line-clamp-2 font-display text-sm font-bold text-slate-900 transition-colors group-hover:text-brand-600 sm:text-base">
                      {post.title}
                    </h3>
                    <time className="mt-1 block text-xs text-slate-400">{post.date}</time>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-5">
              <Button href="/blog" variant="outline" size="sm" className="group">
                همه مقالات
                <LinkArrow />
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
