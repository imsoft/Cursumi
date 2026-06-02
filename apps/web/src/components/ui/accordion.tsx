import * as React from "react";

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export const Accordion = ({ items }: AccordionProps) => {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.title}
          className="rounded-2xl border border-border bg-card/90 p-5"
        >
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            {item.title}
          </summary>
          <p className="mt-2 text-sm text-muted-foreground">{item.content}</p>
        </details>
      ))}
    </div>
  );
};

