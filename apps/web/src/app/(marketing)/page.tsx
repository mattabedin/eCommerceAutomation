import { Hero } from '@/components/marketing/landing/hero';
import { LogosMarquee } from '@/components/marketing/landing/logos-marquee';
import { Stats } from '@/components/marketing/landing/stats';
import { ProblemPromise } from '@/components/marketing/landing/problem-promise';
import { HowItWorks } from '@/components/marketing/landing/how-it-works';
import { Agents } from '@/components/marketing/landing/agents';
import { Autonomy } from '@/components/marketing/landing/autonomy';
import { Bento } from '@/components/marketing/landing/bento';
import { Testimonials } from '@/components/marketing/landing/testimonials';
import { CTA } from '@/components/marketing/landing/cta';

export const metadata = {
  title: 'Forge — The AI that runs your store while you sleep',
  description:
    'Forge replaces Shopify, Klaviyo, Gorgias, and seven more tools with one platform — where AI agents handle pricing, support, marketing, and inventory automatically.',
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <LogosMarquee />
      <Stats />
      <ProblemPromise />
      <HowItWorks />
      <Agents />
      <Autonomy />
      <Bento />
      <Testimonials />
      <CTA />
    </>
  );
}
