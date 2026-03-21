import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../utils/commonapi";
import "../styles/Charities.css";

function formatCurrency(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "Date coming soon";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CharityDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    donorName: "",
    donorEmail: "",
    amount: 500,
    note: "",
  });

  useEffect(() => {
    const loadCharity = async () => {
      try {
        const res = await API.get(`/charities/${id}`);
        setData(res.data);
      } catch (error) {
        console.log(error);
        setStatus(error?.response?.data?.message || error.message || "Unable to load charity");
      }
    };

    loadCharity();
  }, [id]);

  const handleDonate = async () => {
    try {
      await API.post("/charities/donations", {
        charityId: id,
        ...form,
      });
      setStatus("Independent donation recorded locally.");
      const res = await API.get(`/charities/${id}`);
      setData(res.data);
      setForm({
        donorName: "",
        donorEmail: "",
        amount: 500,
        note: "",
      });
    } catch (error) {
      console.log(error);
      setStatus(error?.response?.data?.message || error.message || "Unable to save donation");
    }
  };

  const charity = data?.charity;

  return (
    <div className="charities-page">
      <div className="charities-shell">
        {charity ? (
          <>
            <section className="charities-hero">
              <div>
                <div className="charities-kicker">{charity.category}</div>
                <h1>{charity.name}</h1>
                <p>{charity.description}</p>
                <div className="charity-location">{charity.location}</div>
              </div>

              <div className="charities-actions">
                <button className="charities-btn charities-btn--primary" onClick={() => window.location.href = "/charities"}>
                  Back to Directory
                </button>
                <button className="charities-btn charities-btn--secondary" onClick={() => window.location.href = "/dashboard"}>
                  Dashboard
                </button>
              </div>
            </section>

            {status && <div className="charity-detail-banner">{status}</div>}

            <section className="charities-grid charities-grid--detail">
              <article className="charity-card charity-card--featured">
                <div className="charity-card-top">
                  <span className="charity-category">Impact</span>
                  <span className="charity-featured">{formatCurrency(data?.donationTotal || 0)}</span>
                </div>
                <h2>Why this charity matters</h2>
                <p>{charity.impact || "Impact story will be updated soon."}</p>

                <div className="charity-detail-events">
                  <h3>Upcoming events</h3>
                  {(charity.upcomingEvents || []).map((event, index) => (
                    <div key={`${event.title}-${index}`} className="charity-detail-event">
                      <strong>{event.title}</strong>
                      <span>{formatDate(event.date)} • {event.location}</span>
                      <p>{event.description}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="charity-card">
                <div className="charity-card-top">
                  <span className="charity-category">Independent Donation</span>
                </div>
                <h2>Support without gameplay</h2>

                <div className="charity-donation-form">
                  <input
                    className="charities-search"
                    placeholder="Your name"
                    value={form.donorName}
                    onChange={(event) => setForm((prev) => ({ ...prev, donorName: event.target.value }))}
                  />
                  <input
                    className="charities-search"
                    placeholder="Your email"
                    value={form.donorEmail}
                    onChange={(event) => setForm((prev) => ({ ...prev, donorEmail: event.target.value }))}
                  />
                  <input
                    className="charities-search"
                    type="number"
                    min="1"
                    value={form.amount}
                    onChange={(event) => setForm((prev) => ({ ...prev, amount: Number(event.target.value) }))}
                  />
                  <textarea
                    className="charity-donation-note"
                    placeholder="Optional note"
                    value={form.note}
                    onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                  />
                  <button className="charities-btn charities-btn--primary" onClick={handleDonate}>
                    Donate Locally
                  </button>
                </div>
              </article>
            </section>
          </>
        ) : (
          <div className="home-empty">Loading charity profile...</div>
        )}
      </div>
    </div>
  );
}
