import type { PropsWithChildren } from "react";

export function Section({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <section className="bg-background p-4 space-y-4">
      <h2 className="text-lg font-semibold text-onSurface">{title}</h2>
      {children}
    </section>
  );
}
