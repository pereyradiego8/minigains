import type { ReactNode } from "react";
import { PageIntro } from "./PageIntro";

export function InfoPage({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <>
      <PageIntro crumbs={[{ label: title }]} eyebrow={eyebrow} title={title}>{lead && <p>{lead}</p>}</PageIntro>
      <div className="container-page max-w-3xl space-y-6 text-[1.05rem] leading-relaxed [&_h2]:mt-10 [&_h2]:text-2xl">{children}</div>
    </>
  );
}