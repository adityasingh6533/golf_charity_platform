import { useState } from "react";
import "../styles/Auth.css";
import API from "../utils/api";

const initialFormState = {
  email: "",
  password: ""
};

export default function SignIn() {
  const [form, setForm] = useState(initialFormState);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const data = await API.auth.signin({
        email: form.email.trim(),
        password: form.password
      });

      if (!data?.user) {
        throw new Error(data?.message || "Unable to sign in.");
      }

      localStorage.setItem("authUser", JSON.stringify(data.user));
      if (data?.token) {
        localStorage.setItem("authToken", data.token);
      }
      setStatus({
        type: "success",
        text: data.message || `Welcome back, ${data.user.firstName}!`
      });
      setForm(initialFormState);
      window.location.href = "/dashboard"; 
    } catch (error) {
      setStatus({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <h2>Welcome Back</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {status && (
            <div className={`form-status ${status.type}`} role="status">
              {status.text}
            </div>
          )}

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p>
          Don't have an account?
          <a href="/signup"> Sign Up</a>
        </p>
      </div>
    </div>
  );
}
