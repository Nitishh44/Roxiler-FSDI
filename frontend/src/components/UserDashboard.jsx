import { useEffect, useState } from "react";
import API from "../services/api";
import "./UserDashboard.css";

function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const [message, setMessage] = useState("");

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get("/stores/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStores(response.data.stores || response.data);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const submitRating = async (storeId) => {
    const rating = Number(ratings[storeId]);

    if (!rating || rating < 1 || rating > 5) {
      setMessage("Please select a rating from 1 to 5.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await API.post(
        "/ratings",
        { store_id: storeId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Rating submitted successfully!");
      await fetchStores();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to submit rating."
      );
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

      {message && <p className="user-rating-message">{message}</p>}

      {loading ? (
        <p>Loading stores...</p>
      ) : (
        <div className="user-store-grid">
          {filteredStores.map((store) => (
            <div className="user-store-card" key={store.id}>
              <div className="user-store-icon">⌂</div>

              <h3>{store.name}</h3>
              <p className="user-store-address">{store.address}</p>

              <div className="user-store-rating">
                <span>★</span>
                {Number(store.average_rating ?? store.avg_rating ?? 0).toFixed(1)}
                <small>({store.rating_count ?? 0} ratings)</small>
              </div>

              <div className="rating-section">
                <label>Your Rating</label>

                <div className="rating-options">
                  {[1, 2, 3, 4, 5].map((number) => (
                    <button
                      type="button"
                      key={number}
                      className={
                        Number(ratings[store.id] ?? store.myRating ?? 0) >= number
                          ? "rating-star selected"
                          : "rating-star"
                      }
                      onClick={() =>
                        setRatings({ ...ratings, [store.id]: number })
                      }
                    >
                      ★
                    </button>
                  ))}
                </div>

                <button
                  className="submit-rating-button"
                  onClick={() => submitRating(store.id)}
                >
                  {store.myRating ? "Update Rating" : "Submit Rating"}
                </button>
              </div>
            </div>
          ))}

          {filteredStores.length === 0 && (
            <p>No stores found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default UserDashboard;