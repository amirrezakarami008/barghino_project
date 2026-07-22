import { cn } from "@/shared/lib/utils";
import type { ContentSection } from "@/shared/types";

interface ProseContentProps {
  sections: ContentSection[];
  className?: string;
}

export function ProseContent({ sections, className }: ProseContentProps) {
  return (
    <article className={cn("space-y-10", className)}>
      {sections.map((section) => (
        <section key={section.id}>
          <h2 className="mb-4 text-xl font-bold text-slate-900 lg:text-2xl">{section.title}</h2>
          {section.paragraphs.map((paragraph, i) => (
            <p key={i} className="mb-4 leading-relaxed text-slate-600">
              {paragraph}
            </p>
          ))}
          {section.list && (
            <ul className="mt-4 space-y-2">
              {section.list.map((item) => (
                <li key={item} className="flex items-start gap-2 text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}
