import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Visits.css";
import logo from "../assets/logo.svg";
import defaultAvatar from "../assets/default-avatar.svg";
import { ACCESS_TOKEN } from "../constants";
import { Link } from "react-router-dom";
import api from "../api";
import { FaSearch, FaFilter } from "react-icons/fa";

function Visits() {
  const [visits, setVisits] = useState({ results: [] });
  const [loading, setLoading] = useState(true);
  const [isPetsitter, setIsPetsitter] = useState(false);
  const [activeTab, setActiveTab] = useState("owner"); // "owner" or "petsitter"
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "pending", "confirmed", "canceled"
  const [sortBy, setSortBy] = useState("date_desc"); // "date_asc", "date_desc"

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
      <nav className="top-nav">
        <Link to="/">HOME</Link>
        <Link to="/visits">MY VISITS</Link>
        {!isPetsitter && <Link to="/join-petsitter">JOIN AS PETSITTER</Link>}
        <Link to="/account">MY ACCOUNT</Link>
        <Link to="/logout">LOGOUT</Link>
      </nav>

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
    </div>
  );
}

export default Visits;
