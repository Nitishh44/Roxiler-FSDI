import { useEffect, useState } from "react";
import API from "../services/api";
import "./OwnerDashboard.css";

function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <div className="content-panel">{error}</div>;
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
                        <th>Customer Name</th>
                        <th>Email</th>
                        <th>Rating</th>
                        <th>Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {storeRaters.map((rater, index) => (
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