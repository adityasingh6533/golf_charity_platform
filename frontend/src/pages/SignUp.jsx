import { useEffect, useState } from "react";
import "../styles/Auth.css";
import API from "../utils/api";
import commonapi from "../utils/commonapi";

const initialFormState = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  charityId: "",
  contributionPercent: 10,
  subscriptionPlan: "monthly"
};

export default function SignUp() {
  const [form, setForm] = useState(initialFormState);
  const [charities, setCharities] = useState([]);
  const [charitiesLoading, setCharitiesLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCharities = async () => {
      try {
        const res = await commonapi.get("/charities");
        setCharities(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.log(error);
        setStatus({
          type: "error",
          text: "We could not load charities right now. Please refresh and try again."
        });
      } finally {
        setCharitiesLoading(false);
      }
    };

    loadCharities();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setStatus({ type: "error", text: "Passwords do not match." });
      return;
    }

    if (form.password.length <= 6) {
      setStatus({ type: "error", text: "Password must be greater than 6 characters." });
      return;
    }

    if (!form.charityId) {
      setStatus({ type: "error", text: "Please select a charity before creating your account." });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const data = await API.auth.signup({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        charityId: form.charityId || null,
        contributionPercent: Number(form.contributionPercent || 10),
        subscriptionPlan: form.subscriptionPlan
      });

      if (!data?.user) {
        throw new Error(data?.message || "Unable to create account.");
      }

      setStatus({
        type: "success",
        text: data.message || "Account created! You can now log in."
      });
      setForm(initialFormState);
    } catch (error) {
      setStatus({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card auth-card--wide">
        <h2>Start a new account</h2>

        <form onSubmit={handleSubmit}>
          <div className="name-row">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <select
            className="auth-select"
            name="subscriptionPlan"
            value={form.subscriptionPlan}
            onChange={handleChange}
          >
            <option value="monthly">Monthly membership</option>
            <option value="yearly">Yearly membership</option>
          </select>

          <select
            className="auth-select"
            name="charityId"
            value={form.charityId}
            onChange={handleChange}
            disabled={charitiesLoading || charities.length === 0}
          >
            <option value="">
              {charitiesLoading
                ? "Loading charities..."
                : charities.length === 0
                  ? "No charities available right now"
                  : "Select a charity at signup"}
            </option>
            {charities.map((charity) => (
              <option key={charity._id} value={charity._id}>
                {charity.name}
              </option>
            ))}
          </select>

          <label className="auth-range-label">
            <span>Charity contribution: {form.contributionPercent}%</span>
            <input
              className="auth-range"
              type="range"
              name="contributionPercent"
              min="10"
              max="40"
              step="5"
              value={form.contributionPercent}
              onChange={handleChange}
            />
          </label>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          {status && (
            <div className={`form-status ${status.type}`} role="status">
              {status.text}
            </div>
          )}

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p>
          Already have an account?
          <a href="/signin"> Login</a>
        </p>
      </div>
    </div>
  );
}
