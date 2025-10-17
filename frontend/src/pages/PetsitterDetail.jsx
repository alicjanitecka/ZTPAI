import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/PetsitterDetail.css";
import defaultAvatar from "../assets/default-avatar.svg";
import { FaArrowLeft, FaMapMarkerAlt, FaDollarSign, FaClock, FaPaw } from "react-icons/fa";
import StarRating from "../components/StarRating";

function getMediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:8000${path}`;
}

function PetsitterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [petsitter, setPetsitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [careType, setCareType] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const fetchPetsitterDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/petsitters/${id}/`);
        setPetsitter(res.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load petsitter details");
        setLoading(false);
      }
    };
    fetchPetsitterDetails();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/reviews/petsitter/?petsitter_id=${id}`);
        setReviews(res.data.results || res.data);
      } catch (err) {
        console.error("Failed to load reviews", err);
      }
      setReviewsLoading(false);
    };
    if (id) {
      fetchReviews();
    }
  }, [id]);

  const handleBooking = async () => {
    if (!startDate || !endDate || !careType) {
      setErrorMessage("Please fill in all booking details!");
      setTimeout(() => setErrorMessage(""), 4000);
      return;
    }

    try {
      const token = localStorage.getItem("access");
      const userId = localStorage.getItem("user_id");
      const payload = {
        user: userId,
        petsitter: petsitter.id,
        care_type: careType,
        start_date: startDate,
        end_date: endDate,
        confirmed: false,
        canceled: false,
        pets: [],
      };
      await axios.post(
        "http://localhost:8000/api/v1/visits/",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage("Visit successfully booked!");
      setTimeout(() => {
        setSuccessMessage("");
        setShowBookingModal(false);
      }, 2000);
    } catch (err) {
      setErrorMessage("Error while booking visit. Please try again.");
      setTimeout(() => setErrorMessage(""), 4000);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  const services = [];
  if (petsitter.is_dog_sitter) services.push("Dog Care");
  if (petsitter.is_cat_sitter) services.push("Cat Care");
  if (petsitter.is_rodent_sitter) services.push("Rodent Care");
  if (petsitter.dog_walking) services.push("Dog Walking");

  const locations = [];
  if (petsitter.care_at_owner_home) locations.push("At owner's home");
  if (petsitter.care_at_petsitter_home) locations.push("At petsitter's home");

  return (
    <div className="petsitter-detail-page">
      {successMessage && (
        <div className="notification success-notification">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="notification error-notification">
          {errorMessage}
        </div>
      )}

      <button className="back-button" onClick={() => navigate("/")}>
        <FaArrowLeft /> Back to Search
      </button>

      <div className="petsitter-detail-container">
        <div className="petsitter-header">
          <div className="petsitter-photo-section">
            <img
              src={petsitter.photo ? getMediaUrl(petsitter.photo) : defaultAvatar}
              alt={petsitter.username}
              className="petsitter-photo-large"
            />
          </div>

          <div className="petsitter-main-info">
            <h1 className="petsitter-name">{petsitter.username || "Unnamed Petsitter"}</h1>

            {/* Rating Display */}
            {petsitter.average_rating > 0 && (
              <div className="info-item rating-display">
                <StarRating rating={petsitter.average_rating} size="medium" />
                <span className="reviews-count">({petsitter.reviews_count} {petsitter.reviews_count === 1 ? 'review' : 'reviews'})</span>
              </div>
            )}

            {petsitter.city && (
              <div className="info-item">
                <FaMapMarkerAlt className="info-icon" />
                <span>{petsitter.city}</span>
              </div>
            )}

            {petsitter.hourly_rate && (
              <div className="info-item rate">
                <FaDollarSign className="info-icon" />
                <span className="rate-value">${petsitter.hourly_rate}/hour</span>
              </div>
            )}

            <button className="book-button" onClick={() => setShowBookingModal(true)}>
              Book Now
            </button>
          </div>
        </div>

        <div className="petsitter-content">
          <div className="detail-card">
            <h2 className="card-title">
              <FaPaw className="card-icon" /> About Me
            </h2>
            <p className="description-text">
              {petsitter.description || "No description provided yet."}
            </p>
          </div>

          <div className="detail-card">
            <h2 className="card-title">Services Offered</h2>
            <div className="services-grid">
              {services.length > 0 ? (
                services.map((service, idx) => (
                  <div key={idx} className="service-badge">
                    {service}
                  </div>
                ))
              ) : (
                <p className="no-data">No services listed</p>
              )}
            </div>
          </div>

          <div className="detail-card">
            <h2 className="card-title">Service Locations</h2>
            <div className="services-grid">
              {locations.length > 0 ? (
                locations.map((location, idx) => (
                  <div key={idx} className="location-badge">
                    {location}
                  </div>
                ))
              ) : (
                <p className="no-data">No locations specified</p>
              )}
            </div>
          </div>

          <div className="detail-card reviews-section">
            <h2 className="card-title">Reviews ({reviews.length})</h2>
            {reviewsLoading ? (
              <p className="loading-text">Loading reviews...</p>
            ) : reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <img
                          src={review.reviewer_photo ? getMediaUrl(review.reviewer_photo) : defaultAvatar}
                          alt={review.reviewer_username}
                          className="reviewer-avatar"
                        />
                        <div className="reviewer-details">
                          <span className="reviewer-name">{review.reviewer_username}</span>
                          <span className="review-date">
                            {new Date(review.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size="small" />
                    </div>
                    {review.comment && (
                      <p className="review-comment">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No reviews yet. Be the first to review this petsitter!</p>
            )}
          </div>
        </div>
      </div>

      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Book a Visit</h2>
            <p className="modal-subtitle">with {petsitter.username}</p>

            <div className="booking-form">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Care Type</label>
                <select
                  value={careType}
                  onChange={(e) => setCareType(e.target.value)}
                  className="form-input"
                >
                  <option value="">Select care type...</option>
                  {petsitter.dog_walking && (
                    <option value="dog_walking">Dog Walking</option>
                  )}
                  {petsitter.care_at_owner_home && (
                    <option value="care_at_owner_home">Care at Owner's Home</option>
                  )}
                  {petsitter.care_at_petsitter_home && (
                    <option value="care_at_petsitter_home">Care at Petsitter's Home</option>
                  )}
                </select>
              </div>

              <div className="modal-actions">
                <button className="confirm-booking-btn" onClick={handleBooking}>
                  Confirm Booking
                </button>
                <button className="cancel-booking-btn" onClick={() => setShowBookingModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PetsitterDetail;
