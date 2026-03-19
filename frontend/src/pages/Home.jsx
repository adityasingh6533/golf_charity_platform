import "../styles/Home.css";

export default function Home() {
  return (
    <div className="home">

      {/* Background */}
      <div className="bg">
        <div className="blob b1"></div>
        <div className="blob b2"></div>
        <div className="blob b3"></div>
      </div>

      {/* HERO */}
      <section className="hero">
        <h1>
          Play Golf. <span>Win Rewards.</span> Change Lives.
        </h1>
        <p>
          A modern subscription platform combining golf performance,
          monthly draws, and charity impact.
        </p>

        <div className="hero-btns">
          <button className="btn primary">Get Started</button>
          <button className="btn secondary">Explore</button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="card">
          <h3>💳 Subscription</h3>
          <p>Monthly / yearly plans with exclusive access.</p>
        </div>

        <div className="card">
          <h3>📊 Score Tracking</h3>
          <p>Track your last 5 golf scores with smart logic.</p>
        </div>

        <div className="card">
          <h3>🎯 Monthly Draw</h3>
          <p>Win rewards through random or smart draw system.</p>
        </div>

        <div className="card">
          <h3>❤️ Charity</h3>
          <p>Support causes while playing and winning.</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="steps">
        <h2>How It Works</h2>

        <div className="step-list">
          <div className="step">1️⃣ Subscribe</div>
          <div className="step">2️⃣ Enter Scores</div>
          <div className="step">3️⃣ Join Draw</div>
          <div className="step">4️⃣ Win & Donate</div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Start Your Journey Today 🚀</h2>
        <button className="btn primary">Join Now</button>
      </section>

    </div>
  );
}