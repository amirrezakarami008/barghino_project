import { Button, LinkArrow } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Interactive";
import { BlogCard } from "@/components/ui/Interactive";
import { SectionHeader } from "@/components/ui/Section";
import { BLOG_POSTS, FAQ_ITEMS } from "@/lib/constants";

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
              description="رایج‌ترین سوالات درباره خدمات و فرایند خرید برق."
              align="start"
              compact
            />
            <Accordion items={FAQ_ITEMS} />
          </div>

          <div>
            <SectionHeader
              badge="مجله برق ما"
              title="آخرین مقالات"
              description="روندها و راهکارهای بازار برق."
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
