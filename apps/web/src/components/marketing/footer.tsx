import Link from 'next/link';

export function MarketingFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="logo">
            <span className="logo-mark">F</span>
            <span>Forge</span>
          </div>
          <p>
            The first AI commerce platform that builds, prices, and runs your
            store for you.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="tag">SOC 2</span>
            <span className="tag">PCI Level 1</span>
          </div>
        </div>
        <div className="footer-col">
          <h4>Product</h4>
          <Link href="/#agents">Agents</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/signup">Builder</Link>
          <Link href="/app/dashboard">Dashboard</Link>
          <a href="#">Changelog</a>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <Link href="/about">About</Link>
          <a href="#">Customers</a>
          <a href="#">Careers</a>
          <a href="#">Press</a>
          <a href="#">Contact</a>
        </div>
        <div className="footer-col">
          <h4>Resources</h4>
          <a href="#">Docs</a>
          <a href="#">API</a>
          <a href="#">Status</a>
          <a href="#">Security</a>
          <a href="#">Privacy</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Forge Commerce, Inc.</span>
        <span>San Francisco · Built with care</span>
      </div>
    </footer>
  );
}
