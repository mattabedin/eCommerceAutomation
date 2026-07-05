import '../../styles/marketing.css';
import { AnnounceBar } from '@/components/marketing/announce-bar';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { StickyCta } from '@/components/marketing/sticky-cta';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnounceBar />
      <MarketingNav />
      {children}
      <MarketingFooter />
      <StickyCta />
    </>
  );
}
