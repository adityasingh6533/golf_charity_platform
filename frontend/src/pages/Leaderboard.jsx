import { useEffect, useMemo, useState } from "react";
import API from "../utils/commonapi";
import "../styles/Leaderboard.css";

function formatCurrency(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;
}

function getPlayer(entry) {
  return {
    firstName: entry?.userId?.firstName || "User",
    lastName: entry?.userId?.lastName || "",
    email: entry?.userId?.email || "",
  };
}

function getInitials(entry) {
  const player = getPlayer(entry);
  const fullName = `${player.firstName} ${player.lastName}`.trim();
  return (
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function getDisplayName(entry) {
  const player = getPlayer(entry);
  return `${player.firstName} ${player.lastName}`.trim() || "User";
}

function SpotlightCard({ entry, rank }) {
  const player = getPlayer(entry);
  return (
    <div className={`leader-spotlight leader-spotlight--${rank}`}>
      <div className="leader-spotlight-rank">#{rank}</div>
      <div className="leader-spotlight-avatar">{getInitials(entry)}</div>
      <div className="leader-spotlight-name">{getDisplayName(entry)}</div>
      <div className="leader-spotlight-email">{player.email || "Featured player"}</div>
      <div className="leader-spotlight-prize">{formatCurrency(entry.prize)}</div>
      <div className="leader-spotlight-meta">{entry.matches} matches</div>
    </div>
  );
}

function RankingRow({ entry, rank }) {
  const player = getPlayer(entry);
  return (
    <div className="leaderboard-entry">
      <div className="leaderboard-entry-main">
        <div className="leaderboard-entry-rank">#{rank}</div>
        <div className="leaderboard-entry-avatar">{getInitials(entry)}</div>
        <div className="leaderboard-entry-copy">
          <div className="leaderboard-entry-name">{getDisplayName(entry)}</div>
          <div className="leaderboard-entry-email">{player.email || "Player profile"}</div>
        </div>
      </div>

      <div className="leaderboard-entry-metric">
        <span>Matches</span>
        <strong>{entry.matches}</strong>
      </div>

      <div className="leaderboard-entry-metric">
        <span>Status</span>
        <strong>{entry.status || "pending"}</strong>
      </div>

      <div className="leaderboard-entry-prize">{formatCurrency(entry.prize)}</div>
    </div>
  );
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await API.get("/result/leaderboard");
        setLeaders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchLeaderboard();
  }, []);

  const stats = useMemo(() => {
    const totalPrize = leaders.reduce((sum, entry) => sum + Number(entry.prize || 0), 0);
    const totalMatches = leaders.reduce((sum, entry) => sum + Number(entry.matches || 0), 0);
    const bestPrize = leaders.length ? Math.max(...leaders.map((entry) => Number(entry.prize || 0))) : 0;

    return {
      totalPrize,
      totalMatches,
      bestPrize,
    };
  }, [leaders]);

  const topThree = leaders.slice(0, 3);
  const remaining = leaders.slice(3);

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-shell">
        <section className="leaderboard-hero">
          <div className="leaderboard-hero-copy">
            <div className="leaderboard-kicker">Hall of Impact</div>
            <h1>Leaderboard</h1>
            <p>
              The hottest board in the platform. Track elite performers, biggest prize grabs, and
              the players owning the draw cycle right now.
            </p>

            <div className="leaderboard-actions">
              <button
                className="leaderboard-primary-btn"
                onClick={() => {
                  window.location.href = "/dashboard";
                }}
              >
                Back to Dashboard
              </button>
              <button
                className="leaderboard-secondary-btn"
                onClick={() => {
                  window.location.href = "/admin";
                }}
              >
                Open Admin View
              </button>
            </div>
          </div>

          <div className="leaderboard-stat-panel">
            <div className="leaderboard-stat-card leaderboard-stat-card--gold">
              <span>Total Prize Pool</span>
              <strong>{formatCurrency(stats.totalPrize)}</strong>
            </div>
            <div className="leaderboard-stat-card leaderboard-stat-card--cyan">
              <span>Total Matches Logged</span>
              <strong>{stats.totalMatches}</strong>
            </div>
            <div className="leaderboard-stat-card leaderboard-stat-card--pink">
              <span>Biggest Prize</span>
              <strong>{formatCurrency(stats.bestPrize)}</strong>
            </div>
          </div>
        </section>

        <section className="leaderboard-showcase">
          <div className="leaderboard-panel leaderboard-panel--spotlight">
            <div className="leaderboard-panel-head">
              <div>
                <div className="leaderboard-panel-kicker">Spotlight</div>
                <h2>Top 3 Podium</h2>
              </div>
              <div className="leaderboard-badge">{topThree.length} highlighted</div>
            </div>

            <div className="leaderboard-podium">
              {topThree.length ? (
                topThree.map((entry, index) => (
                  <SpotlightCard key={entry._id || index} entry={entry} rank={index + 1} />
                ))
              ) : (
                <div className="leaderboard-empty">
                  No leaderboard records yet. Run draws and publish winners to light up this stage.
                </div>
              )}
            </div>
          </div>

          <div className="leaderboard-panel leaderboard-panel--story">
            <div className="leaderboard-panel-head">
              <div>
                <div className="leaderboard-panel-kicker">Energy</div>
                <h2>Why This Board Hits</h2>
              </div>
            </div>

            <div className="leaderboard-story-list">
              <div className="leaderboard-story-card">
                <span className="leaderboard-story-step">01</span>
                <strong>Elite Visual Presence</strong>
                <p>Top players get premium spotlight cards that feel earned, not generic.</p>
              </div>
              <div className="leaderboard-story-card">
                <span className="leaderboard-story-step">02</span>
                <strong>Prize First Storytelling</strong>
                <p>Rewards, matches, and ranking hierarchy are visible at one glance.</p>
              </div>
              <div className="leaderboard-story-card">
                <span className="leaderboard-story-step">03</span>
                <strong>Designed to Attract</strong>
                <p>The page now feels like a headline event, not a simple table dump.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="leaderboard-panel leaderboard-panel--full">
          <div className="leaderboard-panel-head">
            <div>
              <div className="leaderboard-panel-kicker">Full Ranking</div>
              <h2>Performance Ladder</h2>
            </div>
            <div className="leaderboard-badge">{leaders.length} total entries</div>
          </div>

          <div className="leaderboard-ranking">
            {remaining.length ? (
              remaining.map((entry, index) => (
                <RankingRow key={entry._id || index} entry={entry} rank={index + 4} />
              ))
            ) : (
              <div className="leaderboard-empty">
                Add more winning records to unlock the extended ranking ladder.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
