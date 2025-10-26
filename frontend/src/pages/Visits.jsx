import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Visits.css";
import logo from "../assets/logo.svg";
import defaultAvatar from "../assets/default-avatar.svg";
import { ACCESS_TOKEN } from "../constants";
import { Link } from "react-router-dom";
import api from "../api";
import { FaSearch, FaFilter } from "react-icons/fa";
import StarRating from "../components/StarRating";
import Navbar from "../components/Navbar";

function Visits() {
  const [visits, setVisits] = useState({ results: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("owner"); // "owner" or "petsitter"
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "pending", "confirmed", "canceled"
  const [sortBy, setSortBy] = useState("date_desc"); // "date_asc", "date_desc"
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedVisitForReview, setSelectedVisitForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPetsitter, setIsPetsitter] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const fetchVisits = async (url = null) => {
    setLoading(true);
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      let endpoint = url;
      if (!endpoint) {
        if (activeTab === "owner") {
          endpoint = "http://localhost:8000/api/v1/my-visits/as-owner/";
        } else {
          endpoint = "http://localhost:8000/api/v1/my-visits/as-petsitter/";
        }
      }
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVisits(res.data);
    } catch (err) {
      console.error("Error fetching visits:", err);
      alert("Error loading visits");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVisits();
  }, [activeTab]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) return;
      try {
        const res = await api.get("/api/v1/profile/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsPetsitter(res.data.is_petsitter || false);
      } catch (err) {
        setIsPetsitter(false);
      }
    };
    fetchProfile();
  }, []);

  const updateVisit = async (id, data) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    try {
      await axios.patch(`http://localhost:8000/api/v1/visits/${id}/`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVisits();
    } catch (err) {
      alert("Error updating visit");
    }
  };

  const handleReviewClick = (visit) => {
    setSelectedVisitForReview(visit);
    setReviewRating(0);
    setReviewComment("");
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      setErrorMessage("Please select a rating");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    const token = localStorage.getItem(ACCESS_TOKEN);
    try {
      if (editingReview) {
        // Update existing review
        await axios.patch(
          `http://localhost:8000/api/v1/reviews/${editingReview.id}/`,
          {
            rating: reviewRating,
            comment: reviewComment,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccessMessage("Review updated successfully!");
      } else {
        // Create new review
        await axios.post(
          "http://localhost:8000/api/v1/reviews/",
          {
            visit: selectedVisitForReview.id,
            petsitter: selectedVisitForReview.petsitter,
            rating: reviewRating,
            comment: reviewComment,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccessMessage("Review submitted successfully!");
      }
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowReviewModal(false);
      setSelectedVisitForReview(null);
      setEditingReview(null);
      setReviewRating(0);
      setReviewComment("");
      fetchVisits(); // Refresh to show review was added/updated
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Error submitting review");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleEditReview = (visit) => {
    setSelectedVisitForReview(visit);
    setEditingReview(visit.review);
    setReviewRating(visit.review.rating);
    setReviewComment(visit.review.comment || "");
    setShowReviewModal(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    const token = localStorage.getItem(ACCESS_TOKEN);
    try {
      await axios.delete(
        `http://localhost:8000/api/v1/reviews/${reviewId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage("Review deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchVisits(); // Refresh
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Error deleting review");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const isPastVisit = (endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const visitEnd = new Date(endDate);
    visitEnd.setHours(0, 0, 0, 0);
    return visitEnd < today;
  };

  // Filtering and sorting logic
  const getFilteredAndSortedVisits = () => {
    let filtered = Array.isArray(visits?.results) ? [...visits.results] : [];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((v) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          v.user_username?.toLowerCase().includes(searchLower) ||
          v.petsitter_username?.toLowerCase().includes(searchLower) ||
          v.care_type?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((v) => {
        if (statusFilter === "pending") return !v.confirmed && !v.canceled;
        if (statusFilter === "confirmed") return v.confirmed && !v.canceled;
        if (statusFilter === "canceled") return v.canceled;
        return true;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);
      if (sortBy === "date_asc") return dateA - dateB;
      return dateB - dateA; // date_desc
    });

    return filtered;
  };

  const displayedVisits = getFilteredAndSortedVisits();

  return (
    <div className="visits-page">
      <Navbar />

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

      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="PetZone Logo" className="logo" />
        </div>
      </header>

      <div className="visits-container">
        <h1 className="visits-title">MY VISITS</h1>

        {/* Tabs for petsitters */}
        {isPetsitter && (
          <div className="visits-tabs">
            <button
              className={`tab-button ${activeTab === "owner" ? "active" : ""}`}
              onClick={() => setActiveTab("owner")}
            >
              My Bookings
            </button>
            <button
              className={`tab-button ${activeTab === "petsitter" ? "active" : ""}`}
              onClick={() => setActiveTab("petsitter")}
            >
              Received Bookings
            </button>
          </div>
        )}

        {/* Filters and Search */}
        <div className="visits-filters">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or care type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="canceled">Canceled</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Visits List */}
        <div className="visits-list">
          {loading && <p className="loading-message">Loading...</p>}
          {!loading && displayedVisits.length === 0 && (
            <p className="no-visits-message">No visits found.</p>
          )}
          {!loading &&
            displayedVisits.map((v) => {
              const isPast = isPastVisit(v.end_date);
              return (
                <div
                  key={v.id}
                  className={`visit-card ${isPast ? "past-visit" : ""} ${
                    v.canceled ? "canceled-visit" : ""
                  }`}
                >
                  <div className="visit-avatar">
                    <img src={defaultAvatar} alt="avatar" />
                  </div>

                  <div className="visit-info">
                    <div className="visit-header">
                      <span className="visit-name">
                        {activeTab === "owner"
                          ? `Petsitter: ${v.petsitter_username || "N/A"}`
                          : `Owner: ${v.user_username || "N/A"}`}
                      </span>
                      <span
                        className={`visit-status ${
                          v.canceled
                            ? "status-canceled"
                            : v.confirmed
                            ? "status-confirmed"
                            : "status-pending"
                        }`}
                      >
                        {v.canceled ? "Canceled" : v.confirmed ? "Confirmed" : "Pending"}
                      </span>
                    </div>

                    <div className="visit-details">
                      <div className="visit-detail-item">
                        <strong>Care Type:</strong> {v.care_type?.replace(/_/g, " ") || "N/A"}
                      </div>
                      <div className="visit-detail-item">
                        <strong>Dates:</strong> {v.start_date} - {v.end_date}
                      </div>
                      {v.pets && v.pets.length > 0 && (
                        <div className="visit-detail-item">
                          <strong>Pets:</strong> {v.pets.join(", ")}
                        </div>
                      )}
                      {isPast && (
                        <div className="visit-detail-item past-label">
                          <strong>This visit is in the past</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="visit-actions">
                    {!v.canceled && !v.confirmed && !isPast && (
                      <>
                        <button
                          className="action-btn confirm-btn"
                          onClick={() => updateVisit(v.id, { confirmed: true })}
                        >
                          Confirm
                        </button>
                        <button
                          className="action-btn cancel-visit-btn"
                          onClick={() => updateVisit(v.id, { canceled: true })}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {/* Show review button only for past, confirmed visits where user is owner */}
                    {isPast && v.confirmed && !v.canceled && activeTab === "owner" && !v.review && (
                      <button
                        className="action-btn review-btn"
                        onClick={() => handleReviewClick(v)}
                      >
                        Leave Review
                      </button>
                    )}
                    {/* Show if review already exists with Edit/Delete options */}
                    {v.review && activeTab === "owner" && (
                      <div className="review-actions">
                        <span className="review-exists-label">Review submitted</span>
                        <div className="review-btn-group">
                          <button
                            className="action-btn edit-review-btn"
                            onClick={() => handleEditReview(v)}
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn delete-review-btn"
                            onClick={() => handleDeleteReview(v.review.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Pagination */}
        {!loading && (visits.previous || visits.next) && (
          <div className="pagination">
            {visits.previous && (
              <button onClick={() => fetchVisits(visits.previous)} className="pagination-btn">
                Previous
              </button>
            )}
            {visits.next && (
              <button onClick={() => fetchVisits(visits.next)} className="pagination-btn">
                Next
              </button>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedVisitForReview && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editingReview ? 'Edit Review' : 'Leave a Review'}</h2>
            <p className="modal-subtitle">
              for {selectedVisitForReview.petsitter_username}
            </p>

            <div className="review-form">
              <div className="form-group">
                <label>Rating</label>
                <div className="rating-selector">
                  <StarRating
                    rating={reviewRating}
                    interactive={true}
                    onRatingChange={setReviewRating}
                    size="large"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Comment (optional)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="review-textarea"
                  rows={5}
                />
              </div>

              <div className="modal-actions">
                <button className="confirm-booking-btn" onClick={handleSubmitReview}>
                  {editingReview ? 'Update Review' : 'Submit Review'}
                </button>
                <button
                  className="cancel-booking-btn"
                  onClick={() => {
                    setShowReviewModal(false);
                    setEditingReview(null);
                    setReviewRating(0);
                    setReviewComment("");
                  }}
                >
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

export default Visits;
