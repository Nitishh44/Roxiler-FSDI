import { useEffect, useRef, useState } from "react";

import API from "./services/api";

import "./App.css";

import Users from "./components/Users";

import Stores from "./components/Stores";

import UserDashboard from "./components/UserDashboard";

import OwnerDashboard from "./components/OwnerDashboard";

function App() {

  const [role, setRole] = useState("USER");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [isSignup, setIsSignup] = useState(false);

  const [showLanding, setShowLanding] = useState(true);

  const [name, setName] = useState("");

  const [address, setAddress] = useState("");

  const [signupMessage, setSignupMessage] = useState("");

  const [user, setUser] = useState(

    JSON.parse(localStorage.getItem("user") || "null")

  );

  const [stats, setStats] = useState(null);

  const [activePage, setActivePage] = useState("Overview");

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);

  const [showNew, setShowNew] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordMessage, setPasswordMessage] = useState("");

  const [passwordError, setPasswordError] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const skipStatsRefresh = useRef(false);

  const roleLabel = {

    ADMIN: "System Administrator",

    USER: "Normal User",

    STORE_OWNER: "Store Owner",

  };

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      return;
    }

    if (skipStatsRefresh.current) {
      skipStatsRefresh.current = false;
      return;
    }

    let active = true;

    API.get("/users/dashboard/stats")
      .then((dashboard) => {
        if (active) {
          setStats(dashboard.data.stats);
          setError("");
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message || "Failed to load dashboard statistics."
          );
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    setLoading(true);

    try {

      const response = await API.post("/auth/login", {

        email,

        password,

      });

      const { token, user } = response.data;

      if (user.role !== role) {

        setError("Please select the correct account role.");

        return;

      }

      localStorage.setItem("token", token);

      localStorage.setItem("user", JSON.stringify(user));

      skipStatsRefresh.current = user.role === "ADMIN";

      setUser(user);

      if (user.role === "ADMIN") {

        const dashboard = await API.get("/users/dashboard/stats", {

          headers: { Authorization: `Bearer ${token}` },

        });

        setStats(dashboard.data.stats);

      }

    } catch (err) {

      setError(

        err.response?.data?.message || "Login failed. Please try again."

      );

    } finally {

      setLoading(false);

    }

  };

  const handleSignup = async (e) => {

    e.preventDefault();

    setError("");

    setSignupMessage("");

    if (name.trim().length < 20 || name.trim().length > 60) {

      setError("Name must be between 20 and 60 characters.");

      return;

    }

    if (address.trim().length > 400) {

      setError("Address cannot exceed 400 characters.");

      return;

    }

    if (!/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(password)) {

      setError(

        "Password must be 8-16 characters with at least one uppercase letter and special character."

      );

      return;

    }

    setLoading(true);

    try {

      const response = await API.post("/auth/signup", {

        name: name.trim(),

        email: email.trim(),

        address: address.trim(),

        password,

      });

      setSignupMessage(

        response.data.message || "Account created successfully! Please sign in."

      );

      setIsSignup(false);

      setName("");

      setAddress("");

      setPassword("");

    } catch (err) {

      setError(

        err.response?.data?.message || "Signup failed. Please try again."

      );

    } finally {

      setLoading(false);

    }

  };

  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setUser(null);

    setStats(null);

    setShowLanding(true);

    setIsSignup(false);

    setActivePage("Overview");

    setEmail("");

    setPassword("");

  };

  const handleChangePassword = async (e) => {

    e.preventDefault();

    setPasswordMessage("");

    setPasswordError("");

    if (newPassword !== confirmPassword) {

      setPasswordError("New password and confirm password do not match.");

      return;

    }

    if (!/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(newPassword)) {

      setPasswordError(

        "Password must be 8-16 characters with at least one uppercase letter and special character."

      );

      return;

    }

    setPasswordLoading(true);

    try {

      const response = await API.put("/auth/change-password", {

        currentPassword,

        newPassword,

      });

      setPasswordMessage(

        response.data.message || "Password changed successfully!"

      );

      setCurrentPassword("");

      setNewPassword("");

      setConfirmPassword("");

    } catch (err) {

      console.error(

        "CHANGE PASSWORD ERROR:",

        err.response?.data || err

      );

      setPasswordError(

        err.response?.data?.message ||

          err.message ||

          "Failed to change password."

      );

    } finally {

      setPasswordLoading(false);

    }

  };

  if (user) {

    return (

      <div className="dashboard-layout">

        <aside className="sidebar">

          <div className="sidebar-brand">

            <div className="brand-icon">R</div>

            <div>

              <h2>Roxiler</h2>

              <span>STORE PLATFORM</span>

            </div>

          </div>

          <div className="sidebar-section">WORKSPACE</div>

          <button

            className={`nav-item ${activePage === "Overview" ? "active" : ""}`}

            onClick={() => setActivePage("Overview")}

          >

            <span>▦</span> Overview

          </button>

          {user.role === "ADMIN" && (

            <>

              <button

                className={`nav-item ${activePage === "Users" ? "active" : ""}`}

                onClick={() => setActivePage("Users")}

              >

                <span>♙</span> Users

              </button>

              <button

                className={`nav-item ${activePage === "Stores" ? "active" : ""}`}

                onClick={() => setActivePage("Stores")}

              >

                <span>⌂</span> Stores

              </button>

            </>

          )}

          <button

            className={`nav-item ${

              activePage === "Change Password" ? "active" : ""

            }`}

            onClick={() => setActivePage("Change Password")}

          >

            <span>⚙</span> Change Password

          </button>

          <div className="sidebar-bottom">

            <div className="sidebar-user">

              <div className="avatar">

                {user.name?.charAt(0).toUpperCase()}

              </div>

              <div className="user-info">

                <strong>{user.name}</strong>

                <span>{roleLabel[user.role] || user.role}</span>

              </div>

            </div>

            <button className="logout-button" onClick={handleLogout}>

              ↪ Logout

            </button>

          </div>

        </aside>

        <main className="dashboard-main">

          <header className="topbar">

            <div>

              <p className="breadcrumb">Workspace / {activePage}</p>

              <h1>{activePage}</h1>

            </div>

            <div className="topbar-profile">

              <div className="avatar">

                {user.name?.charAt(0).toUpperCase()}

              </div>

              <div>

                <strong>{user.name}</strong>

                <span>{roleLabel[user.role] || user.role}</span>

              </div>

            </div>

          </header>

          <section className="dashboard-content">

            {user.role === "ADMIN" && activePage === "Overview" && (

              <>

                <div className="welcome-section">

                  <div>

                    <h2>Welcome back, {user.name.split(" ")[0]}! 👋</h2>

                    <p>

                      Here's what's happening with your platform today.

                    </p>

                  </div>

                  <span className="live-badge">● Live Overview</span>

                </div>

                <div className="stats-grid">

                  <div className="stat-card">

                    <div className="stat-top">

                      <span>Total Users</span>

                      <div className="stat-icon purple">♙</div>

                    </div>

                    <h2>{stats?.totalUsers ?? "—"}</h2>

                    <p>Registered platform users</p>

                  </div>

                  <div className="stat-card">

                    <div className="stat-top">

                      <span>Total Stores</span>

                      <div className="stat-icon blue">⌂</div>

                    </div>

                    <h2>{stats?.totalStores ?? "—"}</h2>

                    <p>Stores listed on platform</p>

                  </div>

                  <div className="stat-card">

                    <div className="stat-top">

                      <span>Total Ratings</span>

                      <div className="stat-icon orange">★</div>

                    </div>

                    <h2>{stats?.totalRatings ?? "—"}</h2>

                    <p>Ratings submitted by users</p>

                  </div>

                </div>

                <div className="content-panel">

                  <div className="panel-heading">

                    <div>

                      <h3>Platform Summary</h3>

                      <p>Current account distribution</p>

                    </div>

                    <span className="panel-tag">Overview</span>

                  </div>

                  <div className="summary-grid">

                    <div className="summary-item">

                      <span>Normal Users</span>

                      <strong>{stats?.totalNormalUsers ?? "—"}</strong>

                    </div>

                    <div className="summary-item">

                      <span>Store Owners</span>

                      <strong>{stats?.totalStoreOwners ?? "—"}</strong>

                    </div>

                    <div className="summary-item">

                      <span>Administrators</span>

                      <strong>{stats?.totalAdmins ?? "—"}</strong>

                    </div>

                  </div>

                </div>

              </>

            )}

            {activePage === "Users" && user.role === "ADMIN" && (

              <Users />

            )}

            {activePage === "Stores" && user.role === "ADMIN" && (

              <Stores />

            )}

            {user.role === "USER" && activePage === "Overview" && (

              <UserDashboard />

            )}

            {user.role === "STORE_OWNER" && activePage === "Overview" && (

              <OwnerDashboard />

            )}

            {activePage === "Change Password" && (

              <div className="content-panel">

                <div className="panel-heading">

                  <div>

                    <h3>Change Password</h3>

                    <p>Update your account password securely.</p>

                  </div>

                </div>

                <form

                  onSubmit={handleChangePassword}

                  className="password-form"

                >

                  <label htmlFor="current-password">Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="current-password"

                      type={showCurrent ? "text" : "password"}

                      placeholder="Enter current password"

                      value={currentPassword}

                      onChange={(e) => setCurrentPassword(e.target.value)}

                      required

                    />

                    <button

                      type="button"

                      className="password-toggle"

                      onClick={() => setShowCurrent(!showCurrent)}

                    >

                      {showCurrent ? "🙈 Hide" : "👁 Show"}

                    </button>

                  </div>

                  <label htmlFor="new-password">New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="new-password"

                      type={showNew ? "text" : "password"}

                      placeholder="Enter new password"

                      value={newPassword}

                      onChange={(e) => setNewPassword(e.target.value)}

                      required

                    />

                    <button

                      type="button"

                      className="password-toggle"

                      onClick={() => setShowNew(!showNew)}

                    >

                      {showNew ? "🙈 Hide" : "👁 Show"}

                    </button>

                  </div>

                  <label htmlFor="confirm-password">Confirm New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="confirm-password"

                      type={showConfirm ? "text" : "password"}

                      placeholder="Confirm new password"

                      value={confirmPassword}

                      onChange={(e) => setConfirmPassword(e.target.value)}

                      required

                    />

                    <button

                      type="button"

                      className="password-toggle"

                      onClick={() => setShowConfirm(!showConfirm)}

                    >

                      {showConfirm ? "🙈 Hide" : "👁 Show"}

                    </button>

                  </div>

                  {passwordError && (

                    <p className="error-message" role="alert">{passwordError}</p>

                  )}

                  {passwordMessage && (

                    <p className="success-message" role="status">{passwordMessage}</p>

                  )}

                  <button type="submit" disabled={passwordLoading}>

                    {passwordLoading ? "Updating..." : "Update Password"}

                  </button>

                </form>

              </div>

            )}

          </section>

        </main>

      </div>

    );

  }

  return (

    <div className={showLanding ? "app app-landing" : "app"}>

      {showLanding ? (

        <main className="welcome-page">

          <header className="welcome-nav">

            <a className="welcome-brand" href="#home" aria-label="Roxiler home">

              <span className="welcome-brand-icon">R</span>

              <span>roxiler<span className="brand-period">.</span></span>

            </a>

            <nav className="welcome-nav-actions" aria-label="Main navigation">

              <a className="welcome-nav-link" href="#features">Features</a>

              <button
                className="welcome-login-button"
                type="button"
                onClick={() => {
                  setIsSignup(false);
                  setError("");
                  setSignupMessage("");
                  setShowLanding(false);
                }}
              >
                Log in
              </button>

              <button
                className="welcome-nav-cta"
                type="button"
                onClick={() => {
                  setIsSignup(true);
                  setError("");
                  setSignupMessage("");
                  setShowLanding(false);
                }}
              >
                Get started <span aria-hidden="true">↗</span>
              </button>

            </nav>

          </header>

          <section className="welcome-hero" id="home">

            <div className="hero-copy">

              <div className="hero-eyebrow">

                <span className="eyebrow-spark">✦</span>
                A store-rating platform for your whole community

              </div>

              <h1>

                Great stores deserve
                <span> great ratings.</span>

              </h1>

              <p className="hero-description">

                Explore local stores and submit 1–5 star ratings. Store owners
                get useful customer insights, while administrators manage the
                platform from one role-based workspace.

              </p>

              <div className="hero-actions">

                <button
                  className="hero-primary-button"
                  type="button"
                  onClick={() => {
                    setIsSignup(true);
                    setError("");
                    setSignupMessage("");
                    setShowLanding(false);
                  }}
                >
                  Create your account <span aria-hidden="true">→</span>
                </button>

                <button
                  className="hero-secondary-button"
                  type="button"
                  onClick={() => {
                    setIsSignup(false);
                    setError("");
                    setSignupMessage("");
                    setShowLanding(false);
                  }}
                >
                  I already have an account
                </button>

              </div>

              <div className="hero-trust">

                <div className="trust-avatars" aria-hidden="true">
                  <span>J</span><span>M</span><span>A</span><span>+</span>
                </div>

                <p><strong>Built for your community</strong><br />Customers, owners, and teams in one place</p>

              </div>

            </div>

            <div className="hero-visual" aria-label="Store rating dashboard preview">

              <div className="visual-glow" />

              <div className="preview-window">

                <div className="preview-topbar">

                  <div className="preview-brand">

                    <span className="preview-brand-icon">R</span>
                    <span>roxiler</span>

                  </div>

                  <span className="preview-demo-label">SAMPLE PREVIEW</span>

                </div>

                <div className="preview-content">

                  <div className="preview-heading">

                    <div>
                      <span className="preview-kicker">YOUR LOCAL GUIDE</span>
                      <h2>Discover places<br />worth coming back to.</h2>
                    </div>

                    <span className="preview-sparkle" aria-hidden="true">✦</span>

                  </div>

                  <div className="preview-search">
                    <span aria-hidden="true">⌕</span>
                    <span>Search stores near you</span>
                    <span className="search-filter">☷</span>
                  </div>

                  <div className="preview-section-title">
                    <strong>Community favorites</strong>
                    <span>Store discovery</span>
                  </div>

                  <div className="preview-store-card">
                    <div className="store-art store-art-one"><span>✿</span></div>
                    <div className="preview-store-info">
                      <strong>Cornerstone Coffee</strong>
                      <span>☕ Café · Customer reviews</span>
                      <div className="store-rating"><span>★★★★★</span><small>Sample rating</small></div>
                    </div>
                    <span className="store-bookmark" aria-hidden="true">♡</span>
                  </div>

                  <div className="preview-store-card">
                    <div className="store-art store-art-two"><span>✳</span></div>
                    <div className="preview-store-info">
                      <strong>Wildflower Market</strong>
                      <span>❀ Florist · Customer reviews</span>
                      <div className="store-rating"><span>★★★★★</span><small>Sample rating</small></div>
                    </div>
                    <span className="store-bookmark" aria-hidden="true">♡</span>
                  </div>

                </div>

              </div>

              <div className="floating-rating">
                <span className="floating-rating-icon">★</span>
                <div><strong>Every voice counts</strong><small>Real customer feedback</small></div>
              </div>

              <div className="floating-note"><span>✦</span> Your next favorite is nearby</div>

            </div>

          </section>

          <section className="welcome-features" id="features">

            <div className="features-intro">
              <span>THREE ROLES, ONE RATING PLATFORM</span>
              <h2>Discover, rate,<br /><em>and grow together.</em></h2>
            </div>

            <div className="feature-list">

              <article className="feature-item">
                <span className="feature-icon feature-icon-purple">⌕</span>
                <div><h3>Customers rate stores</h3><p>Search stores by name or address, then submit or update a rating from 1 to 5.</p></div>
              </article>

              <article className="feature-item">
                <span className="feature-icon feature-icon-peach">↗</span>
                <div><h3>Owners see feedback</h3><p>Store owners can track their average rating and see the customers who rated them.</p></div>
              </article>

              <article className="feature-item">
                <span className="feature-icon feature-icon-green">◈</span>
                <div><h3>Admins manage the platform</h3><p>Manage users and stores, review ratings, and monitor platform-wide totals.</p></div>
              </article>

            </div>

          </section>

          <section className="welcome-cta">
            <div className="cta-decoration cta-decoration-one" aria-hidden="true">✳</div>
            <div className="cta-decoration cta-decoration-two" aria-hidden="true">✦</div>
            <span className="cta-eyebrow">A BETTER WAY TO SHOP LOCAL</span>
            <h2>Make your next local<br /><em>favorite a little closer.</em></h2>
            <p>Join Roxiler to discover trusted stores and share the experiences that help your community thrive.</p>
            <div className="cta-actions">
              <button
                className="cta-primary-button"
                type="button"
                onClick={() => {
                  setIsSignup(true);
                  setError("");
                  setSignupMessage("");
                  setShowLanding(false);
                }}
              >
                Get started for free <span aria-hidden="true">→</span>
              </button>
              <button
                className="cta-secondary-button"
                type="button"
                onClick={() => {
                  setIsSignup(false);
                  setError("");
                  setSignupMessage("");
                  setShowLanding(false);
                }}
              >
                Sign in to your account
              </button>
            </div>
          </section>

          <footer className="welcome-footer">
            <a className="welcome-brand footer-brand" href="#home"><span className="welcome-brand-icon">R</span><span>roxiler<span className="brand-period">.</span></span></a>
            <span>Discover better. Support local.</span>
            <span>© 2026 Roxiler</span>
          </footer>

        </main>

      ) : (

      <div className="login-card">

        <button
          type="button"
          className="back-home"
          onClick={() => {
            setError("");
            setSignupMessage("");
            setShowLanding(true);
          }}
        >
          <span aria-hidden="true">←</span> Back to home
        </button>

        <div className="login-brand-icon">R</div>

        <h1>Roxiler</h1>

        <p className="subtitle">STORE RATING PLATFORM</p>

        <h2>{isSignup ? "Create Account" : "Welcome Back!"}</h2>

        <p className="description">

          {isSignup

            ? "Join Roxiler and start rating your favorite stores."

            : "Sign in to access your account and manage your workspace."}

        </p>

        <form onSubmit={isSignup ? handleSignup : handleLogin}>

          {isSignup && (

            <>

              <label htmlFor="signup-name">Full Name</label>

              <input
                id="signup-name"
                type="text"

                placeholder="Enter your full name"

                value={name}

                onChange={(e) => setName(e.target.value)}

                minLength={20}

                maxLength={60}

                required

              />

              <label htmlFor="signup-address">Address</label>

              <textarea
                id="signup-address"
                placeholder="Enter your address"

                value={address}

                onChange={(e) => setAddress(e.target.value)}

                maxLength={400}

                required

              />

            </>

          )}

          <label htmlFor="auth-email">Email Address</label>

          <input
            id="auth-email"
            type="email"

            placeholder="Enter your email"

            value={email}

            onChange={(e) => setEmail(e.target.value)}

            required

          />

          <label htmlFor="auth-password">Password</label>

          <input
            id="auth-password"
            type="password"

            placeholder="Enter your password"

            value={password}

            onChange={(e) => setPassword(e.target.value)}

            minLength={8}

            maxLength={16}

            required

          />

          {!isSignup && (

            <>

              <label htmlFor="auth-role">Login As</label>

              <select id="auth-role" value={role} onChange={(e) => setRole(e.target.value)}>

                <option value="USER">Normal User</option>

                <option value="STORE_OWNER">Store Owner</option>

                <option value="ADMIN">System Administrator</option>

              </select>

            </>

          )}

          {error && <p className="error-message" role="alert">{error}</p>}

          {signupMessage && (

            <p className="success-message" role="status">{signupMessage}</p>

          )}

          <button type="submit" disabled={loading}>

            {loading

              ? isSignup

                ? "Creating Account..."

                : "Signing In..."

              : isSignup

                ? "Create Account →"

                : "Sign In →"}

          </button>

          <p className="auth-switch">

            {isSignup

              ? "Already have an account?"

              : "New to Roxiler?"}{" "}

            <button

              type="button"

              className="text-button"

              onClick={() => {

                setIsSignup(!isSignup);

                setError("");

                setSignupMessage("");

              }}

            >

              {isSignup ? "Sign In" : "Create Account"}

            </button>

          </p>

        </form>

        <p className="footer">

          Secure access to your Roxiler account

        </p>

      </div>

      )}

    </div>

  );

}

export default App;
