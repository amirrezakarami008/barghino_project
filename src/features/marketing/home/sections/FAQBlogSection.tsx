import { Button, LinkArrow } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { Accordion } from "@/shared/ui/Interactive";
import { BlogCard } from "@/shared/ui/Interactive";
import { SectionHeader } from "@/shared/ui/Section";
import { BLOG_POSTS, FAQ_ITEMS } from "@/features/marketing/constants";

/** FAQ و بلاگ در یک ردیف — پر کردن فضای خالی افقی */
export function FAQBlogSection() {
  return (
    <section id="faq" className="bg-mesh-light bg-grid py-10 sm:py-12 lg:py-16">
      <Container>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12">
          <div>
            <SectionHeader
              badge="سوالات متداول"
              title="پاسخ سوالات شما"
              description="رایج‌ترین سوالات درباره فروش برق خانگی و نصب نیروگاه."
              align="start"
              compact
            />
            <Accordion items={FAQ_ITEMS} />
          </div>

          <div>
            <SectionHeader
              badge="مجله برقینو"
              title="آخرین مقالات"
              description="راهنمای فروش برق خانگی، بورس سبز و نصب نیروگاه."
              align="start"
              compact
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {BLOG_POSTS.slice(0, 4).map((post) => (
                <BlogCard key={post.id} {...post} compact />
              ))}
            </div>
            <div className="mt-6">
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
