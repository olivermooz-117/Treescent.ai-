import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          io.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const FEATURES = [
  {
    icon: "🔗",
    title: "Custom link-in-bio",
    text: "Your page at treescent.ai/username. Themes, ordering, and a clean mobile-first design.",
    // Nairobi street / urban life
    img: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=700&q=80",
  },
  {
    icon: "📊",
    title: "Click analytics",
    text: "See which links perform. Track clicks over time so you know what your audience cares about.",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=80",
  },
  {
    icon: "📱",
    title: "M-Pesa tips & store",
    text: "Let fans support you with M-Pesa. Simple tipping designed for the Kenyan digital economy.",
    // Mobile money / phone in African context
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&q=80",
    highlight: true,
  },
  {
    icon: "🎨",
    title: "Themes that feel like you",
    text: "Pick a theme, add your bio and avatar, and ship a page that looks intentional.",
    img: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=700&q=80",
  },
  {
    icon: "⚡",
    title: "Fast public pages",
    text: "Optimized for mobile. Your audience lands, understands who you are, and taps the right link.",
    // Creator with phone
    img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=700&q=80",
  },
  {
    icon: "🛡️",
    title: "Own your audience",
    text: "One home for your links and offers. Share a single URL on Instagram, TikTok, WhatsApp.",
    // African professionals / creators collaborating
    img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&q=80",
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing">
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
          <p className="eyebrow animate-in">Link-in-bio for African creators</p>
          <h1 className="animate-in d1">
            Build your
            <br />
            <span className="gradient-text">creator page.</span>
          </h1>
          <p className="hero-sub animate-in d2">
            One beautiful link for everything you do — content, products, and
            tips. Built with M-Pesa so fans in Kenya can support you instantly.
          </p>
          <div className="hero-ctas animate-in d3">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start for free
            </Link>
            <a href="#how" className="btn btn-ghost btn-lg">
              See how it works
            </a>
          </div>
          <p className="hero-note animate-in d4">
            No credit card required · Free forever plan
          </p>
        </div>

        <div className="hero-preview animate-in d2">
          <div className="hero-image-stack">
            {/* Nairobi skyline / city energy */}
            <img
              className="hero-photo"
              src="https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=900&q=80"
              alt="Nairobi city"
            />
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
        </div>
      </section>

      <section className="proof-bar">
        <p>
          Built for creators who want a simple, powerful page — with payments
          that work locally.
        </p>
      </section>

      {/* Features */}
      <section id="features" className="section features">
        <Reveal className="section-header">
          <h2>Everything you need to run your creator business</h2>
          <p>
            From a clean public page to click analytics and local payments —
            Treescent keeps it focused and useful.
          </p>
        </Reveal>

        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={Math.min(i * 50, 150)}>
              <article className={`feature-card ${f.highlight ? "highlight" : ""}`}>
                <div className="feature-img-wrap">
                  <img src={f.img} alt="" loading="lazy" />
                </div>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Visual band — creators / East Africa energy */}
      <section className="visual-band">
        <Reveal>
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=80"
            alt="Creators collaborating"
          />
          <div className="visual-band-copy">
            <h2>Your page. Your audience. Your terms.</h2>
            <p>Share one link on Instagram, TikTok, WhatsApp, and email.</p>
            <Link to="/register" className="btn btn-primary">
              Create your free page
            </Link>
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section id="how" className="section how">
        <Reveal className="section-header">
          <h2>Up and running in minutes</h2>
          <p>No complicated setup. Create, customize, share.</p>
        </Reveal>
        <div className="steps">
          {[
            { n: "1", t: "Create your account", d: "Pick a username. That’s your public URL." },
            { n: "2", t: "Add your links", d: "Portfolio, socials, products, tip jar — whatever you need." },
            { n: "3", t: "Share one link", d: "Drop treescent.ai/you everywhere and track what works." },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 60}>
              <div className="step">
                <span className="step-num">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section pricing">
        <Reveal className="section-header">
          <h2>Simple pricing</h2>
          <p>Start free. Upgrade when you’re ready to grow.</p>
        </Reveal>
        <div className="pricing-grid">
          <Reveal>
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
          </Reveal>
          <Reveal delay={60}>
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
          </Reveal>
        </div>
      </section>

      <section className="final-cta">
        <Reveal>
          <h2>Ready to claim your page?</h2>
          <p>
            Join creators building a simple, powerful home for their links and
            income — with payments that work where you are.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create your free page
          </Link>
        </Reveal>
      </section>

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
