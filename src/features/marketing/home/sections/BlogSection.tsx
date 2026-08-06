import { Button, LinkArrow } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { BlogCard } from "@/shared/ui/Interactive";
import { Section, SectionHeader } from "@/shared/ui/Section";
import { BLOG_POSTS } from "@/features/marketing/constants";

export function BlogSection() {
  return (
    <Section id="blog" background="muted" compact>
      <Container>
        <SectionHeader
          badge="مجله برقینو"
          title="آخرین روندها و راهکارهای بازار برق"
          description="راهنمای فروش برق خانگی، بورس سبز و نصب نیروگاه خورشیدی."
          compact
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...BLOG_POSTS].reverse().slice(0, 4).map((post) => (
            <BlogCard key={post.id} {...post} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button href="/blog" variant="outline">
            همه مقالات
            <LinkArrow />
          </Button>
        </div>
      </Container>
    </Section>
  );
}
