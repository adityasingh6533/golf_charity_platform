import { useEffect, useMemo, useState } from "react";
import API from "../utils/commonapi";
import "../styles/Charities.css";

export default function Charities() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const res = await API.get("/charities");
        setCharities(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCharities();
  }, []);

  const categories = useMemo(() => {
    return [...new Set(charities.map((charity) => charity.category).filter(Boolean))];
  }, [charities]);

  const filtered = charities.filter((charity) => {
    const searchValue = search.toLowerCase();
    const matchesSearch =
      !search ||
      charity.name?.toLowerCase().includes(searchValue) ||
      charity.description?.toLowerCase().includes(searchValue) ||
      charity.impact?.toLowerCase().includes(searchValue) ||
      charity.location?.toLowerCase().includes(searchValue) ||
      charity.category?.toLowerCase().includes(searchValue);
    const matchesCategory = !category || charity.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="charities-page">
      <div className="charities-shell">
        <section className="charities-hero">
          <div>
            <div className="charities-kicker">Impact Directory</div>
            <h1>Choose A Cause Worth Backing</h1>
            <p>
              Browse featured charities, filter by category, and discover where each subscription
              can create real-world impact.
            </p>
          </div>

          <div className="charities-actions">
            <button className="charities-btn charities-btn--primary" onClick={() => window.location.href = "/dashboard"}>
              Back to Dashboard
            </button>
            <button className="charities-btn charities-btn--secondary" onClick={() => window.location.href = "/"}>
              Home
            </button>
          </div>
        </section>

        <section className="charities-filter-bar">
          <input
            className="charities-search"
            type="text"
            placeholder="Search by charity name or impact"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            className="charities-select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </section>

        <section className="charities-grid">
          {filtered.map((charity) => (
            <article key={charity._id} className={`charity-card ${charity.featured ? "charity-card--featured" : ""}`}>
              <div className="charity-card-top">
                <span className="charity-category">{charity.category}</span>
                {charity.featured && <span className="charity-featured">Featured</span>}
              </div>
              <h2>{charity.name}</h2>
              <p>{charity.description}</p>
              <div className="charity-impact">{charity.impact || "Impact story updating soon."}</div>
              <div className="charity-location">{charity.location}</div>
              <button
                className="charities-btn charities-btn--primary charity-card-btn"
                onClick={() => {
                  window.location.href = `/charities/${charity._id}`;
                }}
              >
                View Profile
              </button>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
