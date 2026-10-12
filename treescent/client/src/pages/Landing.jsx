import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <Link to="/" className="logo">
            Treescent<span>.ai</span>
          </Link>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="nav-login">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Start for free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Link-in-bio for African creators</p>
          <h1>
            Build your
            <br />
            <span className="gradient-text">creator page.</span>
          </h1>
          <p className="hero-sub">
            One beautiful link for everything you do — content, products, and
            tips. Built with M-Pesa so your fans in Kenya can support you
            instantly.
          </p>
          <div className="hero-ctas">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start for free
            </Link>
            <a href="#how" className="btn btn-ghost btn-lg">
              See how it works
            </a>
          </div>
          <p className="hero-note">No credit card required · Free forever plan</p>
        </div>

        <div className="hero-preview">
          <div className="phone-mock">
            <div className="phone-notch" />
            <div className="phone-screen">
              <div className="mock-avatar">T</div>
              <div className="mock-name">@treescent</div>
              <div className="mock-bio">Creator tools for East Africa 🌿</div>
              <div className="mock-links">
                <div className="mock-link">My latest video</div>
                <div className="mock-link">Shop digital products</div>
                <div className="mock-link accent">Send a tip via M-Pesa</div>
                <div className="mock-link">Book a collab</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="proof-bar">
        <p>
          Built for creators who want a simple, powerful page — with payments
          that actually work locally.
        </p>
      </section>

      {/* Features */}
      <section id="features" className="section features">
        <div className="section-header">
          <h2>Everything you need to run your creator business</h2>
          <p>
            From a clean public page to click analytics and local payments —
            Treescent keeps it focused and useful.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>Custom link-in-bio</h3>
            <p>
              Your own page at treescent.ai/username. Drag-and-drop ordering,
              themes, and a clean mobile-first design.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Click analytics</h3>
            <p>
              See which links perform. Track clicks over time so you know what
              your audience actually cares about.
            </p>
          </article>

          <article className="feature-card highlight">
            <div className="feature-icon">📱</div>
            <h3>M-Pesa tips & store</h3>
            <p>
              Let fans support you with M-Pesa. Simple tipping and a lightweight
              storefront designed for the Kenyan digital economy.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Themes that feel like you</h3>
            <p>
              Pick a theme, add your bio and avatar, and ship a page that looks
              intentional — not generic.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast public pages</h3>
            <p>
              Optimized for mobile. Your audience lands, understands who you
              are, and taps the right link in seconds.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Own your audience</h3>
            <p>
              One home for your links and offers. Share a single URL everywhere —
              Instagram, TikTok, WhatsApp, email.
            </p>
          </article>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="section how">
        <div className="section-header">
          <h2>Up and running in minutes</h2>
          <p>No complicated setup. Create, customize, share.</p>
        </div>

        <div className="steps">
          <div className="step">
            <span className="step-num">1</span>
            <h3>Create your account</h3>
            <p>Pick a username. That’s your public URL.</p>
          </div>
          <div className="step">
            <span className="step-num">2</span>
            <h3>Add your links</h3>
            <p>Portfolio, socials, products, tip jar — whatever you need.</p>
          </div>
          <div className="step">
            <span className="step-num">3</span>
            <h3>Share one link</h3>
            <p>Drop treescent.ai/you everywhere and track what works.</p>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing" className="section pricing">
        <div className="section-header">
          <h2>Simple pricing</h2>
          <p>Start free. Upgrade when you’re ready to grow.</p>
        </div>

        <div className="pricing-grid">
          <div className="price-card">
            <p className="price-label">Free</p>
            <p className="price-amount">
              KES 0<span>/forever</span>
            </p>
            <ul>
              <li>Custom link-in-bio page</li>
              <li>Unlimited links</li>
              <li>Basic click analytics</li>
              <li>Themes & profile customization</li>
            </ul>
            <Link to="/register" className="btn btn-ghost">
              Get started
            </Link>
          </div>

          <div className="price-card popular">
            <span className="badge">Coming soon</span>
            <p className="price-label">Creator</p>
            <p className="price-amount">
              KES 499<span>/mo</span>
            </p>
            <ul>
              <li>Everything in Free</li>
              <li>M-Pesa tips & storefront</li>
              <li>Advanced analytics</li>
              <li>Priority support</li>
              <li>Remove Treescent branding</li>
            </ul>
            <Link to="/register" className="btn btn-primary">
              Join waitlist
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <h2>Your page. Your audience. Your terms.</h2>
        <p>
          Join creators building a simple, powerful home for their links and
          income — with payments that work where you are.
        </p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Create your free page
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo">
              Treescent<span>.ai</span>
            </span>
            <p>Link-in-bio & creator storefront for East Africa.</p>
          </div>
          <div className="footer-links">
            <Link to="/login">Log in</Link>
            <Link to="/register">Sign up</Link>
            <a href="#features">Features</a>
          </div>
        </div>
        <p className="copyright">© {new Date().getFullYear()} Treescent.ai</p>
      </footer>
    </div>
  );
}
