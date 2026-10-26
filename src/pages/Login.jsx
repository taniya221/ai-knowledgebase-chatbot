
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log("Login response:", data);

      // ==========================================
      // LOGIN SUCCESS
      // ==========================================

      if (response.ok) {

        // IMPORTANT:
        // Your backend sends the data inside data.user
        const user = data.user;

        console.log("User:", user);
        console.log("Role:", user?.role);

        // Check if user information exists
        if (!user) {
          setError("Invalid login response from server.");
          return;
        }

        // Get role
        const role = user.role
          ? user.role.toLowerCase()
          : "";

        // ==========================================
        // SAVE LOGIN INFORMATION
        // ==========================================

        localStorage.setItem(
          "role",
          role
        );

        localStorage.setItem(
          "name",
          user.name || ""
        );

        localStorage.setItem(
          "email",
          user.email || ""
        );

        // Also save complete user object
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );

        console.log(
          "Logged in role:",
          role
        );

        // ==========================================
        // ADMIN
        // ==========================================

        if (role === "admin") {

          console.log(
            "Admin login detected"
          );

          navigate(
            "/admin/dashboard",
            { replace: true }
          );

          return;
        }

        // ==========================================
        // USER
        // ==========================================

        if (role === "user") {

          console.log(
            "User login detected"
          );

          navigate(
            "/user-dashboard",
            { replace: true }
          );

          return;
        }

        // ==========================================
        // UNKNOWN ROLE
        // ==========================================

        console.error(
          "Unknown role:",
          user.role
        );

        setError(
          "Invalid user role."
        );

      } else {

        setError(
          data.message ||
          data.error ||
          "Invalid email or password"
        );
      }

    } catch (err) {

      console.error(
        "Login error:",
        err
      );

      setError(
        "Server connection error. Please try again."
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="auth-fullscreen-container">

      <div className="auth-glow-bg"></div>

      <div className="auth-fullscreen-card">

        <Link
          to="/"
          className="auth-brand"
        >
          <div className="auth-brand-icon">
            K
          </div>

          <span>KnoAI</span>
        </Link>

        <h2>
          Welcome back
        </h2>

        <p className="auth-subtitle">
          Please enter your details to sign in
        </p>

        <form
          onSubmit={handleLogin}
          className="auth-form"
        >

          {error && (
            <p className="auth-message auth-error">
              {error}
            </p>
          )}

          <div className="auth-form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>

          <div className="auth-form-group">

            <label>
              Password
            </label>

            <div className="input-password-wrapper">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="••••••••"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </button>

            </div>

          </div>

    
            <div className="forgot-pass-wrapper">
              <Link
                to="/forgot-password"
                className="forgot-link"
              >
                Forgot password?
              </Link>
            </div>


          <button
            type="submit"
            className="btn-auth-submit"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>

        </form>

        <p className="auth-switch-text">

          Don't have an account?{" "}

          <Link to="/signup">
            Sign up
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;




