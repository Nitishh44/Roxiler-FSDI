import { useEffect, useState } from "react";
import API from "../services/api";
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
      setUsers(response.data.users || response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
              <label>Full Name</label>
              <input
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
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Address</label>
              <textarea
                name="address"
                placeholder="Enter address"
                maxLength="400"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="8-16 characters, uppercase + special character"
                minLength="8"
                maxLength="16"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Role</label>
              <select
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
          type="text"
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
          <p className="users-message">Loading users...</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Role</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="user-name">{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.address || "—"}</td>
                    <td>
                      <span className={`role-badge ${user.role?.toLowerCase()}`}>
                        {user.role?.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="users-message">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Users;