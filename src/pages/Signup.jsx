
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

export default function SignUp() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    // Check passwords
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.fullName,
            email: form.email,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      console.log("Signup response:", data);

      if (!response.ok) {
        throw new Error(
          data.error || "Signup failed"
        );
      }

      // Account created successfully
      setMessage("");

      alert("Account created successfully!");

      navigate("/login");

    } catch (error) {
      console.error("Signup error:", error);

      setMessage(
        error.message ||
        "Server connection error. Please try again."
      );

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-fullscreen-container">

      {/* Background ambient lighting elements */}
      <div className="auth-glow-bg"></div>

      <div className="auth-fullscreen-card">

        {/* Brand Header */}
        <Link to="/" className="auth-brand">

          <div className="auth-brand-icon">

            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04" />

              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04" />
            </svg>

          </div>

          InfoHub

        </Link>

        <h2>Create an Account</h2>

        <p className="auth-subtitle">
          Sign up to get started with InfoHub
        </p>

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >

          {/* Full Name */}
          <div className="auth-form-group">

            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={(event) =>
                setForm({
                  ...form,
                  fullName: event.target.value,
                })
              }
              required
            />

          </div>

          {/* Email */}
          <div className="auth-form-group">

            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email: event.target.value,
                })
              }
              required
            />

          </div>

          {/* Password */}
          <div className="auth-form-group">

            <label>Password</label>

            <div className="input-password-wrapper">

              <input
                type={
                  showPass
                    ? "text"
                    : "password"
                }
                placeholder="Create a password"
                value={form.password}
                onChange={(event) =>
                  setForm({
                    ...form,
                    password: event.target.value,
                  })
                }
                required
              />

              <button
                type="button"
                className="eye-icon-btn"
                onClick={() =>
                  setShowPass(!showPass)
                }
              >

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />

                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                  />
                </svg>

              </button>

            </div>

          </div>

          {/* Confirm Password */}
          <div className="auth-form-group">

            <label>Confirm Password</label>

            <div className="input-password-wrapper">

              <input
                type={
                  showConfirmPass
                    ? "text"
                    : "password"
                }
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={(event) =>
                  setForm({
                    ...form,
                    confirmPassword:
                      event.target.value,
                  })
                }
                required
              />

              <button
                type="button"
                className="eye-icon-btn"
                onClick={() =>
                  setShowConfirmPass(
                    !showConfirmPass
                  )
                }
              >

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />

                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                  />
                </svg>

              </button>

            </div>

          </div>

          {/* Error Message */}
          {message && (
            <p className="auth-message auth-error">
              {message}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn-auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Creating account..."
              : "Sign Up"}
          </button>

        </form>

        <p className="auth-switch-text">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}

