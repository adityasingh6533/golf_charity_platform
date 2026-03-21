import { useEffect, useState } from "react";
import API from "../utils/commonapi";
import "../styles/Home.css";

export default function Home() {
  const [featuredCharities, setFeaturedCharities] = useState([]);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await API.get("/charities/featured");
        setFeaturedCharities(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.log(error);
      }
    };

    loadFeatured();
  }, []);

  return (
    <div className="home">
      <div className="home-orb home-orb--one" />
      <div className="home-orb home-orb--two" />
      <div className="home-orb home-orb--three" />

      <div className="home-shell">
        <section className="home-hero">
          <div className="home-copy">
            <div className="home-kicker">Golf Charity Subscription Platform</div>
            <h1>
              Play with pressure.
              <span> Win with purpose.</span>
            </h1>
            <p>
              A subscription-led golf experience where every score fuels monthly draw rewards and a
              real charity impact engine.
            </p>

            <div className="home-actions">
              <button className="home-btn home-btn--primary" onClick={() => (window.location.href = "/signup")}>
                Start Membership
              </button>
              <button className="home-btn home-btn--ghost" onClick={() => (window.location.href = "/leaderboard")}>
                View Leaderboard
              </button>
              <button className="home-btn home-btn--ghost" onClick={() => (window.location.href = "/charities")}>
                Explore Charities
              </button>
            </div>
          </div>

          <div className="home-hero-card">
            <div className="home-stat">
              <span>Subscription Plans</span>
              <strong>Monthly + Yearly</strong>
            </div>
            <div className="home-stat">
              <span>Draw Logic</span>
              <strong>Random + Algorithm</strong>
            </div>
            <div className="home-stat">
              <span>Impact Engine</span>
              <strong>Player-picked charity share</strong>
            </div>
          </div>
        </section>

        <section className="home-showcase">
          <div className="home-panel">
            <div className="home-panel-head">
              <div>
                <div className="home-mini-kicker">Core Objectives</div>
                <h2>Built around subscription, scores, rewards, and charity.</h2>
              </div>
            </div>

            <div className="home-feature-grid">
              <div className="home-feature-card">
                <strong>Subscription Engine</strong>
                <p>Access monthly or yearly plans with active-status based eligibility.</p>
              </div>
              <div className="home-feature-card">
                <strong>Score Experience</strong>
                <p>Track the latest 5 scores and keep the flow fast, clear, and rewarding.</p>
              </div>
              <div className="home-feature-card">
                <strong>Draw Engine</strong>
                <p>Run monthly draws using random or algorithm-driven number selection.</p>
              </div>
              <div className="home-feature-card">
                <strong>Admin Control</strong>
                <p>Manage users, payouts, charity impact, verification, and live analytics.</p>
              </div>
            </div>
          </div>

          <div className="home-panel">
            <div className="home-panel-head">
              <div>
                <div className="home-mini-kicker">How It Works</div>
                <h2>From signup to payout in one clean local workflow.</h2>
              </div>
            </div>

            <div className="home-steps">
              <div className="home-step"><span>01</span> Subscribe to activate participation.</div>
              <div className="home-step"><span>02</span> Add your last 5 golf scores.</div>
              <div className="home-step"><span>03</span> Pick a charity and contribution share.</div>
              <div className="home-step"><span>04</span> Join the monthly draw and submit proof if you win.</div>
            </div>
          </div>
        </section>

        <section className="home-panel">
          <div className="home-panel-head">
            <div>
              <div className="home-mini-kicker">Featured Charities</div>
              <h2>Causes that turn every subscription into visible impact.</h2>
            </div>
          </div>

          <div className="home-charity-grid">
            {featuredCharities.length ? (
              featuredCharities.map((charity) => (
                <article key={charity._id} className="home-charity-card">
                  <div className="home-charity-top">
                    <span>{charity.category}</span>
                    <span>{charity.location}</span>
                  </div>
                  <h3>{charity.name}</h3>
                  <p>{charity.description}</p>
                  <div className="home-charity-impact">{charity.impact}</div>
                </article>
              ))
            ) : (
              <div className="home-empty">Featured charities will appear here once local data loads.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
