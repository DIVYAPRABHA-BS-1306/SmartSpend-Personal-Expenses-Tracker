import { Link } from 'react-router-dom';

const HomePage = () => {
  const features = [
    {
      title: 'Fast onboarding',
      text: 'Add your first expense in under a minute.'
    },
    {
      title: 'Clear insights',
      text: 'See where your money goes at a glance.'
    },
    {
      title: 'Your data, yours',
      text: 'Designed with privacy in mind.'
    }
  ];

  return (
    <div className="landing-shell">
      <header className="landing-header">
        <div className="landing-brand">SmartSpend</div>
        <nav className="landing-nav">
          <Link to="/login" className="landing-nav-link">Login</Link>
          <Link to="/register" className="landing-nav-link landing-nav-link-primary">Signup</Link>
        </nav>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <h1>SmartSpend</h1>
          <p>
            Track, categorize and visualize your expenses with clarity. Simple to use,
            privacy-focused and powerful enough for your daily spending.
          </p>
          <div className="landing-actions">
            <Link to="/register" className="landing-btn landing-btn-primary">Get started</Link>
            <Link to="/login" className="landing-btn landing-btn-secondary">Login</Link>
          </div>
        </section>

        <section className="landing-features">
          {features.map((feature) => (
            <div key={feature.title} className="landing-feature-item">
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="landing-footer">
        © 2025 SMARTSPEND — ALL RIGHTS RESERVED
      </footer>
    </div>
  );
};

export default HomePage;
