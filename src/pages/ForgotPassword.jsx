
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgetPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/forgot-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            newPassword,
          }),
        }
      );

      const data = await response.json();
      setMessage(
        data.message ||
          (response.ok
            ? "Password reset request completed."
            : "Unable to reset password.")
      );

      if (response.ok && data.success) {
        setEmail("");
        setNewPassword("");

        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error) {
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        {/* KnoAI Logo */}
        <div className="brand">
          <div className="brand-icon">K</div>
          <h1 className="brand-name">KnoAI</h1>
        </div>

        {/* Heading */}
        <h2>Reset Password</h2>
        <p className="subtitle">
          Enter your details to reset your password
        </p>

        {/* Reset Password Form */}
        <form onSubmit={handleSubmit}>
          <label htmlFor="reset-email">Email</label>
          <input
            id="reset-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="new-password">New Password</label>
          <input
            id="new-password"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {/* Status Message */}
        {message && (
          <p className="reset-message" role="status">
            {message}
          </p>
        )}

        {/* Back to Login */}
        <p className="back-to-login">
          Remember your password?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
