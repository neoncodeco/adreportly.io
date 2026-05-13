import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Stats } from "@/components/landing/Stats";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { STANDARD_OFFER_PATH } from "@/lib/billing/offer-config";
import { getLatestStandardOfferCouponSafe } from "@/lib/billing/offer-server";

export default async function HomePage() {
  const offerCoupon = await getLatestStandardOfferCouponSafe();

  return (
    <div id="top" className="min-h-screen overflow-x-hidden bg-background">
      <Navbar />
      <main>
        <Hero
          offer={
            offerCoupon
              ? {
                  code: offerCoupon.code,
                  href: STANDARD_OFFER_PATH,
                }
              : null
          }
        />
        <HowItWorks />
        <Stats />
        <Features />
        <Pricing
          offer={
            offerCoupon
              ? {
                  code: offerCoupon.code,
                  href: STANDARD_OFFER_PATH,
                }
              : null
          }
        />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
