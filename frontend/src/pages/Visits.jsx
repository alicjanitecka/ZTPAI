import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import logo from "../assets/logo.svg";
import defaultAvatar from "../assets/default-avatar.svg";
import { ACCESS_TOKEN } from "../constants";
import { Link } from "react-router-dom";

<Link to="/logout">WYLOGUJ</Link>

function Visits() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Potwierdzenie/Anulowanie
  const updateVisit = async (id, data) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    try {
      await axios.patch(`http://localhost:8000/api/visits/${id}/`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVisits(); // odśwież listę
    } catch (err) {
      alert("Błąd podczas aktualizacji wizyty");
    }
  };

  return (
    <div className="dashboard">
      <nav className="top-nav">
        <Link to="/">HOME</Link>
        <Link to="/visits">MOJE WIZYTY</Link>
        <a href="join-petsitter">DOŁĄCZ JAKO PETSITTER</a>
        <a href="#">MOJE KONTO</a>
        <a href="/logout">WYLOGUJ</a>
      </nav>
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="PetZone Logo" className="logo" />
        </div>
      </header>
      <h2 style={{textAlign: "center", marginTop: 30}}>Moje wizyty</h2>
      <div className="search-results">
        {loading && <p>Ładowanie wizyt...</p>}
        {!loading && visits.length === 0 && <p>Brak wizyt.</p>}
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
                <b>Typ opieki:</b> {v.care_type}
              </div>
              <div>
                <b>Data:</b> {v.start_date} - {v.end_date}
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
                    Potwierdź
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => updateVisit(v.id, { canceled: true })}
                  >
                    Anuluj
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
