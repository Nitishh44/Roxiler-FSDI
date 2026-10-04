import { useEffect, useState } from "react";
import API from "../services/api";
import "./Stores.css";

function Stores() {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const [storeResponse, userResponse] = await Promise.all([
        API.get("/stores", config),
        API.get("/users", config),
      ]);

      setStores(storeResponse.data.stores || storeResponse.data);
      const users = userResponse.data.users || userResponse.data;
      setOwners(users.filter((user) => user.role === "STORE_OWNER"));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await API.post(
        "/stores",
        {
          ...form,
          owner_id: Number(form.owner_id),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("Store created successfully!");
      setForm({ name: "", email: "", address: "", owner_id: "" });
      setShowForm(false);
      await fetchData();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to create store."
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredStores = stores.filter(
    (store) =>
      store.name?.toLowerCase().includes(search.toLowerCase()) ||
      store.address?.toLowerCase().includes(search.toLowerCase()) ||
      store.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="stores-page">
      <div className="stores-header">
        <div>
          <h2>Store Management</h2>
          <p>Manage and monitor all registered stores.</p>
        </div>

        <div className="stores-actions">
          <div className="stores-count">
            {stores.length} Total Stores
          </div>

          <button
            className="add-store-button"
            onClick={() => {
              setShowForm(!showForm);
              setMessage("");
            }}
          >
            + Add Store
          </button>
        </div>
      </div>

      {message && <p className="store-feedback">{message}</p>}

      {showForm && (
        <form className="add-store-form" onSubmit={handleSubmit}>
          <h3>Add New Store</h3>

          <label>Store Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            minLength={20}
            maxLength={60}
            placeholder="Enter store name"
            required
          />

          <label>Email Address</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="store@example.com"
            required
          />

          <label>Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            maxLength={400}
            placeholder="Enter store address"
            required
          />

          <label>Store Owner</label>
          <select
            name="owner_id"
            value={form.owner_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Store Owner</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} ({owner.email})
              </option>
            ))}
          </select>

          <button type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create Store"}
          </button>
        </form>
      )}

      <div className="stores-toolbar">
        <input
          type="text"
          placeholder="Search by store name, email or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="stores-table-card">
        {loading ? (
          <p className="stores-message">Loading stores...</p>
        ) : (
          <table className="stores-table">
            <thead>
              <tr>
                <th>Store Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Owner</th>
                <th>Rating</th>
              </tr>
            </thead>

            <tbody>
              {filteredStores.length > 0 ? (
                filteredStores.map((store) => (
                  <tr key={store.id}>
                    <td className="store-name">{store.name}</td>
                    <td>{store.email || "—"}</td>
                    <td>{store.address || "—"}</td>
                    <td>{store.owner_name || "—"}</td>
                    <td>
                      <span className="store-rating">
                        ★ {store.average_rating ?? store.avg_rating ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="stores-message">
                    No stores found.
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

export default Stores;