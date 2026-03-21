import { useCallback, useEffect, useMemo, useState } from "react";
import "../styles/Dashboard.css";
import API from "../utils/commonapi";

function safeParseAuthUser() {
  try {
    const raw = localStorage.getItem("authUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function syncAuthUser(user) {
  if (user) {
    localStorage.setItem("authUser", JSON.stringify(user));
  }
}

function initialsFromName(name) {
  return (
    String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function redirectToSignIn() {
  localStorage.removeItem("authUser");
  localStorage.removeItem("authToken");
  window.location.href = "/signin";
}

function formatCurrency(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDateInputValue(value = new Date()) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function normalizeScoreEntries(entries) {
  return (Array.isArray(entries) ? entries : [])
    .map((entry) => ({
      value: String(entry?.value ?? ""),
      date: toDateInputValue(entry?.date || new Date()),
    }))
    .filter((entry) => Number(entry.value) > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
}

function summarizeResults(allResults) {
  if (!allResults.length) {
    return {
      winnings: 0,
      matchCount: 0,
      result: "No draw yet",
      draw: [],
      latest: null,
      drawsEntered: 0,
      upcomingStatus: "No completed draws yet",
    };
  }

  const latest = allResults[allResults.length - 1];
  const winnings = allResults.reduce((sum, entry) => sum + Number(entry.prize || 0), 0);

  let result = "No win this draw";
  if (latest.status === "paid") result = "Payout completed";
  else if (latest.status === "verified") result = "Winner verified";
  else if (latest.status === "rejected") result = "Proof rejected";
  else if (latest.prize > 0) result = "Winner awaiting proof";

  return {
    winnings,
    matchCount: Number(latest.matches || 0),
    result,
    draw: Array.isArray(latest.draw) ? latest.draw : [],
    latest,
    drawsEntered: allResults.length,
    upcomingStatus: "Waiting for next admin-published monthly draw",
  };
}

export default function Dashboard() {
  const authUser = useMemo(() => safeParseAuthUser(), []);
  const [currentUser, setCurrentUser] = useState(authUser);
  const [charities, setCharities] = useState([]);
  const [scoreEntries, setScoreEntries] = useState([]);
  const [scoreForm, setScoreForm] = useState({
    value: "",
    date: toDateInputValue(),
  });
  const [winnings, setWinnings] = useState(0);
  const [draw, setDraw] = useState([]);
  const [matchCount, setMatchCount] = useState(0);
  const [resultLabel, setResultLabel] = useState("No draw yet");
  const [latestResult, setLatestResult] = useState(null);
  const [drawsEntered, setDrawsEntered] = useState(0);
  const [upcomingDrawStatus, setUpcomingDrawStatus] = useState("No completed draws yet");
  const [savingScores, setSavingScores] = useState(false);
  const [savingCharity, setSavingCharity] = useState(false);
  const [savingSubscription, setSavingSubscription] = useState(false);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [payments, setPayments] = useState([]);

  const [charityForm, setCharityForm] = useState({
    charityId: "",
    contributionPercent: 10,
  });

  const displayName = currentUser?.firstName || "Player";
  const currentUserId = currentUser?._id || currentUser?.id;
  const avatarText = initialsFromName(
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ")
  );

  const subscription = currentUser?.subscription || {
    plan: "monthly",
    status: "inactive",
    amount: 100,
    renewalDate: null,
  };

  const loadDashboardData = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const [profileRes, charitiesRes, scoreRes, resultRes, paymentRes] = await Promise.allSettled([
        API.get("/users/me"),
        API.get("/charities"),
        API.get(`/score/${currentUserId}`),
        API.get(`/result/${currentUserId}`),
        API.get("/payments/me"),
      ]);

      if (profileRes.status !== "fulfilled") {
        throw profileRes.reason;
      }

      const profile = profileRes.value.data;
      const charityList =
        charitiesRes.status === "fulfilled" && Array.isArray(charitiesRes.value.data)
          ? charitiesRes.value.data
          : [];
      const scoreDoc = scoreRes.status === "fulfilled" ? scoreRes.value.data : null;
      const allResults =
        resultRes.status === "fulfilled" && Array.isArray(resultRes.value.data)
          ? resultRes.value.data
          : [];
      const paymentHistory =
        paymentRes.status === "fulfilled" && Array.isArray(paymentRes.value.data)
          ? paymentRes.value.data
          : [];
      const summary = summarizeResults(allResults);

      setCurrentUser(profile);
      syncAuthUser(profile);
      setCharities(charityList);
      setScoreEntries(normalizeScoreEntries(scoreDoc?.entries));
      setWinnings(summary.winnings);
      setMatchCount(summary.matchCount);
      setResultLabel(summary.result);
      setDraw(summary.draw);
      setLatestResult(summary.latest);
      setDrawsEntered(summary.drawsEntered);
      setUpcomingDrawStatus(summary.upcomingStatus);
      setPayments(paymentHistory);
      setCharityForm({
        charityId: profile?.charity?.charityId?._id || profile?.charity?.charityId || "",
        contributionPercent: Number(profile?.charity?.contributionPercent || 10),
      });

      if (resultRes.status === "rejected") {
        const resultMessage =
          resultRes.reason?.response?.data?.message || resultRes.reason?.message || "";

        if (resultMessage && resultMessage !== "Active subscription required") {
          setStatusMessage(resultMessage);
        }
      }
    } catch (error) {
      console.log(error);
      setStatusMessage(error?.response?.data?.message || error.message || "Unable to load dashboard");
    }
  }, [currentUserId]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!authUser || !token) {
      redirectToSignIn();
      return;
    }

    loadDashboardData();
  }, [authUser, loadDashboardData]);

  useEffect(() => {
    setProofUrl(latestResult?.proofUrl || "");
    setProofNote(latestResult?.proofNote || "");
  }, [latestResult]);

  const charityName =
    currentUser?.charity?.charityId?.name ||
    charities.find((entry) => entry._id === charityForm.charityId)?.name ||
    "No charity selected";

  const handleAddScore = () => {
    const numericValue = Number(scoreForm.value);

    if (!Number.isFinite(numericValue) || numericValue < 1 || numericValue > 45 || !scoreForm.date) {
      setStatusMessage("Add a valid Stableford score between 1 and 45 with a date.");
      return;
    }

    const nextEntries = normalizeScoreEntries([
      ...scoreEntries,
      { value: numericValue, date: scoreForm.date },
    ]);

    setScoreEntries(nextEntries);
    setScoreForm({
      value: "",
      date: toDateInputValue(),
    });
    setStatusMessage(
      nextEntries.length === 5
        ? "Latest 5 scores ready. Saving will replace the oldest one automatically."
        : "Score added to your latest-5 list."
    );
  };

  const handleScoreEntryChange = (index, field, value) => {
    setScoreEntries((prev) =>
      prev.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleRemoveScore = (index) => {
    setScoreEntries((prev) => prev.filter((_, entryIndex) => entryIndex !== index));
  };

  const handleSubmitScores = async () => {
    if (!currentUserId) {
      redirectToSignIn();
      return;
    }

    const currentEntries = normalizeScoreEntries(scoreEntries).map((entry) => ({
      value: Number(entry.value),
      date: entry.date,
    }));

    if (!currentEntries.length) {
      setStatusMessage("Add at least one valid score before saving.");
      return;
    }

    if (String(subscription.status || "").toLowerCase() !== "active") {
      setStatusMessage("Activate a subscription before entering scores.");
      return;
    }

    try {
      setSavingScores(true);
      await API.post("/score", {
        userId: currentUserId,
        scores: currentEntries,
      });
      setStatusMessage("Latest scores saved in reverse chronological order.");
      await loadDashboardData();
    } catch (error) {
      console.log(error);
      setStatusMessage(error?.response?.data?.message || error.message || "Unable to save scores");
    } finally {
      setSavingScores(false);
    }
  };

  const handleSubscriptionUpdate = async (plan) => {
    if (!currentUserId) return;

    try {
      setSavingSubscription(true);
      const response = await API.post("/payments/checkout", {
        plan,
      });
      setCurrentUser(response.data.user);
      syncAuthUser(response.data.user);
      setStatusMessage(response.data.message || "Subscription activated.");
      await loadDashboardData();
    } catch (error) {
      console.log(error);
      setStatusMessage(error?.response?.data?.message || error.message || "Unable to complete payment");
    } finally {
      setSavingSubscription(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentUserId) return;

    try {
      setSavingSubscription(true);
      const response = await API.put(`/users/${currentUserId}/subscription`, {
        plan: subscription.plan || "monthly",
        status: "cancelled",
        autoRenew: false,
        renewalDate: subscription.renewalDate,
        startedAt: subscription.startedAt,
      });
      setCurrentUser(response.data);
      syncAuthUser(response.data);
      setStatusMessage("Subscription marked as cancelled.");
    } catch (error) {
      console.log(error);
      setStatusMessage(error?.response?.data?.message || error.message || "Unable to cancel subscription");
    } finally {
      setSavingSubscription(false);
    }
  };

  const handleSaveCharity = async () => {
    if (!currentUserId) return;

    try {
      setSavingCharity(true);
      const response = await API.put(`/users/${currentUserId}/charity`, charityForm);
      setCurrentUser(response.data);
      syncAuthUser(response.data);
      setStatusMessage("Charity preference updated.");
    } catch (error) {
      console.log(error);
      setStatusMessage(error?.response?.data?.message || error.message || "Unable to update charity");
    } finally {
      setSavingCharity(false);
    }
  };

  const handleProofSubmit = async () => {
    if (!latestResult?._id) return;

    try {
      setSubmittingProof(true);
      await API.put(`/result/${latestResult._id}/proof`, {
        proofUrl,
        proofNote,
      });
      setProofUrl("");
      setProofNote("");
      setStatusMessage("Winner proof submitted for admin review.");
      await loadDashboardData();
    } catch (error) {
      console.log(error);
      setStatusMessage(error?.response?.data?.message || error.message || "Unable to submit proof");
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleLogout = () => {
    redirectToSignIn();
  };

  const isActiveSubscription = String(subscription.status || "").toLowerCase() === "active";

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="dashboard-top">
          <div className="welcome">
            <div className="welcome-avatar">{avatarText}</div>
            <div className="welcome-text">
              <h1>{displayName}, own the next draw.</h1>
              <div className="progress" />
            </div>
          </div>

          <div className="dashboard-actions">
            <button className="view-dashboard-btn" onClick={() => (window.location.href = "/")}>
              Home
            </button>
            <button className="leaderboard-btn" onClick={() => (window.location.href = "/charities")}>
              Charities
            </button>
            <button className="leaderboard-btn" onClick={() => (window.location.href = "/leaderboard")}>
              Leaderboard
            </button>
            {String(currentUser?.role || "").toLowerCase() === "admin" && (
              <button className="leaderboard-btn" onClick={() => (window.location.href = "/admin")}>
                Admin
              </button>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="stats-bar">
          <div>Subscription: {subscription.status || "inactive"}</div>
          <div>Renewal: {formatDate(subscription.renewalDate)}</div>
          <div>Winnings: {formatCurrency(winnings)}</div>
        </div>

        {statusMessage && <div className="dashboard-banner">{statusMessage}</div>}

        <div className="dashboard-grid dashboard-grid--rich">
          <section className="dashboard-card score-card">
            <div className="dashboard-section-head">
              <div>
                <h2 className="card-title">Subscription Engine</h2>
                <p className="dashboard-helper">
                  Keep your account active to stay eligible for prize draws.
                </p>
              </div>
              <span className={`dashboard-chip dashboard-chip--${subscription.status || "inactive"}`}>
                {subscription.plan || "monthly"} / {subscription.status || "inactive"}
              </span>
            </div>

            <div className="dashboard-plan-grid">
              <button
                className={`dashboard-plan-card ${subscription.plan === "monthly" ? "dashboard-plan-card--active" : ""}`}
                onClick={() => handleSubscriptionUpdate("monthly")}
                disabled={savingSubscription}
              >
                <span>Monthly</span>
                <strong>{formatCurrency(100)}</strong>
                <small>Flexible monthly access</small>
              </button>

              <button
                className={`dashboard-plan-card ${subscription.plan === "yearly" ? "dashboard-plan-card--active" : ""}`}
                onClick={() => handleSubscriptionUpdate("yearly")}
                disabled={savingSubscription}
              >
                <span>Yearly</span>
                <strong>{formatCurrency(1000)}</strong>
                <small>Discounted annual commitment</small>
              </button>
            </div>

            <div className="dashboard-inline-actions">
              <button className="details-btn" onClick={handleCancelSubscription} disabled={savingSubscription}>
                Cancel Subscription
              </button>
            </div>

            <div className="dashboard-payment-history">
              {(payments || []).slice(0, 3).map((payment) => (
                <div key={payment._id} className="dashboard-payment-row">
                  <span>{payment.plan} / {payment.type}</span>
                  <strong>{formatCurrency(payment.amount)}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-card draw-card">
            <div className="dashboard-section-head">
              <div>
                <h2 className="card-title">Score Management</h2>
                <p className="dashboard-helper">
                  Add dated Stableford scores. The latest 5 are retained automatically.
                </p>
              </div>
              <span className="dashboard-chip">{scoreEntries.length}/5 saved locally</span>
            </div>

            <div className="dashboard-score-form">
              <input
                className="score-chip"
                type="number"
                min="1"
                max="45"
                value={scoreForm.value}
                onChange={(event) =>
                  setScoreForm((prev) => ({ ...prev, value: event.target.value }))
                }
                placeholder="Score"
              />
              <input
                className="dashboard-input dashboard-date-input"
                type="date"
                value={scoreForm.date}
                onChange={(event) =>
                  setScoreForm((prev) => ({ ...prev, date: event.target.value }))
                }
              />
              <button className="details-btn" onClick={handleAddScore}>
                Add Score
              </button>
            </div>

            <div className="score-history">
              {scoreEntries.length ? (
                scoreEntries.map((entry, index) => (
                  <div key={`${entry.value}-${entry.date}-${index}`} className="score-history-item">
                    <div className="score-history-value">{entry.value}</div>
                    <div className="dashboard-score-entry-fields">
                      <input
                        className="dashboard-input"
                        type="number"
                        min="1"
                        max="45"
                        value={entry.value}
                        onChange={(event) =>
                          handleScoreEntryChange(index, "value", event.target.value)
                        }
                      />
                      <input
                        className="dashboard-input"
                        type="date"
                        value={entry.date}
                        onChange={(event) =>
                          handleScoreEntryChange(index, "date", event.target.value)
                        }
                      />
                    </div>
                    <div className="score-history-date">{formatDate(entry.date)}</div>
                    <button className="dashboard-inline-remove" onClick={() => handleRemoveScore(index)}>
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="score-history-item">No score history yet.</div>
              )}
            </div>

            <button className="submit-scores-btn" onClick={handleSubmitScores} disabled={savingScores}>
              {savingScores ? "Saving..." : "Save Latest Scores"}
            </button>
          </section>

          <section className="dashboard-card charity-card">
            <div className="dashboard-section-head">
              <div>
                <h2 className="card-title">Charity Integration</h2>
                <p className="dashboard-helper">Choose your cause and set the share of your subscription.</p>
              </div>
            </div>

            <div className="dashboard-form-stack">
              <label className="dashboard-label">
                <span>Selected Charity</span>
                <select
                  className="dashboard-select"
                  value={charityForm.charityId}
                  onChange={(event) =>
                    setCharityForm((prev) => ({ ...prev, charityId: event.target.value }))
                  }
                >
                  <option value="">Choose a charity</option>
                  {charities.map((charity) => (
                    <option key={charity._id} value={charity._id}>
                      {charity.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="dashboard-label">
                <span>Contribution Percent</span>
                <input
                  className="dashboard-range"
                  type="range"
                  min="10"
                  max="40"
                  step="5"
                  value={charityForm.contributionPercent}
                  onChange={(event) =>
                    setCharityForm((prev) => ({
                      ...prev,
                      contributionPercent: Number(event.target.value),
                    }))
                  }
                />
              </label>

              <div className="dashboard-impact-card">
                <strong>{charityName}</strong>
                <span>{charityForm.contributionPercent}% of your subscription goes here.</span>
              </div>
            </div>

            <div className="dashboard-inline-actions">
              <button className="manage-btn" onClick={handleSaveCharity} disabled={savingCharity}>
                {savingCharity ? "Saving..." : "Save Charity Preference"}
              </button>
            </div>
          </section>

          <section className="dashboard-card winners-card">
            <div className="dashboard-section-head">
              <div>
                <h2 className="card-title">Participation Summary</h2>
                <p className="dashboard-helper">
                  Admin controls official publishing. You can track your latest draw status here.
                </p>
              </div>
            </div>

            <div className="draw-numbers">
              {draw.length ? (
                draw.map((num, index) => (
                  <div key={`${num}-${index}`} className={`ball ${index % 2 === 0 ? "ball--cyan" : "ball--pink"}`}>
                    {num}
                  </div>
                ))
              ) : (
                <div className="dashboard-helper">Official draw numbers will appear after the next published draw.</div>
              )}
            </div>

            <div className="dashboard-result-grid">
              <div className="dashboard-mini-card">
                <span>Draws Entered</span>
                <strong>{drawsEntered}</strong>
              </div>
              <div className="dashboard-mini-card">
                <span>Latest Result</span>
                <strong>{resultLabel}</strong>
              </div>
              <div className="dashboard-mini-card">
                <span>Match Count</span>
                <strong>{matchCount}</strong>
              </div>
            </div>

            <div className="dashboard-impact-card dashboard-impact-card--spaced">
              <strong>{isActiveSubscription ? "Eligible for next draw" : "Inactive membership"}</strong>
              <span>{isActiveSubscription ? upcomingDrawStatus : "Activate a plan to join upcoming draws."}</span>
            </div>
          </section>

          <section className="dashboard-card dashboard-card--proof">
            <div className="dashboard-section-head">
              <div>
                <h2 className="card-title">Winner Verification</h2>
                <p className="dashboard-helper">Upload your proof link and note for admin approval.</p>
              </div>
              <span className={`dashboard-chip dashboard-chip--${latestResult?.status || "inactive"}`}>
                {latestResult?.status || "no-result"}
              </span>
            </div>

            {latestResult && Number(latestResult.prize || 0) > 0 ? (
              <div className="dashboard-form-stack">
                <div className="dashboard-proof-summary">
                  <div>Prize: {formatCurrency(latestResult.prize)}</div>
                  <div>Status: {latestResult.status}</div>
                  <div>Proof: {latestResult.proofUrl ? "Submitted" : "Pending"}</div>
                </div>

                <label className="dashboard-label">
                  <span>Screenshot URL</span>
                  <input
                    className="dashboard-input"
                    type="text"
                    value={proofUrl}
                    onChange={(event) => setProofUrl(event.target.value)}
                    placeholder="Paste the golf platform screenshot link"
                  />
                </label>

                <label className="dashboard-label">
                  <span>Proof Note</span>
                  <textarea
                    className="dashboard-textarea"
                    value={proofNote}
                    onChange={(event) => setProofNote(event.target.value)}
                    placeholder="Add any context for the admin reviewer"
                  />
                </label>

                <button className="submit-scores-btn" onClick={handleProofSubmit} disabled={submittingProof}>
                  {submittingProof ? "Submitting..." : latestResult.proofUrl ? "Update Winner Proof" : "Submit Winner Proof"}
                </button>
              </div>
            ) : (
              <div className="dashboard-proof-empty">
                When you land a prize-winning draw, proof submission controls will show up here.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
