import { useEffect, useState } from "react";
import API from "../services/api";
import { sortRows } from "../utils/sortRows";
import "./Users.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sort, setSort] = useState({ key: "name", direction: "asc" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    role: "USER",
  });

  const fetchUsers = async () => {
    try {
      const response = await API.get("/users");
      setError("");
      setUsers(response.data.users || response.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    API.get("/users")
      .then((response) => {
        if (active) {
          setUsers(response.data.users || response.data);
        }
      })
      .catch((error) => {
        if (active) {
          setError(
            error.response?.data?.message || "Failed to load users."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      setSaving(true);

      const response = await API.post("/users", form);

      setMessage(response.data.message || "User created successfully!");

      setForm({
        name: "",
        email: "",
        address: "",
        password: "",
        role: "USER",
      });

      await fetchUsers();
      setShowForm(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create user"
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.address?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = role === "ALL" || user.role === role;

    return matchesSearch && matchesRole;
  });
  const sortedUsers = sortRows(filteredUsers, sort.key, sort.direction);

  const handleSort = (key) => {
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const openUserDetails = async (userId) => {
    setSelectedUser(null);
    setDetailError("");
    setDetailLoading(true);

    try {
      const response = await API.get(`/users/${userId}`);
      setSelectedUser(response.data);
    } catch (err) {
      setDetailError(
        err.response?.data?.message || "Failed to load user details."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const sortIndicator = (key) =>
    sort.key === key ? (sort.direction === "asc" ? "↑" : "↓") : "↕";

  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <h1>User Management</h1>
          <p>Manage and monitor all registered platform users.</p>
        </div>

        <div className="users-header-actions">
          <div className="users-count">
            {users.length} Total Users
          </div>

          <button
            className="add-user-btn"
            onClick={() => {
              setShowForm(!showForm);
              setError("");
              setMessage("");
            }}
          >
            {showForm ? "Cancel" : "+ Add User"}
          </button>
        </div>
      </div>

      {message && <div className="user-success">{message}</div>}
      {error && <div className="user-error">{error}</div>}

      {showForm && (
        <div className="add-user-card">
          <h2>Create New User</h2>

          <form onSubmit={handleSubmit} className="add-user-form">
            <div className="form-field">
              <label htmlFor="user-name">Full Name</label>
              <input
                id="user-name"
                type="text"
                name="name"
                placeholder="Enter full name (20-60 characters)"
                minLength="20"
                maxLength="60"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="user-email">Email</label>
              <input
                id="user-email"
                type="email"
                name="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="user-address">Address</label>
              <textarea
                id="user-address"
                name="address"
                placeholder="Enter address"
                maxLength="400"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="user-password">Password</label>
              <input
                id="user-password"
                type="password"
                name="password"
                placeholder="8-16 characters, uppercase + special character"
                minLength="8"
                maxLength="16"
                pattern="^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$"
                title="Use 8-16 characters with at least one uppercase letter and one special character."
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="user-role">Role</label>
              <select
                id="user-role"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="USER">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              className="save-user-btn"
              disabled={saving}
            >
              {saving ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>
      )}

      <div className="users-toolbar">
        <input
          type="search"
          aria-label="Search users by name, email, or address"
          placeholder="Search by name, email or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">Normal User</option>
          <option value="STORE_OWNER">Store Owner</option>
        </select>
      </div>

      <div className="users-table-card">
        {loading ? (
          <p className="users-message" role="status">Loading users...</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                {[
                  ["name", "Name"],
                  ["email", "Email"],
                  ["address", "Address"],
                  ["role", "Role"],
                ].map(([key, label]) => (
                  <th
                    key={key}
                    aria-sort={
                      sort.key === key
                        ? sort.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <button
                      type="button"
                      className="table-sort-button"
                      onClick={() => handleSort(key)}
                    >
                      {label}<span aria-hidden="true">{sortIndicator(key)}</span>
                    </button>
                  </th>
                ))}
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {sortedUsers.length > 0 ? (
                sortedUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="user-name">{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.address || "—"}</td>
                    <td>
                      <span className={`role-badge ${user.role?.toLowerCase()}`}>
                        {user.role?.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="user-details-button"
                        onClick={() => openUserDetails(user.id)}
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="users-message">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {(detailLoading || detailError || selectedUser) && (
        <div
          className="user-detail-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedUser(null);
              setDetailError("");
            }
          }}
        >
          <section
            className="user-detail-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-detail-title"
          >
            <div className="user-detail-header">
              <div>
                <span className="user-detail-eyebrow">ACCOUNT PROFILE</span>
                <h2 id="user-detail-title">User details</h2>
              </div>
              <button
                type="button"
                className="user-detail-close"
                aria-label="Close user details"
                onClick={() => {
                  setSelectedUser(null);
                  setDetailError("");
                }}
              >
                ×
              </button>
            </div>

            {detailLoading && <p className="users-message">Loading user details...</p>}
            {detailError && <p className="user-error">{detailError}</p>}
            {selectedUser && (
              <>
                <dl className="user-detail-fields">
                  <div><dt>Name</dt><dd>{selectedUser.user.name}</dd></div>
                  <div><dt>Email</dt><dd>{selectedUser.user.email}</dd></div>
                  <div><dt>Address</dt><dd>{selectedUser.user.address || "—"}</dd></div>
                  <div>
                    <dt>Role</dt>
                    <dd>
                      <span className={`role-badge ${selectedUser.user.role?.toLowerCase()}`}>
                        {selectedUser.user.role?.replace("_", " ")}
                      </span>
                    </dd>
                  </div>
                </dl>
                {selectedUser.user.role === "STORE_OWNER" && (
                  <div className="user-owner-ratings">
                    <h3>Store ratings</h3>
                    {selectedUser.stores.length === 0 ? (
                      <p>No stores are assigned to this owner yet.</p>
                    ) : (
                      selectedUser.stores.map((store) => (
                        <div className="user-owner-rating" key={store.id}>
                          <strong>{store.name}</strong>
                          <span>★ {Number(store.average_rating).toFixed(2)} <small>({store.total_ratings} ratings)</small></span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default Users;