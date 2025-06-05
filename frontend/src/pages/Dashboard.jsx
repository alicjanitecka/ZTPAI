import axios from "axios";
import "../styles/Dashboard.css";
import logo from "../assets/logo.svg";
import homeCare from "../assets/home-care.svg"; 
import sitterCare from "../assets/petsitter-care.svg";
import walkDog from "../assets/dog-walking.svg";
import defaultAvatar from "../assets/default-avatar.svg";
import { FaSearch } from "react-icons/fa";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api";

<Link to="/logout">WYLOGUJ</Link>



function buildServices(p) {
  let arr = [];
  if (p.dog_walking) arr.push("walking the dog");
  if (p.is_cat_sitter) arr.push("cat care");
  if (p.is_dog_sitter) arr.push("dog care");
  return arr.join(", ") || "N/A";
}

function buildLocation(p) {
  let arr = [];
  if (p.care_at_petsitter_home) arr.push("at pet sitter’s home");
  if (p.care_at_owner_home) arr.push("at owner's home");
  return arr.join(" / ") || "N/A";
}

function Dashboard() {
    const [searched, setSearched] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [city, setCity] = useState("");
    const [petType, setPetType] = useState("");
    const [careType, setCareType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [results, setResults] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isPetsitter, setIsPetsitter] = useState(false);
    const [selectedPetsitter, setSelectedPetsitter] = useState(null);
    const handleBookClick = (petsitter) => {
    setSelectedPetsitter(petsitter);
    setShowModal(true);
    };
    const handleConfirmBooking = async () => {
  if (!selectedPetsitter || !startDate || !endDate || !careType) {
    alert("Uzupełnij wszystkie dane rezerwacji!");
    return;
  }
  try {
    const token = localStorage.getItem("access");
    const userId = localStorage.getItem("user_id"); 
    const payload = {
      user: userId,
      petsitter: selectedPetsitter.id,
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
    alert("Wizyta została zarezerwowana!");
    setShowModal(false);
    setSelectedPetsitter(null);
  } catch (err) {
    if (err.response) {
      console.log("Error response data:", err.response.data);
    }
    alert("Błąd podczas rezerwacji wizyty.");
  }
};
const handleCancelBooking = () => {
  setShowModal(false);
  setSelectedPetsitter(null);
};

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearched(true);
        try {
            const params = {};
            if (city) params.city = city;
            if (petType) params.pet_type = petType;
            if (careType) params.care_type = careType;
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            const res = await axios.get("http://localhost:8000/api/v1/petsitters/search/", { params });
            console.log("API response:", res.data);
            setResults(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
        if (err.response) {
                alert("Błąd podczas rezerwacji wizyty.");
            } else {
                alert("Błąd podczas rezerwacji wizyty.");
            }
        }

    };
    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            const decoded = jwtDecode(token);
            setIsAdmin(decoded.role === "admin");
        }
    }, []);
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
    return (
        <div className="dashboard">
            <nav className="top-nav">
                {isAdmin && (
                    <Link to="/admin-users">ADMIN PANEL</Link>
                )}
                <a href="/visits">MY VISITS</a>
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

            <div className="filters-background">
                <form className="filters" onSubmit={handleSearch}>
                    <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    placeholder="Start date"
                    />
                    <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    placeholder="End date"
                    />

                    <input
                        type="text"
                        placeholder="enter the city"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                    />
                    <select value={petType} onChange={e => setPetType(e.target.value)}>
                        <option value="">choose your pet</option>
                        <option value="dog">Dog</option>
                        <option value="cat">Cat</option>
                        <option value="rodent">Rodent</option>
                    </select>
                    <select value={careType} onChange={e => setCareType(e.target.value)}>
                        <option value="">choose care type</option>
                        <option value="dog_walking">Dog walking</option>
                        <option value="care_at_owner_home">Care at owner's home</option>
                        <option value="care_at_petsitter_home">Care at petsitter's home</option>
                    </select>
                    <button className="search-button" type="submit">
                        <FaSearch />
                    </button>
                </form>
            </div>
            {searched && (
            <div className="search-results">
                {results.length === 0 && <p>No petsitters found.</p>}
                {results.map(p => (
                <div key={p.id} className="petsitter-result">
                    <div className="petsitter-avatar">
                        <img src={defaultAvatar} alt="avatar" />
                    </div>
                    <div className="petsitter-info">
                        <div className="petsitter-name-age">
                        {p.username && <span className="petsitter-name">{p.username.toUpperCase()}</span>}
                        {p.age && <span className="petsitter-age">({p.age})</span>}
                        </div>
                        <div className="petsitter-experience">
                        <b>Experience:</b> {p.experience ? `${p.experience} years` : "N/A"}
                        </div>
                        <div className="petsitter-services">
                        <b>Services offered:</b> {p.services || buildServices(p)}
                        </div>
                        <div className="petsitter-location">
                        <b>Service Location:</b> {p.location || buildLocation(p)}
                        </div>
                    </div>
                    <div className="petsitter-action">
                    <button className="book-btn" onClick={() => handleBookClick(p)}>
                    <span className="plus-icon">+</span> book now
                    </button>
                    </div>
                    </div>
                ))}
            </div>
            )}
            {!searched && (
            <div className="services">
                <div className="card">
                    <h3>Care at your home</h3>
                    <img src={homeCare} alt="Care at home" className="card-icon" />
                    <a href="#">Find out more...</a>
                </div>
                <div className="card">
                    <h3>Care at the petsitter’s home</h3>
                    <img src={sitterCare} alt="Petsitter care" className="card-icon" />
                    <a href="#">Find out more...</a>
                </div>
                <div className="card">
                    <h3>Walking the dog</h3>
                    <img src={walkDog} alt="Dog walking" className="card-icon" />
                    <a href="#">Find out more...</a>
                </div>
            </div>
            )}
            {showModal && selectedPetsitter && (
            <div className="modal-overlay">
                <div className="modal">
                <h3>Potwierdź rezerwację</h3>
                <p>
                    Czy na pewno chcesz zarezerwować wizytę u <b>{selectedPetsitter.username}</b>
                    {startDate && <> w dniach <b>{endDate}</b></>}?
                </p>
                <div className="modal-actions">
                    <button onClick={handleConfirmBooking} className="confirm-btn">Tak, rezerwuję</button>
                    <button onClick={handleCancelBooking} className="cancel-btn">Anuluj</button>
                </div>
                </div>
            </div>
            )}
        </div>
    );
}

export default Dashboard;