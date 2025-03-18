import { ReactNode } from 'react';

export default function AgentsLayout({ children }: { children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      {children}
    </section>
  );
} 