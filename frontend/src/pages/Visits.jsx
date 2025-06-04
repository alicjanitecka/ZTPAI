import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import logo from "../assets/logo.svg";
import defaultAvatar from "../assets/default-avatar.svg";
import { ACCESS_TOKEN } from "../constants";
import { Link } from "react-router-dom";
import api from "../api";

<Link to="/logout">LOGOUT</Link>

function Visits() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPetsitter, setIsPetsitter] = useState(false);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      const res = await axios.get("http://localhost:8000/api/my-visits/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVisits(res.data);
    } catch (err) {
      alert("Błąd podczas pobierania wizyt");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) return;
      try {
        const res = await api.get("/api/profile/", {
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
      await axios.patch(`http://localhost:8000/api/visits/${id}/`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVisits(); 
    } catch (err) {
      alert("Błąd podczas aktualizacji wizyty");
    }
  };

  return (
    <div className="dashboard">
      <nav className="top-nav">
        <Link to="/">HOME</Link>
        <Link to="/visits">MY VISITS</Link>
        {!isPetsitter && (
           <Link to="/join-petsitter">JOIN AS PETSITTER</Link>
        )}
        <a href="/account">MY ACCOUNT</a>
        <a href="/logout">LOGOUT</a>
      </nav>
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="PetZone Logo" className="logo" />
        </div>
      </header>
      <h2 style={{textAlign: "center", marginTop: 30}}>MY VISITS</h2>
      <div className="search-results">
        {loading && <p>Loading...</p>}
        {!loading && visits.length === 0 && <p>No visits.</p>}
        {visits.map(v => (
          <div key={v.id} className="petsitter-result">
            <div className="petsitter-avatar">
              <img src={defaultAvatar} alt="avatar" />
            </div>
            <div className="petsitter-info">
              <div className="petsitter-name-age">
                <span className="petsitter-name">
                  {v.user_username || v.petsitter_username}
                </span>
              </div>
              <div>
                <b>Care type:</b> {v.care_type}
              </div>
              <div>
                <b>Date:</b> {v.start_date} - {v.end_date}
              </div>
              <div>
                <b>Status:</b>{" "}
                {v.canceled
                  ? "Anulowana"
                  : v.confirmed
                  ? "Potwierdzona"
                  : "Oczekuje"}
              </div>
              <div>
                <b>Pets:</b> {(v.pets && v.pets.length > 0) ? v.pets.join(", ") : "brak"}
              </div>
            </div>
            <div className="petsitter-action">
              {!v.canceled && !v.confirmed && (
                <>
                  <button
                    className="book-btn"
                    onClick={() => updateVisit(v.id, { confirmed: true })}
                  >
                    Confirm
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => updateVisit(v.id, { canceled: true })}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Visits;
