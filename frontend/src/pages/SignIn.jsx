import { useState } from "react";
import "../styles/Auth.css";
import API from "../utils/api";

const initialFormState = {
  email: "",
  password: ""
};

const initialResetState = {
  identifier: "",
  newPassword: "",
  confirmPassword: ""
};

export default function SignIn() {
  const [form, setForm] = useState(initialFormState);
  const [resetForm, setResetForm] = useState(initialResetState);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetForm((prev) => ({ ...prev, [name]: value }));
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setStatus({ type: "error", text: "Reset passwords do not match." });
      return;
    }

    if (resetForm.newPassword.length <= 6) {
      setStatus({ type: "error", text: "Password must be greater than 6 characters." });
      return;
    }

    setResetLoading(true);
    setStatus(null);

    try {
      const data = await API.auth.forgotPassword({
        identifier: resetForm.identifier.trim(),
        newPassword: resetForm.newPassword,
      });

      setStatus({
        type: "success",
        text: data.message || "Password updated successfully.",
      });
      setResetForm(initialResetState);
      setShowForgotPassword(false);
    } catch (error) {
      setStatus({ type: "error", text: error.message });
    } finally {
      setResetLoading(false);
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
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setShowForgotPassword((prev) => !prev);
              setStatus(null);
            }}
            style={{ marginTop: "10px" }}
          >
            {showForgotPassword ? "Hide Forgot Password" : "Forgot Password?"}
          </button>
        </p>

        {showForgotPassword && (
          <form onSubmit={handleForgotPassword}>
            <input
              type="text"
              name="identifier"
              placeholder="Username or Email"
              value={resetForm.identifier}
              onChange={handleResetChange}
              required
            />

            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={resetForm.newPassword}
              onChange={handleResetChange}
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={resetForm.confirmPassword}
              onChange={handleResetChange}
              required
            />

            <button className="btn primary" type="submit" disabled={resetLoading}>
              {resetLoading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        <p>
          Don't have an account?
          <a href="/signup"> Sign Up</a>
        </p>
      </div>
    </div>
  );
}
