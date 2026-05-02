import { useState } from "react";
import { Mail, MessageCircle, Send } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", message: "" });
      setLoading(false);
    }, 700);
  };

  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-stretch">
          {/* FAQ */}
          <div className="flex flex-col">
            <div>
              <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
                FAQ
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Frequently asked questions
              </h2>
              <p className="mt-3 text-muted-foreground">
                Everything you need to know about the product.
              </p>
            </div>

            <Accordion type="single" collapsible className="mt-8 flex-1 space-y-3">
              {faqs.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="rounded card-brutal bg-card px-5"
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

          {/* Contact */}
          <div id="contact" className="flex flex-col">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
                <MessageCircle className="h-3 w-3" />
                Contact us
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Still have questions?
              </h2>
              <p className="mt-3 text-muted-foreground">
                Send us a message and our team will reply within 24 hours.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 flex-1 rounded card-brutal bg-card p-6 sm:p-7 flex flex-col"
            >
              <div className="flex flex-1 flex-col space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name">Name</Label>
                    <Input
                      id="contact-name"
                      placeholder="Jane Doe"
                      required
                      maxLength={100}
                      className="rounded"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="jane@agency.com"
                      required
                      maxLength={255}
                      className="rounded"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex flex-1 flex-col space-y-1.5">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    placeholder="How can we help?"
                    required
                    maxLength={1000}
                    className="rounded flex-1 min-h-[140px]"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded bg-brand text-brand-foreground btn-brutal h-auto py-3 hover:bg-brand font-semibold"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Sending..." : "Send message"}
                </Button>

                <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  Or email us at <span className="font-medium text-foreground">hello@adgleam.com</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
