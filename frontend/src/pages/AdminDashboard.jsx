import { useEffect, useMemo, useState } from "react";
import "../styles/AdminDashboard.css";
import API from "../utils/commonapi";

function getAuthUser() {
  try {
    const raw = localStorage.getItem("authUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatCurrency(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;
}

function initialsFromUser(user) {
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  return (
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "AD"
  );
}

function normalizeUser(entry) {
  if (typeof entry?.userId === "object" && entry.userId) {
    return {
      name: `${entry.userId.firstName || ""} ${entry.userId.lastName || ""}`.trim() || "Unknown User",
      email: entry.userId.email || "",
      initials: initialsFromUser(entry.userId),
    };
  }

  return {
    name: String(entry?.userId || "Unknown User"),
    email: "",
    initials: "US",
  };
}

function statusLabel(status) {
  if (status === "paid") return "Paid";
  if (status === "verified") return "Verified";
  if (status === "rejected") return "Rejected";
  if (status === "pending") return "Pending";
  if (status === "won") return "Won";
  return "Lost";
}

function StatCard({ label, value, tone, helper }) {
  return (
    <div className={`admin-stat-card admin-stat-card--${tone}`}>
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">{value}</div>
      <div className="admin-stat-helper">{helper}</div>
    </div>
  );
}

function UserCard({ user }) {
  return (
    <div className="admin-user-card">
      <div className="admin-user-avatar">{initialsFromUser(user)}</div>
      <div className="admin-user-copy">
        <div className="admin-user-name">
          {user.firstName} {user.lastName}
        </div>
        <div className="admin-user-email">{user.email}</div>
        <div className="admin-user-email">
          {user.charity?.charityId?.name || "No charity"} / {user.subscription?.status || "inactive"}
        </div>
      </div>
      <div className={`admin-role-pill admin-role-pill--${String(user.role || "user").toLowerCase()}`}>
        {String(user.role || "user").toUpperCase()}
      </div>
    </div>
  );
}

function ResultRow({ entry, onVerify, onReject, onPaid }) {
  const user = normalizeUser(entry);
  const hasProof = Boolean(entry.proofUrl);
  const canVerify = entry.prize > 0 && hasProof && entry.status !== "verified" && entry.status !== "paid";
  const canPay = entry.prize > 0 && entry.status === "verified";
  const canReject = entry.prize > 0 && hasProof && entry.status !== "paid";

  return (
    <div className="admin-result-row">
      <div className="admin-result-user">
        <div className="admin-result-avatar">{user.initials}</div>
        <div>
          <div className="admin-result-name">{user.name}</div>
          <div className="admin-result-email">{user.email || "Player record"}</div>
          <div className="admin-result-proof">
            {entry.proofUrl ? "Proof submitted" : "Proof missing"}{entry.proofNote ? ` • ${entry.proofNote}` : ""}
          </div>
          {entry.proofUrl ? (
            <div className="admin-result-proof">
              <a href={entry.proofUrl} target="_blank" rel="noreferrer">
                Open submitted proof
              </a>
            </div>
          ) : null}
        </div>
      </div>

      <div className="admin-result-metric">
        <span className="admin-result-label">Matches</span>
        <strong>{entry.matches}</strong>
      </div>

      <div className="admin-result-metric">
        <span className="admin-result-label">Prize</span>
        <strong>{formatCurrency(entry.prize)}</strong>
      </div>

      <div className="admin-result-status-wrap">
        <span className={`admin-status-chip admin-status-chip--${entry.status}`}>
          {statusLabel(entry.status)}
        </span>
      </div>

      <div className="admin-result-actions">
        <button
          className="admin-action-btn admin-action-btn--ghost"
          onClick={() => onVerify(entry._id)}
          disabled={!canVerify}
        >
          Verify
        </button>
        <button
          className="admin-action-btn admin-action-btn--danger"
          onClick={() => onReject(entry._id)}
          disabled={!canReject}
        >
          Reject
        </button>
        <button
          className="admin-action-btn admin-action-btn--solid"
          onClick={() => onPaid(entry._id)}
          disabled={!canPay}
        >
          Mark Paid
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [charities, setCharities] = useState([]);
  const [drawStatus, setDrawStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawMode, setDrawMode] = useState("random");
  const [charityForm, setCharityForm] = useState({
    name: "",
    category: "Community",
    location: "India",
    description: "",
    impact: "",
    featured: false,
  });

  const refreshAll = async () => {
    const [usersRes, resultsRes, analyticsRes, charitiesRes] = await Promise.all([
      API.get("/admin/users"),
      API.get("/admin/results"),
      API.get("/admin/analytics"),
      API.get("/charities"),
    ]);

    setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    setResults(Array.isArray(resultsRes.data) ? resultsRes.data : []);
    setAnalytics(analyticsRes.data || null);
    setCharities(Array.isArray(charitiesRes.data) ? charitiesRes.data : []);
  };

  useEffect(() => {
    const authUser = getAuthUser();
    const token = localStorage.getItem("authToken");

    if (!token || String(authUser?.role || "").toLowerCase() !== "admin") {
      window.location.href = "/signin";
      return;
    }

    refreshAll().catch((error) => {
      console.log(error);
      setDrawStatus(error?.response?.data?.message || error.message || "Unable to load admin data");
    });
  }, []);

  const runDraw = async () => {
    try {
      setLoading(true);
      const res = await API.post("/admin/run-draw", { mode: drawMode });
      setDrawStatus(res.data?.message || "Draw executed successfully");
      await refreshAll();
    } catch (error) {
      console.log(error);
      setDrawStatus(error?.response?.data?.message || error.message || "Draw failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyWinner = async (id) => {
    try {
      await API.put(`/admin/verify/${id}`);
      await refreshAll();
    } catch (error) {
      console.log(error);
      setDrawStatus(error?.response?.data?.message || error.message || "Unable to verify winner");
    }
  };

  const rejectWinner = async (id) => {
    try {
      await API.put(`/admin/reject/${id}`, { adminNote: "Proof rejected by admin." });
      await refreshAll();
    } catch (error) {
      console.log(error);
      setDrawStatus(error?.response?.data?.message || error.message || "Unable to reject winner");
    }
  };

  const markPaid = async (id) => {
    try {
      await API.put(`/admin/pay/${id}`);
      await refreshAll();
    } catch (error) {
      console.log(error);
      setDrawStatus(error?.response?.data?.message || error.message || "Unable to update payment");
    }
  };

  const createCharity = async () => {
    try {
      await API.post("/charities", charityForm);
      setCharityForm({
        name: "",
        category: "Community",
        location: "India",
        description: "",
        impact: "",
        featured: false,
      });
      setDrawStatus("New charity added.");
      await refreshAll();
    } catch (error) {
      console.log(error);
      setDrawStatus(error?.response?.data?.message || error.message || "Unable to create charity");
    }
  };

  const featuredWinners = useMemo(() => {
    return [...results]
      .filter((entry) => Number(entry.prize || 0) > 0)
      .sort((a, b) => Number(b.prize || 0) - Number(a.prize || 0))
      .slice(0, 3);
  }, [results]);

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <section className="admin-hero">
          <div className="admin-hero-copy">
            <div className="admin-eyebrow">Control Room</div>
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">
              Configure draw mode, manage local charity data, review proof submissions, and keep the
              entire player economy moving from one cinematic control surface.
            </p>

            <div className="admin-hero-actions">
              <select
                className="admin-mode-select"
                value={drawMode}
                onChange={(event) => setDrawMode(event.target.value)}
              >
                <option value="random">Random Draw</option>
                <option value="algorithm">Algorithm Draw</option>
              </select>

              <button className="admin-primary-btn" onClick={runDraw} disabled={loading}>
                {loading ? "Running Draw..." : "Launch New Draw"}
              </button>
              <button className="admin-secondary-btn" onClick={() => (window.location.href = "/dashboard")}>
                Open Player View
              </button>
            </div>

            <div className="admin-live-status">
              <span className="admin-live-dot" />
              {drawStatus || "System synced and ready for the next payout cycle."}
            </div>
          </div>

          <div className="admin-command-card">
            <div className="admin-command-head">
              <span>Monthly Draw Ops</span>
              <span>{analytics?.totalResults || results.length} result records</span>
            </div>

            <div className="admin-command-grid">
              <StatCard label="Registered Users" value={analytics?.totalUsers || users.length} helper="Complete player base" tone="cyan" />
              <StatCard label="Active Subscribers" value={analytics?.activeSubscribers || 0} helper="Eligible to compete" tone="blue" />
              <StatCard label="Pending Winners" value={analytics?.pendingVerifications || 0} helper="Need admin action" tone="pink" />
              <StatCard label="Charity Total" value={formatCurrency(analytics?.charityContributionTotal || 0)} helper="Projected contributions" tone="green" />
            </div>
          </div>
        </section>

        <section className="admin-overview-grid">
          <div className="admin-panel admin-panel--wide">
            <div className="admin-panel-head">
              <div>
                <div className="admin-panel-kicker">Financial Pulse</div>
                <h2>Prize + Charity Analytics</h2>
              </div>
              <div className="admin-panel-badge">Live Analytics</div>
            </div>

            <div className="admin-insight-band">
              <div className="admin-insight-block">
                <span>Total Distributed</span>
                <strong>{formatCurrency(analytics?.totalPrizeDistributed || 0)}</strong>
              </div>
              <div className="admin-insight-block">
                <span>Total Draws</span>
                <strong>{analytics?.totalDraws || 0}</strong>
              </div>
              <div className="admin-insight-block">
                <span>Winning Entries</span>
                <strong>{results.filter((entry) => Number(entry.prize || 0) > 0).length}</strong>
              </div>
            </div>

            <div className="admin-featured-grid">
              {featuredWinners.length ? (
                featuredWinners.map((entry, index) => {
                  const user = normalizeUser(entry);
                  return (
                    <div key={entry._id} className="admin-feature-card">
                      <div className="admin-feature-rank">Top {index + 1}</div>
                      <div className="admin-feature-avatar">{user.initials}</div>
                      <div className="admin-feature-name">{user.name}</div>
                      <div className="admin-feature-email">{user.email || "No email available"}</div>
                      <div className="admin-feature-prize">{formatCurrency(entry.prize)}</div>
                    </div>
                  );
                })
              ) : (
                <div className="admin-empty-state">
                  No winning records yet. Run a draw after users submit scores to populate this area.
                </div>
              )}
            </div>

            <div className="admin-charity-breakdown">
              {(analytics?.charityBreakdown || []).map((charity) => (
                <div key={charity.id} className="admin-charity-breakdown-item">
                  <strong>{charity.name}</strong>
                  <span>{charity.supporters} supporters</span>
                  <span>{formatCurrency(charity.contributionTotal)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <div className="admin-panel-kicker">People</div>
                <h2>User Management</h2>
              </div>
              <div className="admin-panel-badge">{users.length} users</div>
            </div>

            <div className="admin-user-list">
              {users.map((user) => (
                <UserCard key={user._id} user={user} />
              ))}
            </div>
          </div>
        </section>

        <section className="admin-overview-grid">
          <div className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <div className="admin-panel-kicker">Charity Management</div>
                <h2>Add Local Charity</h2>
              </div>
              <div className="admin-panel-badge">{charities.length} charities</div>
            </div>

            <div className="admin-form-grid">
              <input
                className="admin-input"
                placeholder="Charity name"
                value={charityForm.name}
                onChange={(event) => setCharityForm((prev) => ({ ...prev, name: event.target.value }))}
              />
              <input
                className="admin-input"
                placeholder="Category"
                value={charityForm.category}
                onChange={(event) => setCharityForm((prev) => ({ ...prev, category: event.target.value }))}
              />
              <input
                className="admin-input"
                placeholder="Location"
                value={charityForm.location}
                onChange={(event) => setCharityForm((prev) => ({ ...prev, location: event.target.value }))}
              />
              <input
                className="admin-input"
                placeholder="Impact line"
                value={charityForm.impact}
                onChange={(event) => setCharityForm((prev) => ({ ...prev, impact: event.target.value }))}
              />
              <textarea
                className="admin-textarea"
                placeholder="Description"
                value={charityForm.description}
                onChange={(event) => setCharityForm((prev) => ({ ...prev, description: event.target.value }))}
              />
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={charityForm.featured}
                  onChange={(event) => setCharityForm((prev) => ({ ...prev, featured: event.target.checked }))}
                />
                Feature on homepage
              </label>
            </div>

            <div className="admin-inline-actions">
              <button className="admin-primary-btn" onClick={createCharity}>
                Add Charity
              </button>
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <div className="admin-panel-kicker">Cause Directory</div>
                <h2>Active Charities</h2>
              </div>
            </div>

            <div className="admin-directory-list">
              {charities.map((charity) => (
                <div key={charity._id} className="admin-directory-item">
                  <strong>{charity.name}</strong>
                  <span>{charity.category} • {charity.location}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-panel admin-panel--full">
          <div className="admin-panel-head">
            <div>
              <div className="admin-panel-kicker">Operations</div>
              <h2>Winners Management</h2>
            </div>
            <div className="admin-panel-badge">{results.length} entries</div>
          </div>

          <div className="admin-results-table">
            {results.length ? (
              results.map((entry) => (
                <ResultRow
                  key={entry._id}
                  entry={entry}
                  onVerify={verifyWinner}
                  onReject={rejectWinner}
                  onPaid={markPaid}
                />
              ))
            ) : (
              <div className="admin-empty-state">
                Results will appear here after the first draw is executed.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
