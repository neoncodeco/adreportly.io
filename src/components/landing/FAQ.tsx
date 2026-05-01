import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is my Facebook access token safe?",
    a: "Yes. Tokens are encrypted with AES-256-GCM before being stored, and only the server can decrypt them when calling the Graph API. They are never sent to the browser.",
  },
  {
    q: "How do client share links work?",
    a: "When you click 'Share with Client', we generate a unique random UUID token tied to a single campaign with an expiry date you choose (7 / 30 / 60 / 90 days). The client opens a read-only dashboard — they cannot see any other campaign or your account.",
  },
  {
    q: "Do you cache data or always pull fresh?",
    a: "By default we call the Graph API directly so you always see real-time data. Pro and Enterprise plans include optional 1-hour caching to reduce API calls.",
  },
  {
    q: "What happens when a share link expires?",
    a: "The link returns a friendly 'expired' page. You can generate a new one anytime from the campaign or Reports page.",
  },
  {
    q: "Can I export reports as PDF or CSV?",
    a: "Yes. The Reports page lets you generate branded PDF or CSV reports for any client and date range with one click.",
  },
  {
    q: "Does it work on mobile?",
    a: "Absolutely. Both the agency dashboard and client share view are fully responsive and look great on any device.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-2xl border border-border bg-card px-5 shadow-soft"
            >
              <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
