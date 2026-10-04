
import { useState } from "react";
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

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const [stats, setStats] = useState(null);
  const [activePage, setActivePage] = useState("Overview");

  const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [passwordMessage, setPasswordMessage] = useState("");
const [passwordError, setPasswordError] = useState("");
const [passwordLoading, setPasswordLoading] = useState(false);

  const roleLabel = {
    ADMIN: "System Administrator",
    USER: "Normal User",
    STORE_OWNER: "Store Owner",
  };

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setStats(null);
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
    setPasswordError(
      err.response?.data?.message || "Failed to change password."
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

          <button
  className={`nav-item ${activePage === "Change Password" ? "active" : ""}`}
  onClick={() => setActivePage("Change Password")}
>
  <span>⚙</span> Change Password
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

    <form onSubmit={handleChangePassword} className="password-form">
      <label>Current Password</label>
      <input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
      />

      <label>New Password</label>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />

      <label>Confirm New Password</label>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      {passwordError && (
        <p className="error-message">{passwordError}</p>
      )}

      {passwordMessage && (
        <p style={{ color: "green" }}>{passwordMessage}</p>
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
    <div className="app">
      <div className="login-card">
        <div className="login-brand-icon">R</div>
        <h1>Roxiler</h1>
        <p className="subtitle">STORE RATING PLATFORM</p>

        <h2>Welcome Back!</h2>
        <p className="description">
          Sign in to access your account and manage your workspace.
        </p>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Login As</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="USER">Normal User</option>
            <option value="STORE_OWNER">Store Owner</option>
            <option value="ADMIN">System Administrator</option>
          </select>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In →"}
          </button>
        </form>

        <p className="footer">
          Secure access to your Roxiler account
        </p>
      </div>
    </div>
  );
}

export default App;

