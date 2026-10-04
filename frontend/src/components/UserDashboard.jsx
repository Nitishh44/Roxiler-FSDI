
import { useEffect, useState } from "react";
import API from "../services/api";
import "./UserDashboard.css";

function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(null);

  const fetchStores = async () => {
    try {
      setError("");

      const response = await API.get("/stores/user");

      setStores(response.data.stores || []);
    } catch (err) {
      console.error("Failed to fetch stores:", err);
      setError(
        err.response?.data?.message || "Failed to load stores."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const submitRating = async (storeId) => {
    const rating = Number(ratings[storeId]);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setMessage("Please select a rating from 1 to 5.");
      return;
    }

    try {
      setSubmitting(storeId);
      setMessage("");

      const response = await API.post("/ratings", {
        store_id: storeId,
        rating,
      });

      setMessage(
        response.data.message || "Rating submitted successfully!"
      );

      await fetchStores();

      setRatings((previous) => {
        const updated = { ...previous };
        delete updated[storeId];
        return updated;
      });
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to submit rating."
      );
    } finally {
      setSubmitting(null);
    }
  };

  const filteredStores = stores.filter(
    (store) =>
      store.name?.toLowerCase().includes(search.toLowerCase()) ||
      store.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="user-stores-page">
      <div className="user-stores-header">
        <div>
          <h2>Explore Stores</h2>
          <p>Discover stores and share your experience.</p>
        </div>

        <span className="user-store-count">
          {stores.length} Stores Available
        </span>
      </div>

      <input
        className="user-store-search"
        placeholder="Search by store name or address..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {message && (
        <p className="user-rating-message">{message}</p>
      )}

      {error && (
        <p className="user-rating-message">{error}</p>
      )}

      {loading ? (
        <p>Loading stores...</p>
      ) : (
        <div className="user-store-grid">
          {filteredStores.map((store) => {
            const averageRating = Number(store.averageRating ?? 0);
            const totalRatings = Number(store.totalRatings ?? 0);
            const myRating = Number(store.myRating ?? 0);

            return (
              <div className="user-store-card" key={store.id}>
                <div className="user-store-icon">⌂</div>

                <h3>{store.name}</h3>

                <p className="user-store-address">
                  {store.address}
                </p>

                <div className="user-store-rating">
                  <span>★</span>
                  {averageRating.toFixed(1)}
                  <small>({totalRatings} ratings)</small>
                </div>

                <div className="rating-section">
                  <label>Your Rating</label>

                  <div className="rating-options">
                    {[1, 2, 3, 4, 5].map((number) => (
                      <button
                        type="button"
                        key={number}
                        className={
                          Number(ratings[store.id] ?? myRating) >= number
                            ? "rating-star selected"
                            : "rating-star"
                        }
                        onClick={() =>
                          setRatings((previous) => ({
                            ...previous,
                            [store.id]: number,
                          }))
                        }
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <button
                    className="submit-rating-button"
                    disabled={submitting === store.id}
                    onClick={() => submitRating(store.id)}
                  >
                    {submitting === store.id
                      ? "Saving..."
                      : myRating
                      ? "Update Rating"
                      : "Submit Rating"}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredStores.length === 0 && (
            <p>No stores found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default UserDashboard;

