import React, {useState} from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import logo from "../assets/logo.svg";
import homeCare from "../assets/home-care.svg"; 
import sitterCare from "../assets/petsitter-care.svg";
import walkDog from "../assets/dog-walking.svg";
import defaultAvatar from "../assets/default-avatar.svg";
import { FaSearch } from "react-icons/fa";

const [showModal, setShowModal] = useState(false);
const [selectedPetsitter, setSelectedPetsitter] = useState(null);
const handleBookClick = (petsitter) => {
  setSelectedPetsitter(petsitter);
  setShowModal(true);
};
const handleConfirmBooking = async () => {
  if (!selectedPetsitter) return;
  try {
    // Przykład payloadu, dostosuj do swojego modelu!
    const payload = {
      petsitter_id: selectedPetsitter.id,
      date, // z Twojego stanu filtra
      // Możesz dodać inne pola, np. user_id, pet_type, itp.
    };
    await axios.post("http://localhost:8000/api/visits/", payload);
    alert("Wizyta została zarezerwowana!");
    setShowModal(false);
    setSelectedPetsitter(null);
  } catch (err) {
    alert("Błąd podczas rezerwacji wizyty.");
  }
};
const handleCancelBooking = () => {
  setShowModal(false);
  setSelectedPetsitter(null);
};

function buildServices(p) {
  let arr = [];
  if (p.dog_walking) arr.push("walking the dog");
  if (p.is_cat_sitter) arr.push("cat care");
  if (p.is_dog_sitter) arr.push("dog care");
  // Dodaj inne usługi zgodnie z modelem
  return arr.join(", ") || "N/A";
}

function buildLocation(p) {
  let arr = [];
  if (p.care_at_petsitter_home) arr.push("at pet sitter’s home");
  if (p.care_at_owner_home) arr.push("at owner's home");
  // Dodaj inne lokalizacje, jeśli są
  return arr.join(" / ") || "N/A";
}

function Dashboard() {
    const [searched, setSearched] = useState(false);

    const [city, setCity] = useState("");
    const [petType, setPetType] = useState("");
    const [careType, setCareType] = useState("");
    const [date, setDate] = useState("");
    const [results, setResults] = useState([]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearched(true);
        try {
            const params = {};
            if (city) params.city = city;
            if (petType) params.pet_type = petType;
            if (careType) params.care_type = careType;
            if (date) params.date = date;
            const res = await axios.get("http://localhost:8000/api/petsitters/search/", { params });
            console.log("API response:", res.data);
            setResults(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            alert("Błąd podczas wyszukiwania petsitterów");
            setResults([])
        }
    };

    return (
        <div className="dashboard">
<nav className="top-nav">

                <a href="#">MOJE WIZYTY</a>
                <a href="#">DOŁĄCZ JAKO PETSITTER</a>
                <a href="#">MOJE KONTO</a>
                <a href="#">WYLOGUJ</a>
            </nav>

            <header className="header">
                <div className="logo-container">
                    <img src={logo} alt="PetZone Logo" className="logo" />
                </div>
            </header>

            <div className="filters-background">
                <form className="filters" onSubmit={handleSearch}>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    {/* Możesz dodać drugi date picker jeśli chcesz zakres */}
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
        </div>
    );
}
{showModal && selectedPetsitter && (
  <div className="modal-overlay">
    <div className="modal">
      <h3>Potwierdź rezerwację</h3>
      <p>
        Czy na pewno chcesz zarezerwować wizytę u <b>{selectedPetsitter.username}</b>
        {date && <> na dzień <b>{date}</b></>}?
      </p>
      <div className="modal-actions">
        <button onClick={handleConfirmBooking} className="confirm-btn">Tak, rezerwuję</button>
        <button onClick={handleCancelBooking} className="cancel-btn">Anuluj</button>
      </div>
    </div>
  </div>
)}

export default Dashboard;