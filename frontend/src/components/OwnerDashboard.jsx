import { useEffect, useState } from "react";
import API from "../services/api";
import { sortRows } from "../utils/sortRows";
import "./OwnerDashboard.css";

function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState({ key: "created_at", direction: "desc" });

  const handleSort = (key) => {
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortIndicator = (key) =>
    sort.key === key ? (sort.direction === "asc" ? "↑" : "↓") : "↕";

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await API.get("/stores/owner/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setData(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <p className="owner-loading" role="status">Loading your store insights...</p>;
  }

  if (error) {
    return <div className="content-panel owner-error" role="alert">{error}</div>;
  }

  if (!data) {
    return <div className="content-panel">No dashboard data found.</div>;
  }

  // Supports both old and new backend response formats
  const stores =
    data.stores ||
    (data.store
      ? [
          {
            ...data.store,
            averageRating: data.averageRating,
            totalRatings: data.totalRatings,
          },
        ]
      : []);

  const raters = data.raters || [];

  if (stores.length === 0) {
    return (
      <div className="content-panel">
        <h3>No stores found</h3>
      </div>
    );
  }

  return (
    <div className="owner-dashboard">
      <h2>Store Owner Dashboard</h2>

      {stores.map((store) => {
        const storeRaters = data.store
        ? raters
             : raters.filter(
         (rater) => Number(rater.storeId) === Number(store.id)
        );
        const sortedRaters = sortRows(storeRaters, sort.key, sort.direction);

        return (
          <div className="owner-store-section" key={store.id}>
            <div className="owner-stats">
              <div className="owner-stat-card">
                <p>My Store</p>
                <h3>{store.name}</h3>
              </div>

              <div className="owner-stat-card">
                <p>Average Rating</p>
                <h3>
                  ⭐ {Number(store.averageRating || 0).toFixed(2)}
                </h3>
              </div>

              <div className="owner-stat-card">
                <p>Total Ratings</p>
                <h3>{store.totalRatings ?? 0}</h3>
              </div>
            </div>

            <div className="content-panel">
              <h3>Customer Ratings — {store.name}</h3>

              {storeRaters.length === 0 ? (
                <p>No ratings received yet.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        {[
                          ["name", "Customer Name"],
                          ["email", "Email"],
                          ["rating", "Rating"],
                          ["created_at", "Date"],
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
                      </tr>
                    </thead>

                    <tbody>
                      {sortedRaters.map((rater, index) => (
                        <tr key={`${store.id}-${index}`}>
                          <td>{rater.name}</td>
                          <td>{rater.email}</td>
                          <td>⭐ {rater.rating}/5</td>
                          <td>
                            {rater.created_at
                              ? new Date(
                                  rater.created_at
                                ).toLocaleDateString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OwnerDashboard;